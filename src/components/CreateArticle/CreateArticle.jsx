import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { useCreateArticleMutation } from '../../services/articlesApi'
import FormWrapper from '../FormWrapper/FormWrapper.jsx'
import commonStyles from '../Article/Article.module.scss'

import styles from './CreateArticle.module.scss'

const CreateArticle = () => {
  const navigate = useNavigate()
  const [createArticle, { error, isLoading }] = useCreateArticleMutation()
  const [tags, setTags] = useState([])
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (error && error?.status !== 422) {
      setShowError(true)
    }
  }, [error])

  const handleAddTag = () => {
    setTags((prev) => [...prev, ''])
  }

  const handleDeleteTag = (indexToRemove) => {
    setTags((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleChangeTag = (index, value) => {
    const newTags = [...tags]
    newTags[index] = value
    setTags(newTags)
  }

  const handleSubmit = async (data) => {
    setShowError(false)

    const filteredTags = tags.filter((tag) => tag.trim() !== '')

    const result = await createArticle({
      title: data.title,
      description: data.shortDescription,
      body: data.text,
      tagList: filteredTags,
    })

    if (result?.data) {
      navigate('/articles')
    }
  }

  const fields = [
    {
      label: 'Title',
      name: 'title',
      type: 'text',
      placeholder: 'Title',
      validation: {
        required: 'Title is required',
      },
    },
    {
      label: 'Short description',
      name: 'shortDescription',
      type: 'text',
      placeholder: 'Short description',
      validation: {
        required: 'Short description is required',
      },
    },
    {
      label: 'Text',
      name: 'text',
      type: 'textarea',
      classname: 'textarea',
      placeholder: 'Text',
      validation: {
        required: 'Text is required',
      },
    },
  ]

  const defaultValues = {
    title: '',
    shortDescription: '',
    text: '',
  }

  return (
    <>
      {isLoading ? (
        <p className={commonStyles['article__loading']}>Загрузка...</p>
      ) : showError ? (
        <div className={styles['create-article__error']}>
          <p>Ошибка отправки формы.</p>
          <p>Знаем о проблеме, исправим в ближайшее время.</p>
          <p>Повторите попытку позднее</p>
          <button onClick={() => setShowError(false)} className={styles['create-article__retry-btn']}>
            Вернуться назад
          </button>
        </div>
      ) : (
        <div className={styles['create-article']}>
          <FormWrapper
            title="Create new article"
            fields={fields}
            onSubmit={handleSubmit}
            buttonText="Send"
            defaultValues={defaultValues}
            customContent={
              <div className={styles['create-article__tags']}>
                <span className={styles['create-article__tags-title']}>Tags</span>

                {tags.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className={`${styles['create-article__tags-button']} ${styles['create-article__tags-button--add']}`}
                  >
                    Add Tag
                  </button>
                ) : (
                  tags.map((tag, index) => (
                    <div key={index} className={styles['create-article__tags-row']}>
                      <input
                        value={tag}
                        onChange={(e) => handleChangeTag(index, e.target.value)}
                        className={styles['create-article__tags-input']}
                        placeholder="Tag"
                      />

                      <button
                        type="button"
                        onClick={() => handleDeleteTag(index)}
                        className={`${styles['create-article__tags-button']} ${styles['create-article__tags-button--del']}`}
                      >
                        Delete
                      </button>

                      {index === tags.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className={`${styles['create-article__tags-button']} ${styles['create-article__tags-button--add']}`}
                        >
                          Add Tag
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            }
          />
        </div>
      )}
    </>
  )
}

export default CreateArticle
