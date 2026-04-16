import { Router } from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { askAssistant } from '../controllers/assistantController.js'

const router = Router()

router.post('/ask', protect, askAssistant)

export default router