import loaderStyles from './Loader.module.scss'

const Loader = () => {
  return (
    <div className={loaderStyles.loader__overlay}>
      <div className={loaderStyles.loader}></div>
    </div>
  )
}

export default Loader
