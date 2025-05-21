import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

import styles from './FormWrapper.module.scss'

const FormWrapper = ({
  title,
  fields,
  buttonText,
  onSubmit,
  main,
  footer,
  shouldValidatePasswords = false,
  isLoading = false,
  defaultValues = {},
  customContent,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm({ defaultValues })

  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      reset(defaultValues)
    }
  }, [reset, defaultValues.username, defaultValues.email, defaultValues.avatar])

  const password = watch('password')

  const getFieldValidation = (field) => {
    if (shouldValidatePasswords && field.name === 'repeatPassword') {
      return {
        ...field.validation,
        validate: (value) => value === password || 'Passwords do not match',
      }
    }

    return field.validation
  }

  const handleFormSubmit = (data) => {
    onSubmit(data, { setError, clearErrors })
  }

  return (
    <div className={styles['form-wrapper']}>
      <form className={styles['form-wrapper__form']} onSubmit={handleSubmit(handleFormSubmit)}>
        <h1 className={styles['form-wrapper__title']}>{title}</h1>

        <div className={styles['form-wrapper__fields']}>
          {fields.map(({ label, name, type = 'text', placeholder, autoComplete, validation, classname }) => (
            <label key={name} className={styles['form-wrapper__label']}>
              <span className={styles['form-wrapper__label-text']}>{label}</span>
              {type === 'textarea' ? (
                <textarea
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  {...register(name, getFieldValidation({ name, validation }))}
                  className={`${styles['form-wrapper__input']} ${classname ? styles[classname] : ''} ${
                    errors[name] ? styles['form-wrapper__input--error'] : ''
                  }`}
                />
              ) : (
                <input
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  {...register(name, getFieldValidation({ name, validation }))}
                  className={`${styles['form-wrapper__input']} ${classname ? styles[classname] : ''} ${
                    errors[name] ? styles['form-wrapper__input--error'] : ''
                  }`}
                />
              )}
              {errors[name] && <span className={styles['form-wrapper__error']}>{errors[name].message}</span>}
            </label>
          ))}

          {main && typeof main === 'function' && (
            <div className={styles['form-wrapper__main']}>{main(register, errors, setError, clearErrors)}</div>
          )}

          {customContent && <div className={styles['form-wrapper__custom']}>{customContent}</div>}

          <button type="submit" className={styles['form-wrapper__button']} disabled={isLoading}>
            {isLoading ? 'Загрузка...' : buttonText}
          </button>

          {footer && <div className={styles['form-wrapper__footer']}>{footer}</div>}
        </div>
      </form>
    </div>
  )
}

export default FormWrapper
