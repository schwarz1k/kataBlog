import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  wasLoggedOut: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.wasLoggedOut = false
    },
    clearUser(state) {
      state.user = null
      state.token = null
      state.wasLoggedOut = true
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
