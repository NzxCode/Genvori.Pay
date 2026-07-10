/*
  routes/project.routes.js
  ------------------------
  Route untuk CRUD project finance dan alokasi budget.
  Cara implementasi:
    - GET    /               -> projectController.getAll (daftar project user)
    - POST   /               -> projectController.create (buat project baru)
    - GET    /:projectId     -> projectController.getById (detail project)
    - PATCH  /:projectId     -> projectController.update (edit project)
    - DELETE /:projectId     -> projectController.remove (hapus project)
    - GET    /:projectId/budget -> projectController.getBudgetAlocation
*/

import { Router } from 'express'
import {
  getAll,
  create,
  getById,
  update,
  remove,
  getBudgetAlocation,
} from '../controllers/projectController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { authorize } from '../middlewares/roleMiddleware.js'

const router = Router()

router.use(authenticate)

router.get('/', getAll)
router.post('/', authorize('merchant', 'founder'), create)
router.get('/:projectId', getById)
router.patch('/:projectId', authorize('merchant', 'founder'), update)
router.delete('/:projectId', authorize('merchant', 'founder'), remove)
router.get('/:projectId/budget', getBudgetAlocation)

export default router
