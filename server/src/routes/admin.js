import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import { getStats, listUsers, updateUserRole, deleteUser } from '../controllers/adminController.js'
import { adminListPosts, adminGetPost, createPost, updatePost, deletePost } from '../controllers/postController.js'
import { adminListComments } from '../controllers/commentController.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/stats', getStats)

router.get('/posts', adminListPosts)
router.post('/posts', createPost)
router.get('/posts/:id', adminGetPost)
router.put('/posts/:id', updatePost)
router.delete('/posts/:id', deletePost)

router.get('/comments', adminListComments)

router.get('/users', listUsers)
router.put('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)

export default router
