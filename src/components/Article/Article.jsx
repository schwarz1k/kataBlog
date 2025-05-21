import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import { useEffect, useState } from 'react'
import { ConfigProvider, Pagination, Popconfirm } from 'antd'
import { useSelector, useDispatch } from 'react-redux'

import {
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useDeleteArticleMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
} from '../../services/articlesApi'
import { setPage } from '../../redux/slices/paginationSlice'

import styles from './Article.module.scss'

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('ru-RU', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const Article = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageFromUrl = Number(searchParams.get('page')) || 1
  const currentPage = useSelector((state) => state.pagination.currentPage)
  const currentUser = useSelector((state) => state.user?.user)
  const pageSize = 5
  const offset = (pageFromUrl - 1) * pageSize

  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation()
  const [favoriteArticle] = useFavoriteArticleMutation()
  const [unfavoriteArticle] = useUnfavoriteArticleMutation()

  const {
    data: articlesData,
    error: articlesError,
    isLoading: articlesLoading,
    isFetching,
    refetch: refetchArticles,
  } = useGetArticlesQuery({ limit: pageSize, offset }, { skip: !!slug, refetchOnMountOrArgChange: true })

  const {
    data: articleData,
    error: articleError,
    isLoading: articleLoading,
    refetch: refetchArticle,
  } = useGetArticleBySlugQuery(slug, { skip: !slug })

  const [localArticles, setLocalArticles] = useState([])

  useEffect(() => {
    if (!slug) dispatch(setPage(pageFromUrl))
  }, [pageFromUrl, dispatch, slug])

  useEffect(() => {
    if (articlesData?.articles) {
      setLocalArticles(articlesData.articles)
    }
  }, [articlesData])

  const handlePageChange = (page) => {
    dispatch(setPage(page))
    setSearchParams({ page })
  }

  const handleDelete = async (slug) => {
    const result = await deleteArticle(slug)
    if ('error' in result) {
      console.error('Ошибка при удалении статьи:', result.error)
      alert('Ошибка при удалении статьи')
      return
    }
    navigate('/articles')
  }

  const handleToggleFavorite = async (slug, favorited, mode) => {
    if (!currentUser) return
    const action = favorited ? unfavoriteArticle : favoriteArticle
    const result = await action(slug)

    if ('error' in result) {
      console.error('Ошибка при изменении лайка:', result.error)
      return
    }

    const updatedArticle = result.data.article

    if (mode === 'full') {
      refetchArticle()
    } else {
      setLocalArticles((prevArticles) => prevArticles.map((a) => (a.slug === slug ? updatedArticle : a)))
    }
  }

  const renderCard = (article, mode = 'preview') => {
    const { slug, title, tagList, author, createdAt, favoritesCount, favorited, description, body } = article

    return (
      <div className={styles['article__wrapper']} key={slug}>
        <div className={styles['article__info']}>
          <div className={styles['article__info-header']}>
            <Link to={`/articles/${slug}`} className={styles['article__link']}>
              <p>{title}</p>
            </Link>
            <button
              onClick={() => handleToggleFavorite(slug, favorited, mode)}
              disabled={!currentUser}
              className={
                favorited
                  ? `${styles['article__like-button']} ${styles['article__like-button--liked']}`
                  : styles['article__like-button']
              }
            >
              {favorited ? (
                <AiFillHeart className={styles['article__icon']} />
              ) : (
                <AiOutlineHeart className={styles['article__icon']} />
              )}
            </button>
            <span>{favoritesCount}</span>
          </div>

          <ul className={styles['article__info-tags']}>
            {(Array.isArray(tagList) ? tagList : [])
              .filter((tag) => typeof tag === 'string')
              .map((tag, i) => {
                const trimmed = tag.trim()
                return trimmed ? (
                  <li key={i}>
                    <p>{trimmed}</p>
                  </li>
                ) : null
              })}
          </ul>

          <p className={styles['article__info-description']}>{description}</p>

          {mode === 'full' && body && (
            <div className={styles['article__info-body']}>
              <Markdown>{body}</Markdown>
              {currentUser?.username === author.username && (
                <div className={styles['article__buttons']}>
                  <Popconfirm
                    title="Вы уверены, что хотите удалить статью?"
                    onConfirm={() => handleDelete(slug)}
                    okText="Да"
                    cancelText="Нет"
                    okButtonProps={{ danger: true }}
                    placement="right"
                  >
                    <button type="button" className={styles['article__buttons-del']} disabled={isDeleting}>
                      Delete
                    </button>
                  </Popconfirm>
                  <Link to={`/articles/${slug}/edit`} className={styles['article__buttons-edit']}>
                    Edit
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles['article__user']}>
          <div>
            <p>{author.username}</p>
            <span className={styles['article__user-date']}>{formatDate(createdAt)}</span>
          </div>
          <img src={author.image || '/default-avatar.png'} alt={author.username} width={32} height={32} />
        </div>
      </div>
    )
  }

  if (slug) {
    if (articleLoading) return <p className={styles['article__loading']}>Загрузка статьи...</p>
    if (articleError || !articleData?.article)
      return (
        <div className={styles['article__error']}>
          <p>Ошибка загрузки статьи.</p>
          <button onClick={refetchArticle} className={styles['article__retry-btn']}>
            Повторить попытку
          </button>
        </div>
      )
    return (
      <div className={styles['article__page']}>
        <div className={styles['article__page-wrapper']}>{renderCard(articleData.article, 'full')}</div>
      </div>
    )
  }

  if (articlesLoading || isFetching) return <p className={styles['article__loading']}>Загрузка...</p>
  if (articlesError)
    return (
      <div className={styles['article__error']}>
        <p>Ошибка загрузки статей.</p>
        <button onClick={refetchArticles} className={styles['article__retry-btn']}>
          Повторить попытку
        </button>
      </div>
    )

  return (
    <div className={styles['article__container']}>
      {localArticles.length === 0 ? (
        <p className={styles['article__empty']}>Нет доступных статей.</p>
      ) : (
        <>
          <ul className={styles['article__list']}>
            {localArticles.map((a) => (
              <li className={styles['article__list-item']} key={a.slug}>
                {renderCard(a)}
              </li>
            ))}
          </ul>

          <ConfigProvider
            theme={{
              components: {
                Pagination: {
                  colorPrimary: '#1890ff',
                  itemBg: 'transparent',
                  itemSize: 40,
                  fontSize: 16,
                  itemActiveBg: '#1890ff',
                },
              },
            }}
          >
            <Pagination
              className={styles['article__pagination']}
              current={currentPage}
              onChange={handlePageChange}
              total={articlesData?.articlesCount || 0}
              pageSize={pageSize}
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            />
          </ConfigProvider>
        </>
      )}
    </div>
  )
}

export default Article
