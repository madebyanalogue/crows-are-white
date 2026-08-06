export const PAGE_DOCUMENT_IDS = {
  home: 'page-home',
  watch: 'page-watch',
}

export function pageDocumentFilter(slug) {
  const documentId = PAGE_DOCUMENT_IDS[slug]
  if (documentId) {
    return `_type == "page" && _id == "${documentId}"`
  }
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
