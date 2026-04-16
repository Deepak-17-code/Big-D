import { Router } from 'express'
import {
	getMe,
	updateMe,
	uploadAvatar,
	updateMetrics,
	getAssistantChatHistory,
	saveAssistantChatHistory,
	clearAssistantChatHistory,
	getSavedAssistantAnswers,
	saveAssistantAnswer,
	deleteSavedAssistantAnswer,
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = Router()

router.get('/me', protect, getMe)
router.put('/me', protect, updateMe)
router.put('/me/metrics', protect, updateMetrics)
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar)
router.get('/me/assistant-history', protect, getAssistantChatHistory)
router.post('/me/assistant-history', protect, saveAssistantChatHistory)
router.delete('/me/assistant-history', protect, clearAssistantChatHistory)
router.get('/me/saved-assistant-answers', protect, getSavedAssistantAnswers)
router.post('/me/saved-assistant-answers', protect, saveAssistantAnswer)
router.delete('/me/saved-assistant-answers/:answerId', protect, deleteSavedAssistantAnswer)

export default router
