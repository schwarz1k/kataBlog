import React from 'react'
import { Link } from 'react-router-dom'

import styles from './NotFound.module.scss'

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <h2>Страница не найдена</h2>
      <p>Похоже, такой страницы не существует.</p>
      <Link to="/">Вернуться к списку статей</Link>
    </div>
  )
}

export default NotFound
