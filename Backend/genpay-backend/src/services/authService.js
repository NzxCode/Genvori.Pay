/*
  services/authService.js
  -----------------------
  Logika interaksi dengan Supabase Auth untuk registrasi, login, logout.
  Cara implementasi:
    - register:  Gunakan supabase.auth.signUp() untuk buat user,
                 lalu insert profile ke tabel 'profiles' (id, email, name, role, created_at).
    - login:     Gunakan supabase.auth.signInWithPassword().
    - logout:    Gunakan supabase.auth.admin.signOut() atau revoke token.
*/
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { sendOtpEmail, sendResendOtpEmail, sendPasswordResetEmail, sendResetOtpEmail } from '../utils/mailer.js';
import * as walletService from './walletService.js';

const calculateAge = (dob) => {
  const diff_ms = Date.now() - new Date(dob).getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

const JWT_SECRET = process.env.JWT_SECRET;

export async function register(req, res) {
  try {
    const { name, full_name, email, gender, date_of_birth, password, role } = req.body;

    const allowedRoles = ['merchant', 'user'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Role tidak valid. Pendaftaran hanya diperbolehkan untuk user atau merchant.' 
      });
    }

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const { data: user, error: userError } = await supabase.from('users').insert([{
      name, full_name, email, gender, date_of_birth, role,
      password: hashedPassword,
      status: 'verifikasi uncomplete',
      otp_code: otpCode
    }]).select().single();

    if (userError) throw userError;

    const { error: profileError } = await supabase.from('profiles').insert([{
      user_id: user.id,
      weight: 0, height: 0, age: calculateAge(date_of_birth),
      gender, activity_level: 'sedentary'
    }]);

    if (profileError) {
      await supabase.from('users').delete().eq('id', user.id);
      throw profileError;
    }

    // Create default wallet 'cash'
    try {
      await walletService.createWallet(user.id, { name: 'cash' });
    } catch (walletError) {
      console.error('Error creating default wallet:', walletError);
      // We don't throw here to avoid failing registration if only wallet creation fails, 
      // but in a real system you might want to handle this more strictly.
    }

    await sendOtpEmail(email, name, otpCode);

    return res.status(201).json({
      status: 'pending_verification',
      message: 'Registrasi berhasil! Link verifikasi telah dikirim ke email Anda.',
      email: user.email
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data.', error: error.message });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp_code } = req.body;

    const { data: user, error } = await supabase.from('users').select('*, profiles(*)').eq('email', email).single();

    if (!user || error) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    if (user.status === 'verifikasi complete') return res.status(400).json({ message: 'Akun ini sudah diverifikasi sebelumnya.' });
    if (user.otp_code !== otp_code) return res.status(400).json({ message: 'Kode verifikasi salah.' });

    await supabase.from('users').update({ status: 'verifikasi complete', otp_code: null }).eq('id', user.id);

    const token = jwt.sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      status: 'success',
      message: 'Email berhasil diverifikasi! Anda telah login.',
      access_token: token,
      token_type: 'Bearer',
    });

  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan sistem.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase.from('users').select('*, profiles(*)').eq('email', email).single();

    if (!user || error) return res.status(401).json({ message: 'Email atau password salah.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Email atau password salah.' });

    if (user.status === 'verifikasi uncomplete') {
      return res.status(403).json({
        status: 'unverified',
        message: 'Akun Anda belum diverifikasi. Silakan masukkan kode OTP.',
        email: user.email
      });
    }

    const token = jwt.sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const sessionId = crypto.randomBytes(20).toString('hex');

    await supabase.from('sessions').insert([{
      id: sessionId,
      user_id: user.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      payload: Buffer.from(JSON.stringify({ user_id: user.id })).toString('base64'),
    }]);

    return res.status(200).json({
      access_token: token,
      session_id: sessionId,
      token_type: 'Bearer',
    });

  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan sistem.', error: error.message });
  }
}

export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email wajib diisi.' });

    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error || !user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    if (user.status === 'verifikasi complete') return res.status(400).json({ message: 'Akun ini sudah diverifikasi. Anda bisa langsung login.' });

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: updateError } = await supabase.from('users').update({ otp_code: newOtpCode }).eq('id', user.id);
    if (updateError) throw updateError;

    await sendResendOtpEmail(user.email, user.name, newOtpCode);

    return res.status(200).json({ status: 'success', message: 'Kode OTP baru berhasil dikirim ke email Anda.' });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal mengirim ulang OTP', error: err.message });
  }
}

export async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const sessionId = req.headers['x-session-id'] || req.body?.session_id;
    let userId = req.user?.id || req.user?.user_id;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.user_id;
      } catch (err) {
        // Token could be expired, we'll continue using sessionId if available
      }
    }

    if (sessionId) {
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
      if (error) throw error;
    } else if (userId) {
      const { error } = await supabase.from('sessions').delete().eq('user_id', userId);
      if (error) throw error;
    } else {
      return res.status(400).json({ message: 'Sesi tidak valid atau Authorization token diperlukan.' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Logout berhasil! Sesi Anda telah dihapus.'
    });
  } catch (error) {
    console.error('[LOGOUT ERROR]', error);
    return res.status(500).json({ message: 'Terjadi kesalahan sistem saat logout.', error: error.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email wajib diisi.' });

    const { data: user, error } = await supabase.from('users').select('name, email').eq('email', email).single();
    if (error || !user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const { error: updateError } = await supabase.from('users').update({ otp_code: resetOtp }).eq('email', email);
    if (updateError) throw updateError;

    await sendResetOtpEmail(user.email, user.name, resetOtp);

    return res.status(200).json({ status: 'success', message: 'Kode reset password telah dikirim ke email Anda.' });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal memproses permintaan reset password.', error: error.message });
  }
}

export async function verifyResetOtp(req, res) {
  try {
    const { email, otp_code } = req.body;
    if (!email || !otp_code) return res.status(400).json({ message: 'Email dan OTP wajib diisi.' });

    const { data: user, error } = await supabase.from('users').select('id, email').eq('email', email).eq('otp_code', otp_code).single();

    if (error || !user) return res.status(400).json({ message: 'Kode OTP salah atau sudah kedaluwarsa.' });

    // Generate temporary token for password reset (expires in 15 mins)
    const resetToken = jwt.sign({ user_id: user.id, email: user.email, purpose: 'reset_password' }, JWT_SECRET, { expiresIn: '15m' });

    return res.status(200).json({
      status: 'success',
      message: 'OTP terverifikasi. Silakan buat password baru.',
      reset_token: resetToken
    });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan sistem.' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token dan password baru wajib diisi.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.purpose !== 'reset_password') return res.status(403).json({ message: 'Token tidak valid untuk reset password.' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase.from('users').update({ password: hashedPassword, otp_code: null }).eq('id', decoded.user_id);

    if (error) throw error;

    return res.status(200).json({ status: 'success', message: 'Password berhasil diperbarui. Silakan login kembali.' });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal memperbarui password.', error: error.message });
  }
}

export async function getProfile(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, full_name, email, gender, date_of_birth, role, status, profiles(*)')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user;
}

export async function setPin(userId, pin) {
  if (!pin || pin.length !== 6) {
    throw new Error('PIN must be exactly 6 digits');
  }

  const hashedPin = await bcrypt.hash(pin, 12);
  const { error } = await supabase
    .from('users')
    .update({ pin: hashedPin, pin_enabled: true })
    .eq('id', userId);

  if (error) throw error;
  return { success: true, message: 'Application PIN activated successfully' };
}

export async function loginWithPin(req, res) {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) {
      return res.status(400).json({ message: 'Email and PIN are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ message: 'User not found' });
    if (!user.pin_enabled) return res.status(403).json({ message: 'Application PIN is not enabled' });

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) return res.status(401).json({ message: 'Invalid PIN' });

    if (user.status === 'verifikasi uncomplete') {
      return res.status(403).json({
        status: 'unverified',
        message: 'Akun Anda belum diverifikasi. Silakan masukkan kode OTP.',
        email: user.email
      });
    }

    const token = jwt.sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const sessionId = crypto.randomBytes(20).toString('hex');

    await supabase.from('sessions').insert([{
      id: sessionId,
      user_id: user.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      payload: Buffer.from(JSON.stringify({ user_id: user.id })).toString('base64'),
    }]);

    return res.status(200).json({
      access_token: token,
      session_id: sessionId,
      token_type: 'Bearer',
    });

  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan sistem.', error: error.message });
  }
}

