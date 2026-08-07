import { freshDataOptions } from '~/utils/freshFetch'

async function fetchHomePage() {
  const home = await $fetch('/api/page/home').catch(() => null)
  if (home) return home
  return $fetch('/api/page/homepage').catch(() => null)
}

export function useCmsPage(slug, options = {}) {
  const resolvedSlug = computed(() => {
    const value = unref(slug)
    if (value === null || value === undefined || value === '') return null
    return String(value)
  })

  return useAsyncData(
    () => (resolvedSlug.value ? `page-${resolvedSlug.value}` : 'page-none'),
    () => {
      const currentSlug = resolvedSlug.value
      if (!currentSlug) return Promise.resolve(null)
      if (currentSlug === 'home') return fetchHomePage()
      return $fetch(`/api/page/${currentSlug}`).catch(() => null)
    },
    {
      watch: [resolvedSlug],
      ...freshDataOptions,
      ...options,
    },
  )
}
