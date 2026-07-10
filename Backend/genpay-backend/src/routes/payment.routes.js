/*
  routes/payment.routes.js
  ------------------------
  Route untuk pembayaran: generate QRIS/VA, payment link, dan webhook Midtrans.
  Cara implementasi:
    - POST  /charge          -> paymentController.charge (buat transaksi pembayaran)
    - POST  /webhook         -> paymentController.webhook (terima notifikasi Midtrans)
      (webhook TIDAK perlu middleware authenticate karena dipanggil oleh Midtrans server)
    - GET   /:paymentId/status -> paymentController.getStatus (cek status pembayaran)
*/

import { Router } from 'express'
import {
  charge,
  processDigitalPayment,
  webhook,
  getStatus,
} from '../controllers/paymentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/charge', authenticate, charge)
router.post('/digital-payment', authenticate, processDigitalPayment)
router.post('/webhook', webhook)
router.get('/:paymentId/status', authenticate, getStatus)

export default router
