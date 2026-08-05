import {
  getCachedPageForRoute,
  pageHasTransparentVideoHero,
} from '~/utils/videoSectionFlags'
import {getPageFetchInfo} from '~/composables/useVideoHero'

function normalizeRoutePath(path) {
  if (!path) return ''
  const normalized = path.replace(/\/$/, '')
  return normalized || '/'
}

function syncVideoHeroForPath(nuxtApp, videoHeroActive, path) {
  if (!path || path.startsWith('/articles')) {
    videoHeroActive.value = false
    return
  }

  if (normalizeRoutePath(path) === '/') {
    videoHeroActive.value = true
    return
  }

  const page = getCachedPageForRoute(nuxtApp, path)
  videoHeroActive.value = page ? pageHasTransparentVideoHero(page) : false
}

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute()
  const router = useRouter()
  const videoHeroActive = useState('crows_videoHero', () => false)

  async function loadAndSyncHero(path = route.path) {
    const info = getPageFetchInfo(path)
    if (info && !getCachedPageForRoute(nuxtApp, path)) {
      try {
        const page = await $fetch(`/api/page/${info.slug}`)
        if (!nuxtApp.payload.data) {
          nuxtApp.payload.data = {}
        }
        nuxtApp.payload.data[info.key] = page
      } catch (error) {
        const status = error?.statusCode || error?.response?.status
        if (status !== 404) throw error
      }
    }
    syncVideoHeroForPath(nuxtApp, videoHeroActive, path)
  }

  syncVideoHeroForPath(nuxtApp, videoHeroActive, route.path)

  router.beforeEach((to, from) => {
    if (from.matched.length === 0) return true
    if (to.fullPath === from.fullPath) return true
    syncVideoHeroForPath(nuxtApp, videoHeroActive, to.path)
    return true
  })

  nuxtApp.hook('page:finish', () => {
    loadAndSyncHero()
  })

  if (import.meta.client) {
    document.addEventListener('preloader-complete', () => {
      loadAndSyncHero()
    })
  }
})
