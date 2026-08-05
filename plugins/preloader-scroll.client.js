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

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  },
})
