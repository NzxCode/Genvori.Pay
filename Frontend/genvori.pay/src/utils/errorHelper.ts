// src/utils/errorHelper.ts
export const getFriendlyErrorMessage = (message: string): string => {
  const msg = message?.toLowerCase() || '';

  if (msg.includes('invalid pin')) {
    return 'Maaf, PIN yang Anda masukkan salah. Silakan coba lagi.';
  }
  if (msg.includes('user not found') || msg.includes('pengguna tidak ditemukan')) {
    return 'Akun tidak ditemukan. Silakan periksa kembali email Anda.';
  }
  if (msg.includes('otp invalid') || msg.includes('kode otp salah')) {
    return 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.';
  }
  if (msg.includes('email already exists') || msg.includes('email sudah terdaftar')) {
    return 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.';
  }
  if (msg.includes('unauthorized') || msg.includes('tidak terotorisasi')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  if (msg.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.';
  }

  return message || 'Terjadi kesalahan. Silakan coba beberapa saat lagi.';
};
