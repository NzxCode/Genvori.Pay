import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export async function authenticate(req, res, next) {
  try {
    // 1. Baca header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Authorization token required' } 
      })
    }

    // 2. Parse bearer token
    const token = authHeader.split(' ')[1]

    // 3. Verifikasi token menggunakan JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET)

    // 4. Simpan data user ke req.user agar bisa diakses controller
    // Sesuai dengan payload di authService.js: { user_id: ..., email: ... }
    req.user = {
      id: decoded.user_id,
      email: decoded.email
    }

    next()
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: { message: 'Invalid or expired token' } 
    })
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = { id: decoded.user_id, email: decoded.email }
    }
  } catch (error) {
    // Ignore error for optional auth
  }
  next()
}
