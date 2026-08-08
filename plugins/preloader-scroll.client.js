if (typeof history !== 'undefined') {
  history.scrollRestoration = 'manual'
}

export default defineNuxtPlugin({
  name: 'preloader-scroll',
  enforce: 'pre',
  setup() {
    if (typeof window === 'undefined') return

    const path = window.location.pathname
    if (path !== '/' && path !== '') return

    document.documentElement.classList.add('is-preloader-active')
    document.documentElement.style.backgroundColor = '#f0f0ed'

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  },
})
