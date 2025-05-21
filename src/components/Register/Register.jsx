import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { setUser } from '../../redux/slices/userSlice'
import { useRegisterUserMutation } from '../../services/articlesApi.js'
import FormWrapper from '../FormWrapper/FormWrapper.jsx'

import registerStyles from './Register.module.scss'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [registerUser, { error, isLoading }] = useRegisterUserMutation()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (error && error?.status !== 422) {
      setShowError(true)
    }
  }, [error])

  const handleSubmit = async (data, { setError, clearErrors }) => {
    clearErrors()
    setShowError(false)

    if (data.password !== data.repeatPassword) {
      setError('repeatPassword', { message: 'Passwords do not match' })
      return
    }

    if (!data.agree) {
      setError('agree', { message: 'You must agree to the terms' })
      return
    }

    const result = await registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
    })

    const fieldErrors = result?.error?.data?.errors
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, message]) => {
        const msg = Array.isArray(message) ? message[0] : message
        setError(field, { message: msg })
      })
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
      label: 'Username:',
      name: 'username',
      type: 'text',
      placeholder: 'Username',
      autoComplete: 'username',
      validation: {
        required: 'Username is required',
        minLength: { value: 3, message: 'Minimum 3 characters' },
        maxLength: { value: 20, message: 'Maximum 20 characters' },
      },
    },
    {
      label: 'Email:',
      name: 'email',
      type: 'email',
      placeholder: 'Email address',
      autoComplete: 'email',
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
      placeholder: 'Password',
      autoComplete: 'new-password',
      validation: {
        required: 'Password is required',
        minLength: { value: 6, message: 'At least 6 characters' },
        maxLength: { value: 40, message: 'No more than 40 characters' },
      },
    },
    {
      label: 'Repeat Password:',
      name: 'repeatPassword',
      type: 'password',
      placeholder: 'Repeat password',
      autoComplete: 'new-password',
      validation: {
        required: 'Please repeat the password',
      },
    },
  ]

  const main = (register, errors) => (
    <label className={registerStyles['register__checkbox']}>
      <input type="checkbox" {...register('agree', { required: 'You must agree to continue' })} />
      <span>I agree to the processing of my personal information</span>
      {errors.agree && <span className={registerStyles['register__error']}>{errors.agree.message}</span>}
    </label>
  )

  const footer = (
    <p>
      Already have an account?{' '}
      <Link to="/sign-in" className={registerStyles['register__link']}>
        Sign In
      </Link>
    </p>
  )

  return (
    <>
      {showError ? (
        <div className={registerStyles['register__error']}>
          <p>Ошибка отправки формы.</p>
          <p>Знаем о проблеме, исправим в ближайшее время.</p>
          <p>Повторите попытку позднее</p>
          <button onClick={() => setShowError(false)} className={registerStyles['register__retry-button']}>
            Вернуться на страницу регистрации
          </button>
        </div>
      ) : (
        <FormWrapper
          title="Sign Up"
          fields={fields}
          buttonText={isLoading ? 'Загрузка...' : 'Sign Up'}
          onSubmit={handleSubmit}
          main={main}
          footer={footer}
          shouldValidatePasswords={true}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

export default Register
