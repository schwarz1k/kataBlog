import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import FormWrapper from '../FormWrapper/FormWrapper.jsx'
import { useLoginUserMutation } from '../../services/articlesApi.js'
import { setUser } from '../../redux/slices/userSlice.js'

import loginStyles from './Login.module.scss'

const Login = () => {
  const dispatch = useDispatch()
  const [loginUser, { isLoading }] = useLoginUserMutation()
  const navigate = useNavigate()

  const handleSubmit = async (data, { setError }) => {
    const result = await loginUser({
      email: data.email,
      password: data.password,
    })

    const fieldErrors = result?.error?.data?.errors

    if (fieldErrors?.['email or password']) {
      setError('email', { message: 'Invalid email or password' })
      setError('password', { message: 'Invalid email or password' })
      return
    }

    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : messages
        setError(field, { message: msg })
      })
      return
    }

    if (result?.data?.user) {
      const { user } = result.data
      dispatch(setUser({ user, token: user.token }))
      localStorage.setItem('token', user.token)
      navigate('/articles')
    }
  }

  const fields = [
    {
      label: 'Email address:',
      name: 'email',
      type: 'email',
      autoComplete: 'email',
      placeholder: 'Email address',
      validation: {
        required: 'Email is required',
        pattern: {
          value: /^[^@]+@[^@]+\.[^@]+$/,
          message: 'Enter a valid email address',
        },
      },
    },
    {
      label: 'Password:',
      name: 'password',
      type: 'password',
      autoComplete: 'current-password',
      placeholder: 'Password',
      validation: {
        required: 'Password is required',
      },
    },
  ]

  const footer = (
    <p>
      Don&apos;t have an account?{' '}
      <Link to="/sign-up" className={loginStyles.login__link}>
        Sign Up
      </Link>
    </p>
  )

  return (
    <FormWrapper
      title="Sign In"
      fields={fields}
      buttonText="Login"
      onSubmit={handleSubmit}
      footer={footer}
      isLoading={isLoading}
    />
  )
}

export default Login
