export function useArticles() {
  return useAsyncData(
    'articles-index',
    () => $fetch('/api/articles'),
    freshDataOptions,
  )
}
