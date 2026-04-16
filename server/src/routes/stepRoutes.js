import { Router } from 'express'
import {
	deleteSteps,
	getSteps,
	getWeeklyAnalytics,
	updateSteps,
	upsertSteps,
} from '../controllers/stepController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.route('/').get(protect, getSteps).post(protect, upsertSteps)
router.get('/analytics/weekly', protect, getWeeklyAnalytics)
router.route('/:id').put(protect, updateSteps).delete(protect, deleteSteps)

export default router
