import { createSlice } from '@reduxjs/toolkit'
import { dummyUser } from '../../data/dummyData'

const token = localStorage.getItem('token')
const storedUser = (() => {
  const serialized = localStorage.getItem('user')
  if (!serialized) {
    return null
  }

  try {
    return JSON.parse(serialized)
  } catch {
    return null
  }
})()

const initialState = {
  user: token ? storedUser || dummyUser : null,
  token: token || null,
  isAuthenticated: Boolean(token),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    signupSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    updateProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
})

export const { loginSuccess, signupSuccess, logout, updateProfile } = authSlice.actions
export default authSlice.reducer
