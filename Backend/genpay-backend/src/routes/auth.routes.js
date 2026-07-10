/*
  routes/auth.routes.js
  ---------------------
  Route untuk endpoint autentikasi: login, register, logout.
  Cara implementasi:
    - POST /register  -> authController.register
    - POST /login     -> authController.login
    - POST /logout    -> authController.logout (panggil authenticate middleware dulu)
*/

import { Router } from 'express'
import { register, login, logout, verifyOtp, resendOtp, forgotPassword, verifyResetOtp, resetPassword, setPin, loginWithPin, getProfile } from '../controllers/authController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)
router.post('/verify-otp', verifyOtp)
router.post('/resend-otp', resendOtp)

router.post('/set-pin', authenticate, setPin)
router.post('/login-pin', loginWithPin)

// Reset Password Flow
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-otp', verifyResetOtp)
router.post('/reset-password', resetPassword)

export default router
