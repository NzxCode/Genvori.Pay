/*
  routes/ai.routes.js
  -------------------
  Route untuk meminta financial insight dari AI.
  Cara implementasi:
    - POST /insight  -> aiController.getInsight (kirim data cashflow, terima analisis AI)
*/

import { Router } from 'express'
import { getInsight } from '../controllers/aiController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/insight', authenticate, getInsight)

export default router
