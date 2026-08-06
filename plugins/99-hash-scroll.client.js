import { scrollRouteHashWhenReady } from '~/composables/useMenuLinks'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let scrollRequestId = 0

  function scheduleRouteHashScroll(hash, options = {}) {
    const requestId = ++scrollRequestId

    scrollRouteHashWhenReady(hash, options).then(() => {
      if (requestId !== scrollRequestId) return
    })
  }

  function scrollCurrentRouteHash(options = {}) {
    const hash = router.currentRoute.value.hash
    if (!hash) return
    scheduleRouteHashScroll(hash, options)
  }

  nuxtApp.hook('page:finish', () => {
    const isTransitioning = useState('pageTransitioning', () => false)
    if (isTransitioning.value) return
    scrollCurrentRouteHash()
  })

  nuxtApp.hook('app:mounted', () => {
    scrollCurrentRouteHash({ smooth: false })
  })
})
