import { DEFAULT_PAGE_COLOR, pageBackgroundVar } from '~/utils/pageColors'

export function getSlugFromRoutePath(path) {
  if (path === '/') return 'home'
  return path.replace(/^\//, '')
}

export async function resolveTransitionBackgroundForRoute(to, nuxtApp) {
  if (to.path.startsWith('/articles')) {
    return pageBackgroundVar(DEFAULT_PAGE_COLOR)
  }

  const slug = getSlugFromRoutePath(to.path)
  const cacheKey = `page-${slug}`
  const cached = nuxtApp?.payload?.data?.[cacheKey]
    ?? nuxtApp?.static?.data?.[cacheKey]

  if (cached?.pageColor) {
    return pageBackgroundVar(cached.pageColor)
  }

  try {
    const { pageColor } = await $fetch(`/api/page-color/${slug}`)
    return pageBackgroundVar(pageColor)
  } catch {
    return pageBackgroundVar(DEFAULT_PAGE_COLOR)
  }
}
