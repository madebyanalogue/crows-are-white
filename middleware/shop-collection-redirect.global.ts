import { resolveShopFilterId, shopFilterQueryValue } from '~/utils/shopCollections'

export default defineNuxtRouteMiddleware((to) => {
  const match = to.path.match(/^\/shop\/collections\/([^/]+)\/?$/)
  if (!match) return

  const filter = resolveShopFilterId(match[1])
  return navigateTo(
    {
      path: '/shop',
      query: filter === 'all' ? {} : { filter: shopFilterQueryValue(filter) },
    },
    { replace: true },
  )
})
