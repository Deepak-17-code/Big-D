import { createSlice } from '@reduxjs/toolkit'
import { dummySteps } from '../../data/dummyData'

const toNonNegative = (value) => Math.max(0, Number(value) || 0)

const stepsSlice = createSlice({
  name: 'steps',
  initialState: {
    stepsByDay: dummySteps,
  },
  reducers: {
    setSteps: (state, action) => {
      state.stepsByDay = action.payload.map((entry) => ({
        ...entry,
        steps: toNonNegative(entry.steps),
      }))
    },
    addDailySteps: (state, action) => {
      const existing = state.stepsByDay.find((entry) => entry.day === action.payload.day)
      if (existing) {
        existing.id = action.payload.id || existing.id
        existing.steps = toNonNegative(action.payload.steps)
        return
      }
      state.stepsByDay = [
        ...state.stepsByDay,
        {
          ...action.payload,
          steps: toNonNegative(action.payload.steps),
        },
      ]
    },
    updateDailySteps: (state, action) => {
      state.stepsByDay = state.stepsByDay.map((entry) =>
        entry.id === action.payload.id
          ? {
              ...entry,
              ...action.payload,
              steps: toNonNegative(action.payload.steps),
            }
          : entry,
      )
    },
    removeDailySteps: (state, action) => {
      state.stepsByDay = state.stepsByDay.filter((entry) => entry.id !== action.payload)
    },
  },
})

export const { setSteps, addDailySteps, updateDailySteps, removeDailySteps } = stepsSlice.actions
export default stepsSlice.reducer
