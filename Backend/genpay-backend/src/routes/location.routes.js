/*
  routes/location.routes.js
  ------------------------
  Route untuk fitur lokasi.
*/

import { Router } from 'express'
import { updateLocation } from '../controllers/locationController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/update', authenticate, updateLocation)

export default router
