/*
  errorHandler.js
  ---------------
  Middleware global penangkap error untuk Express.
  Cara implementasi:
    - Tangkap semua error yang dilempar (throw) atau diteruskan via next(err).
    - Jika error dari Supabase/Midtrans, peta ke kode HTTP yang sesuai.
    - Log error ke console (atau service monitoring).
    - Return response JSON standar: { success: false, error: { message, code, ... } }
*/

export function errorHandler(err, req, res, _next) {
  /*
    1. console.error(err) untuk debugging.
    2. Tentukan status code:
       - err.statusCode jika sudah di-set
       - err.status jika dari express
       - 500 sebagai default
    3. Susun response object: { success: false, error: { message: err.message } }
    4. res.status(statusCode).json(response)
  */
  const statusCode = err.statusCode || err.status || 500
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
    },
  })
}
