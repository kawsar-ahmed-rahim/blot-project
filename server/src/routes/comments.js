import { Router } from 'express'
import { deleteComment } from '../controllers/commentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.delete('/:id', protect, deleteComment)

export default router
