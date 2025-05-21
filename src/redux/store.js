import { configureStore } from '@reduxjs/toolkit'

import { articlesApi } from '../services/articlesApi.js'
import paginationReducer from '../redux/slices/paginationSlice.js'
import userReducer from '../redux/slices/userSlice.js'

const store = configureStore({
  reducer: {
    [articlesApi.reducerPath]: articlesApi.reducer,
    pagination: paginationReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(articlesApi.middleware),
})

export default store
