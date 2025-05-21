import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setUser } from '../../redux/slices/userSlice'
import MainLayout from '../../layouts/MainLayout.jsx'
import Articles from '../Article/Article.jsx'
import Login from '../Login/Login.jsx'
import Register from '../Register/Register.jsx'
import EditProfile from '../EditProfile/EditProfile.jsx'
import EditArticle from '../EditArticle/EditArticle.jsx'
import CreateArticle from '../CreateArticle/CreateArticle.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import PrivateRoute from '../PrivateRoute/PrivateRoute.jsx'

import appStyles from './App.module.scss'

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      dispatch(setUser({ token, user: null }))
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <div className={appStyles.app}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Articles />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:slug" element={<Articles />} />
            <Route path="sign-in" element={<Login />} />
            <Route path="sign-up" element={<Register />} />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="articles/:slug/edit"
              element={
                <PrivateRoute>
                  <EditArticle />
                </PrivateRoute>
              }
            />
            <Route
              path="new-article"
              element={
                <PrivateRoute>
                  <CreateArticle />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
