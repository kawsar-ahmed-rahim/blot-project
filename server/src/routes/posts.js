import { Router } from 'express'
import { listPosts, getMeta, getPost, toggleLike } from '../controllers/postController.js'
import { listComments, addComment } from '../controllers/commentController.js'
import { protect, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', listPosts)
router.get('/meta', getMeta) // must stay above '/:slug'
router.get('/:slug', optionalAuth, getPost)
router.post('/:id/like', protect, toggleLike)
router.get('/:postId/comments', listComments)
router.post('/:postId/comments', protect, addComment)

export default router
