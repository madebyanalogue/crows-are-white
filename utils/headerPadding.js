import {
  getCachedPageForRoute,
  pageRemovesHeaderPadding,
} from '~/utils/videoSectionFlags'

function normalizeRoutePath(path) {
  if (!path) return ''
  const normalized = path.replace(/\/$/, '')
  return normalized || '/'
}

export function routeRemovesHeaderPadding(nuxtApp, path, routeMeta = {}) {
  if (routeMeta?.transparentHeader || routeMeta?.removeHeaderPadding) {
    return true
  }

  if (normalizeRoutePath(path) === '/') {
    return true
  }

  const page = getCachedPageForRoute(nuxtApp, path)
  if (page && pageRemovesHeaderPadding(page)) {
    return true
  }

  return false
}
