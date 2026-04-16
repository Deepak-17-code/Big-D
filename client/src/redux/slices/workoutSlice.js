import { createSlice } from '@reduxjs/toolkit'
import { dummyWorkouts } from '../../data/dummyData'

const getWorkoutId = (workout) => workout?.id || workout?._id

const workoutSlice = createSlice({
  name: 'workouts',
  initialState: {
    workouts: dummyWorkouts,
  },
  reducers: {
    setWorkouts: (state, action) => {
      state.workouts = action.payload
    },
    addWorkout: (state, action) => {
      state.workouts = [action.payload, ...state.workouts]
    },
    updateWorkout: (state, action) => {
      const updatedId = getWorkoutId(action.payload)
      state.workouts = state.workouts.map((workout) =>
        getWorkoutId(workout) === updatedId ? action.payload : workout,
      )
    },
    deleteWorkout: (state, action) => {
      state.workouts = state.workouts.filter((workout) => getWorkoutId(workout) !== action.payload)
    },
  },
})

export const { setWorkouts, addWorkout, updateWorkout, deleteWorkout } = workoutSlice.actions
export default workoutSlice.reducer
