import { Router } from 'express'
import { createPost, deletePost, getPosts, updatePost } from '../controllers/postController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = Router()

router.route('/').get(protect, getPosts).post(protect, upload.single('media'), createPost)
router.route('/:id').put(protect, updatePost).delete(protect, deletePost)

export default router
