import { fetchSanityRedirects } from './sanityRedirects'

const CACHE_TTL_MS = 60_000

let cache = null

/**
 * Normalise a path for redirects.
 * Strips trailing slashes (except root).
 */
export function normalizePath(path) {
  if (!path || path === '/') return '/'
  return `/${path.replace(/^\/+|\/+$/g, '')}`
}

/**
 * Code-level fallback redirects.
 * These always apply even if Sanity is unavailable.
 * CMS-managed redirects are configured in Sanity → Site Settings → URL Redirects.
 */
export const FALLBACK_REDIRECTS = [
  // Resolve duplicate home URL (menus may link to /home)
  { from: '/home', to: '/' },
]

/** Merge fallback and CMS redirects. CMS entries override fallbacks with the same source path. */
export function mergeRedirects(sanityRedirects, fallbacks = FALLBACK_REDIRECTS) {
  const map = new Map()

  for (const redirect of fallbacks) {
    map.set(normalizePath(redirect.from), {
      from: normalizePath(redirect.from),
      to: normalizePath(redirect.to),
    })
  }

  for (const redirect of sanityRedirects) {
    map.set(normalizePath(redirect.from), {
      from: normalizePath(redirect.from),
      to: normalizePath(redirect.to),
    })
  }

  return [...map.values()]
}

/** Fetch all redirects (fallbacks + Sanity), cached for 1 minute. */
export async function getAllRedirects() {
  const now = Date.now()

  if (cache && cache.expiresAt > now) {
    return cache.redirects
  }

  let sanityRedirects = []

  try {
    sanityRedirects = await fetchSanityRedirects()
  } catch (error) {
    console.error('[redirects] Failed to fetch Sanity redirects:', error)
  }

  const redirects = mergeRedirects(sanityRedirects, FALLBACK_REDIRECTS)
  cache = { redirects, expiresAt: now + CACHE_TTL_MS }

  return redirects
}

/** Find a redirect for the given request path (handles trailing slashes). */
export function findRedirect(pathname, redirects) {
  const path = normalizePath(pathname)
  return redirects.find((redirect) => normalizePath(redirect.from) === path)
}

/** Paths that should bypass redirect middleware. */
export function isRedirectExemptPath(pathname) {
  return (
    pathname.startsWith('/api/')
    || pathname.startsWith('/_nuxt/')
    || pathname.startsWith('/__sitemap__/')
    || pathname === '/robots.txt'
    || pathname === '/sitemap.xml'
  )
}
