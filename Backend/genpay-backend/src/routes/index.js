/*
  routes/index.js
  ---------------
  Main router Express yang menggabungkan semua route.
  Cara implementasi:
    - Import Router dari express.
    - Import masing-masing route file.
    - Gunakan app.use('/prefix', routeFile) untuk mendaftarkan setiap grup route.
    - Export router utama.
*/

import { Router } from 'express'
import authRoutes from './auth.routes.js'
import walletRoutes from './wallet.routes.js'
import projectRoutes from './project.routes.js'
import paymentRoutes from './payment.routes.js'
import aiRoutes from './ai.routes.js'
import historyRoutes from './history.routes.js'
import locationRoutes from './location.routes.js'
import notificationRoutes from './notification.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/wallets', walletRoutes)
router.use('/projects', projectRoutes)
router.use('/payments', paymentRoutes)
router.use('/ai', aiRoutes)
router.use('/history', historyRoutes)
router.use('/location', locationRoutes)
router.use('/notifications', notificationRoutes)

export default router
