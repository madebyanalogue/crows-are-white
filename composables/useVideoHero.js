import {
  getCachedPageForRoute,
  pageHasTransparentVideoHero,
} from '~/utils/videoSectionFlags'

const STATIC_PAGE_ROUTES = new Set([
  '/',
  '/press',
  '/tickets',
  '/screenings',
  '/watch',
  '/videos',
  '/trailer',
  '/faq',
  '/legals',
  '/privacy-policy',
  '/terms-of-use',
  '/credits',
  '/contact',
  '/host-a-screening',
  '/book-a-screening',
  '/technical-requirements',
  '/shipping-delivery',
  '/shop',
  '/shop/cart',
])

function normalizeRoutePath(path) {
  if (!path) return ''
  const normalized = path.replace(/\/$/, '')
  return normalized || '/'
}

export function useVideoHero() {
  return useState('crows_videoHero', () => false)
}

export function getPageFetchInfo(path) {
  if (!path || path.startsWith('/articles')) return null

  const normalized = normalizeRoutePath(path)
  if (STATIC_PAGE_ROUTES.has(normalized) || normalized.startsWith('/shop/')) {
    return null
  }

  const slug = normalized.replace(/^\//, '')
  if (!slug) return null

  return { key: `page-${slug}`, slug }
}

export async function ensurePageDataForRoute(nuxtApp, path) {
  const info = getPageFetchInfo(path)
  if (!info) return
  if (getCachedPageForRoute(nuxtApp, path)) return

  try {
    const page = await $fetch(`/api/page/${info.slug}`)
    if (!nuxtApp.payload.data) {
      nuxtApp.payload.data = {}
    }
    nuxtApp.payload.data[info.key] = page
  } catch (error) {
    const status = error?.statusCode || error?.response?.status
    if (status === 404) return
    throw error
  }
}

export function syncVideoHeroFromRoute(nuxtApp, path, videoHeroActive) {
  if (!videoHeroActive) return

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

export async function ensureVideoHeroForRoute(nuxtApp, path) {
  await ensurePageDataForRoute(nuxtApp, path)
  nuxtApp.runWithContext(() => syncVideoHeroFromRoute(nuxtApp, path, useVideoHero()))
}
