import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../redux/slices/authSlice'
import workoutReducer from '../redux/slices/workoutSlice'
import nutritionReducer from '../redux/slices/nutritionSlice'
import stepsReducer from '../redux/slices/stepsSlice'
import feedReducer from '../redux/slices/feedSlice'
import uiReducer from '../redux/slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workouts: workoutReducer,
    nutrition: nutritionReducer,
    steps: stepsReducer,
    feed: feedReducer,
    ui: uiReducer,
  },
})
