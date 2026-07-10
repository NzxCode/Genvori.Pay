/*
  controllers/authController.js
  -----------------------------
  Menangani request/response untuk endpoint autentikasi dengan mendelegasikan ke authService.
*/

import * as authService from '../services/authService.js';

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id || req.user.user_id;
    const profile = await authService.getProfile(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    await authService.register(req, res);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    await authService.login(req, res);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req, res);
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    await authService.verifyOtp(req, res);
  } catch (error) {
    next(error);
  }
}

export async function resendOtp(req, res, next) {
  try {
    await authService.resendOtp(req, res);
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req, res);
  } catch (error) {
    next(error);
  }
}

export async function verifyResetOtp(req, res, next) {
  try {
    await authService.verifyResetOtp(req, res);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req, res);
  } catch (error) {
    next(error);
  }
}

export async function setPin(req, res, next) {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required' });
    
    const result = await authService.setPin(req.user.id, pin);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

export async function loginWithPin(req, res, next) {
  try {
    await authService.loginWithPin(req, res);
  } catch (error) {
    next(error);
  }
}
