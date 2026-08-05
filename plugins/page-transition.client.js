import {
  resumePageColorTransitions,
  suspendPageColorTransitions,
} from '~/composables/usePageColor'

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  const router = useRouter()
  const isTransitioning = useState('pageTransitioning', () => false)
  const isInitialPageLoad = useState('dorsia_isInitialPageLoad', () => true)
  const pageColorSwapped = useState('crows_pageColorSwapped', () => false)
  const pendingRoutePath = useState('dorsia_pendingRoutePath', () => '')
  let isAppMounted = false

  function shouldAnimate(from) {
    if (!isAppMounted) return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if (from.matched.length === 0) return false
    return true
  }

  nuxtApp.hook('app:mounted', () => {
    isAppMounted = true
    isTransitioning.value = false
  })

  router.beforeEach((to, from) => {
    if (from.matched.length > 0) {
      isInitialPageLoad.value = false
    }

    if (from.matched.length === 0) return true
    if (to.fullPath === from.fullPath) return true

    suspendPageColorTransitions()

    if (!shouldAnimate(from)) return true

    pageColorSwapped.value = false
    pendingRoutePath.value = to.path
    isTransitioning.value = true
    return true
  })

  router.afterEach((_to, _from, failure) => {
    if (failure) {
      isTransitioning.value = false
      resumePageColorTransitions()
      return
    }

    if (!isTransitioning.value) {
      resumePageColorTransitions()
    }
  })
})
