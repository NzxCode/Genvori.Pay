/*
  routes/notification.routes.js
  -----------------------------
  Route untuk manajemen notifikasi pengguna.
*/

import { Router } from 'express'
import { getNotifications, markAsRead } from '../controllers/notificationController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', authenticate, getNotifications)
router.patch('/:notificationId/read', authenticate, markAsRead)

export default router
