/*
  routes/history.routes.js
  ----------------------
  Route untuk riwayat transaksi.
*/

import { Router } from 'express'
import { getHistory } from '../controllers/historyController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', authenticate, getHistory)

export default router
