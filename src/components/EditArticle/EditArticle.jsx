import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { useCreateArticleMutation, useGetArticleBySlugQuery } from '../../services/articlesApi'
import FormWrapper from '../FormWrapper/FormWrapper.jsx'
import Loader from '../Loader/Loader.jsx'
import editArticlesStyles from '../EditArticle/EditArticle.module.scss'

const EditArticle = () => {
  const navigate = useNavigate()
  const { slug } = useParams()

  const { data, isLoading: isArticleLoading, error: articleError } = useGetArticleBySlugQuery(slug, { skip: !slug })

  const article = data?.article

  const [updateArticle, { error, isLoading }] = useCreateArticleMutation()
  const [tags, setTags] = useState([])
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (article?.tagList) {
      setTags(article.tagList)
    }
  }, [article])

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

    const result = await updateArticle({
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
    title: article?.title || '',
    shortDescription: article?.description || '',
    text: article?.body || '',
    tags: tags.length > 0 ? tags : article?.tagList || [],
  }

  if (isArticleLoading) {
    return <Loader />
  }

  if (articleError || !article) {
    return (
      <div className={editArticlesStyles.error}>
        <p>Ошибка загрузки статьи.</p>
        <p>Проверьте соединение и попробуйте снова.</p>
      </div>
    )
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : showError ? (
        <div className={editArticlesStyles.error}>
          <p>Ошибка отправки формы.</p>
          <p>Знаем о проблеме, исправим в ближайшее время.</p>
          <p>Повторите попытку позднее</p>
          <button onClick={() => setShowError(false)} className={editArticlesStyles.retryBtn}>
            Вернуться назад
          </button>
        </div>
      ) : (
        <div className={editArticlesStyles.form__create}>
          <FormWrapper
            title="Edit article"
            fields={fields}
            onSubmit={handleSubmit}
            buttonText="Send"
            defaultValues={defaultValues}
            customContent={
              <div className={editArticlesStyles.tags}>
                <span className={editArticlesStyles.tags__title}>Tags</span>

                {tags.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className={`${editArticlesStyles.tags__button} ${editArticlesStyles['tags__button--add']}`}
                  >
                    Add Tag
                  </button>
                ) : (
                  tags.map((tag, index) => (
                    <div key={index} className={editArticlesStyles.tags__row}>
                      <input
                        value={tag}
                        onChange={(e) => handleChangeTag(index, e.target.value)}
                        className={editArticlesStyles.tags__input}
                        placeholder="Tag"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(index)}
                        className={`${editArticlesStyles.tags__button} ${editArticlesStyles['tags__button--del']}`}
                      >
                        Delete
                      </button>

                      {index === tags.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className={`${editArticlesStyles.tags__button} ${editArticlesStyles['tags__button--add']}`}
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

export default EditArticle
