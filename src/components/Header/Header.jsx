import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { articlesApi, useGetCurrentUserQuery } from '../../services/articlesApi'
import { setUser, clearUser } from '../../redux/slices/userSlice'

import styles from './Header.module.scss'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const token = useSelector((state) => state.user.token)
  const wasLoggedOut = useSelector((state) => state.user.wasLoggedOut)

  const { data, isSuccess } = useGetCurrentUserQuery(undefined, {
    skip: !token || wasLoggedOut,
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (!wasLoggedOut && isSuccess && data?.user) {
      dispatch(setUser({ user: data.user, token }))
    }
  }, [wasLoggedOut, isSuccess, data, dispatch, token])

  const handleLogout = () => {
    localStorage.removeItem('token')
    dispatch(clearUser())
    dispatch(articlesApi.util.resetApiState())
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.header__title}>
        Realworld Blog
      </Link>
      <div className={styles.header__user}>
        {user ? (
          <>
            <Link to="/new-article" className={styles.header__button_create}>
              Create Article
            </Link>
            <Link className={styles.header__profile} to="/profile">
              <p className={styles.header__username}>{user.username}</p>
              <img
                src={user.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                alt={user.username}
                className={styles.header__avatar}
              />
            </Link>
            <button className={styles.header__button_logout} onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link className={styles.header__button_login} to="/sign-in">
              Sign In
            </Link>
            <Link className={styles.header__button_register} to="/sign-up">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
