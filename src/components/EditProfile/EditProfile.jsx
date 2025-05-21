import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { articlesApi, useGetUserQuery, useUpdateUserMutation } from '../../services/articlesApi'
import FormWrapper from '../FormWrapper/FormWrapper.jsx'
import { clearUser, setUser } from '../../redux/slices/userSlice.js'
import registerStyles from '../Register/Register.module.scss'

const EditProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useGetUserQuery()
  const [updateUser, { error }] = useUpdateUserMutation()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    refetch()
    if (error && error?.status !== 422) {
      setShowError(true)
    }
  }, [error, refetch])

  if (isLoading) {
    return (
      <p style={{ textAlign: 'center', padding: '2rem', color: '#1890ff', fontSize: '20px' }}>Загрузка профиля...</p>
    )
  }

  const user = data?.user

  const handleSubmit = async (data, { setError, clearErrors }) => {
    clearErrors()
    setShowError(false)

    const updatedFields = {}

    if (data.username !== user.username) updatedFields.username = data.username
    if (data.email !== user.email) updatedFields.email = data.email
    if (data.avatar !== user.image) updatedFields.image = data.avatar
    if (data.password) updatedFields.password = data.password

    if (Object.keys(updatedFields).length === 0) {
      navigate('/articles')
      return
    }

    const result = await updateUser(updatedFields)

    const fieldErrors = result?.error?.data?.errors
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, message]) => {
        const msg = Array.isArray(message) ? message[0] : message
        setError(field, { message: msg })
      })
    }

    if (result?.data?.user) {
      const updatedUser = result.data.user
      const token = localStorage.getItem('token')

      const emailChanged = !!updatedFields.email
      const passwordChanged = !!updatedFields.password

      if (emailChanged || passwordChanged) {
        localStorage.removeItem('token')
        dispatch(clearUser())
        dispatch(articlesApi.util.resetApiState())
        navigate('/sign-in')
      } else {
        dispatch(setUser({ user: updatedUser, token }))
        navigate('/articles')
      }
    }
  }

  const fields = [
    {
      label: 'Username:',
      name: 'username',
      type: 'text',
      autoComplete: 'username',
      placeholder: 'Username',
      validation: {
        required: 'Username is required',
      },
    },
    {
      label: 'Email address:',
      name: 'email',
      type: 'email',
      autoComplete: 'email',
      placeholder: 'Email address',
      validation: {
        required: 'Email is required',
      },
    },
    {
      label: 'New password:',
      name: 'password',
      type: 'password',
      autoComplete: 'new-password',
      placeholder: 'New password',
      validation: {
        minLength: { value: 6, message: 'At least 6 characters' },
        maxLength: { value: 40, message: 'No more than 40 characters' },
      },
    },
    {
      label: 'Avatar Image (url)',
      name: 'avatar',
      type: 'url',
      placeholder: 'Avatar Image (url)',
    },
  ]

  const defaultValues = {
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    avatar: user?.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
  }

  return (
    <>
      {showError ? (
        <div className={registerStyles.error}>
          <p>Ошибка отправки формы.</p>
          <p>Знаем о проблеме, исправим в ближайшее время.</p>
          <p>Повторите попытку позднее</p>
          <button onClick={() => setShowError(false)} className={registerStyles.retryBtn}>
            Вернуться на страницу регистрации
          </button>
        </div>
      ) : (
        <FormWrapper
          title="Edit Profile"
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Save"
          defaultValues={defaultValues}
        />
      )}
    </>
  )
}

export default EditProfile
