import { Router } from 'express'
import {
  createWorkout,
  deleteWorkout,
  getWorkoutById,
  getWorkouts,
  updateWorkout,
} from '../controllers/workoutController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.route('/').get(protect, getWorkouts).post(protect, createWorkout)
router.route('/:id').get(protect, getWorkoutById).put(protect, updateWorkout).delete(protect, deleteWorkout)

export default router
