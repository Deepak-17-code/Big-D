import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileSidebarOpen: false,
  },
  reducers: {
    setMobileSidebar: (state, action) => {
      state.mobileSidebarOpen = action.payload
    },
  },
})

export const { setMobileSidebar } = uiSlice.actions
export default uiSlice.reducer
