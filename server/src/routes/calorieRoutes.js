import { Router } from 'express'
import {
	deleteCalories,
	getCalories,
	updateCalories,
	upsertCalories,
} from '../controllers/calorieController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.route('/').get(protect, getCalories).post(protect, upsertCalories)
router.route('/:id').put(protect, updateCalories).delete(protect, deleteCalories)

export default router
