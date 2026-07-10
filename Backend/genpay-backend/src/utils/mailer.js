import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromFormat = `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`;

const C = {
  navy: '#102A43',
  teal: '#0F766E',
  slate: '#374151',
  tealLight: '#14B8A6',
  navyLight: '#1E3A5F',
};

const wrapper = (content) => `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(16,42,67,0.08);">
          <tr>
            <td style="background: ${C.navy}; padding: 32px 0; text-align: center;">
              <span style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">Genvori</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 36px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background: ${C.navy}; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Genvori.tech — All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const sendOtpEmail = async (email, name, otpCode) => {
  const htmlContent = wrapper(`
    <h2 style="color: ${C.navy}; font-size: 22px; margin: 0 0 8px 0;">Verifikasi Akun</h2>
    <p style="color: ${C.slate}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Halo <strong style="color: ${C.navy};">${name}</strong>,<br>
      Masukkan kode berikut untuk mengaktifkan akun Genvori Anda.
    </p>
    <div style="text-align: center; margin: 0 0 24px 0;">
      <span style="display: inline-block; font-size: 34px; font-weight: 800; color: ${C.teal}; letter-spacing: 12px; background: #f0fdfa; padding: 16px 32px; border-radius: 10px; border: 1px solid ${C.tealLight};">${otpCode}</span>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
      Kode ini bersifat rahasia dan hanya berlaku untuk sesi ini. Jangan membagikannya kepada siapa pun.
    </p>
  `);

  return await resend.emails.send({
    from: fromFormat,
    to: [email],
    subject: 'Kode Verifikasi Akun Genvori',
    html: htmlContent,
  });
};

const sendResendOtpEmail = async (email, name, otpCode) => {
  const htmlContent = wrapper(`
    <h2 style="color: ${C.navy}; font-size: 22px; margin: 0 0 8px 0;">Kode OTP Baru</h2>
    <p style="color: ${C.slate}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Halo <strong style="color: ${C.navy};">${name}</strong>,<br>
      Berikut adalah kode OTP terbaru untuk akun Genvori Anda.
    </p>
    <div style="text-align: center; margin: 0 0 24px 0;">
      <span style="display: inline-block; font-size: 34px; font-weight: 800; color: ${C.navy}; letter-spacing: 12px; background: #f0fdfa; padding: 16px 32px; border-radius: 10px; border: 1px solid ${C.tealLight};">${otpCode}</span>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
      Kode ini menggantikan kode sebelumnya. Jangan berikan kepada siapa pun.
    </p>
  `);

  return await resend.emails.send({
    from: fromFormat,
    to: [email],
    subject: 'Kirim Ulang — Kode Verifikasi Genvori',
    html: htmlContent,
  });
};

const sendResetOtpEmail = async (email, name, otpCode) => {
  const htmlContent = wrapper(`
    <h2 style="color: ${C.navy}; font-size: 22px; margin: 0 0 8px 0;">Reset Password</h2>
    <p style="color: ${C.slate}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Halo <strong style="color: ${C.navy};">${name}</strong>,<br>
      Gunakan kode OTP berikut untuk melanjutkan proses reset password akun Genvori Anda.
    </p>
    <div style="text-align: center; margin: 0 0 24px 0;">
      <span style="display: inline-block; font-size: 34px; font-weight: 800; color: ${C.navy}; letter-spacing: 12px; background: #f0fdfa; padding: 16px 32px; border-radius: 10px; border: 1px solid ${C.tealLight};">${otpCode}</span>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
      Kode ini bersifat rahasia dan hanya berlaku untuk sesi reset password ini.
    </p>
  `);

  return await resend.emails.send({
    from: fromFormat,
    to: [email],
    subject: 'Kode Reset Password — Genvori',
    html: htmlContent,
  });
};

const sendPasswordResetEmail = async (email, resetLink) => {
  const htmlContent = wrapper(`
    <h2 style="color: ${C.navy}; font-size: 22px; margin: 0 0 8px 0;">Reset Password</h2>
    <p style="color: ${C.slate}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Hello!<br>
      You are receiving this email because we received a password reset request for your Genvori account.
    </p>
    <div style="text-align: center; margin: 0 0 24px 0;">
      <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: ${C.teal}; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 15px;">Reset Password</a>
    </div>
    <p style="color: #dc2626; font-size: 13px; text-align: center; margin: 0 0 0 0; font-weight: 500;">
      Link ini akan kedaluwarsa dalam 60 menit.
    </p>
  `);

  return await resend.emails.send({
    from: fromFormat,
    to: [email],
    subject: 'Reset Password — Genvori',
    html: htmlContent,
  });
};

export { sendOtpEmail, sendResendOtpEmail, sendPasswordResetEmail, sendResetOtpEmail };
