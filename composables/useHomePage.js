export function useHomePage() {
  return useAsyncData(
    'page-home',
    () => $fetch('/api/page/home'),
    freshDataOptions,
  )
}
