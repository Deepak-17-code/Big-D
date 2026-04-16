import { createSlice } from '@reduxjs/toolkit'
import { dummyCalories } from '../../data/dummyData'

const toNonNegative = (value) => Math.max(0, Number(value) || 0)

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState: {
    caloriesByDay: dummyCalories,
  },
  reducers: {
    setCalories: (state, action) => {
      state.caloriesByDay = action.payload.map((entry) => ({
        ...entry,
        calories: toNonNegative(entry.calories),
      }))
    },
    addDailyCalories: (state, action) => {
      const existing = state.caloriesByDay.find((entry) => entry.date === action.payload.date)
      if (existing) {
        existing.id = action.payload.id || existing.id
        existing.calories = toNonNegative(action.payload.calories)
        return
      }
      state.caloriesByDay = [
        ...state.caloriesByDay,
        {
          ...action.payload,
          calories: toNonNegative(action.payload.calories),
        },
      ]
    },
    updateDailyCalories: (state, action) => {
      state.caloriesByDay = state.caloriesByDay.map((entry) =>
        entry.id === action.payload.id
          ? {
              ...entry,
              ...action.payload,
              calories: toNonNegative(action.payload.calories),
            }
          : entry,
      )
    },
    removeDailyCalories: (state, action) => {
      state.caloriesByDay = state.caloriesByDay.filter((entry) => entry.id !== action.payload)
    },
  },
})

export const { setCalories, addDailyCalories, updateDailyCalories, removeDailyCalories } = nutritionSlice.actions
export default nutritionSlice.reducer
