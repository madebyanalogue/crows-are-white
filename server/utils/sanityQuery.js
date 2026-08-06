export function pageDocumentFilter() {
  return '_type == "page" && slug.current == $slug'
}

export function normalizePageSlug(slug) {
  const value = String(slug ?? '').trim().toLowerCase()
  if (!value) return ''
  if (value === 'home') return 'home'
  return value
}

export function getRouterPageSlug(event) {
  const param = getRouterParam(event, 'slug')
  if (!param) return ''
  const parts = Array.isArray(param) ? param : [param]
  return normalizePageSlug(parts.map((part) => decodeURIComponent(part)).join('/'))
}

export function sanityFetchOptions(overrides = {}) {
  return {
    timeout: 30000,
    // Draft perspectives require a Sanity API token; without one they return no documents.
    perspective: 'published',
    ...overrides,
  }
}
