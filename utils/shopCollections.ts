import type {ShopifyProduct} from '~/types/shopify'

export const SHOP_COLLECTION_HANDLES = ['apparel', 'posters'] as const

export type ShopCollectionHandle = typeof SHOP_COLLECTION_HANDLES[number]

export type ShopFilterId = 'all' | ShopCollectionHandle

export type ShopFilter = {
  id: ShopFilterId
  label: string
  href: string
}

/** Fallback handles used in mock mode / when Shopify collections are unset */
const collectionProductHandles: Record<ShopCollectionHandle, string[]> = {
  apparel: ['directors-cut-tee', 'monk-metal-hoodie', 'ice-cream-club-cap'],
  posters: ['official-poster'],
}

const collectionTitles: Record<ShopCollectionHandle, string> = {
  apparel: 'Apparel',
  posters: 'Prints',
}

const collectionAliases: Record<ShopCollectionHandle, string[]> = {
  apparel: ['apparel', 'clothing', 'wearables'],
  posters: ['posters', 'prints', 'print'],
}

export const SHOP_FILTERS: ShopFilter[] = [
  {id: 'all', label: 'All', href: '/shop'},
  {id: 'posters', label: 'Prints', href: '/shop/collections/posters'},
  {id: 'apparel', label: 'Apparel', href: '/shop/collections/apparel'},
]

export function isShopCollectionHandle(handle: string): handle is ShopCollectionHandle {
  return SHOP_COLLECTION_HANDLES.includes(handle as ShopCollectionHandle)
}

export function getShopCollectionTitle(handle: string) {
  if (isShopCollectionHandle(handle)) return collectionTitles[handle]
  return handle
}

export function resolveShopFilterId(value?: string | null): ShopFilterId {
  if (!value || value === 'all') return 'all'
  if (value === 'prints' || value === 'posters') return 'posters'
  if (isShopCollectionHandle(value)) return value
  return 'all'
}

export function shopFilterFromQuery(value?: string | string[] | null): ShopFilterId {
  const raw = Array.isArray(value) ? value[0] : value
  return resolveShopFilterId(typeof raw === 'string' ? raw : undefined)
}

export function shopIndexLink(filter: ShopFilterId = 'all') {
  if (filter === 'all') return '/shop'
  return { path: '/shop', query: { filter } }
}

export function shopIndexHref(filter: ShopFilterId = 'all') {
  if (filter === 'all') return '/shop'
  return `/shop?filter=${encodeURIComponent(filter)}`
}

export function shopProductLink(handle: string, filter: ShopFilterId = 'all') {
  if (filter === 'all') return `/shop/${handle}`
  return `/shop/${handle}?filter=${encodeURIComponent(filter)}`
}

function normalizeToken(value = '') {
  return value.trim().toLowerCase()
}

function productMatchesCollection(product: ShopifyProduct, handle: ShopCollectionHandle) {
  const aliases = collectionAliases[handle]
  const collections = (product.collections || []).map(normalizeToken)
  if (collections.some((item) => aliases.includes(item))) return true

  const tags = (product.tags || []).map(normalizeToken)
  if (tags.some((tag) => aliases.includes(tag))) return true

  const productType = normalizeToken(product.productType)
  if (aliases.includes(productType)) return true

  const title = normalizeToken(product.title)
  if (handle === 'apparel') {
    if (/(tee|t-shirt|hoodie|cap|hat|apparel|shirt)/.test(title)) return true
  }
  if (handle === 'posters') {
    if (/(poster|print|sticker|badge|pin)/.test(title)) return true
  }

  return collectionProductHandles[handle].includes(product.handle)
}

export function filterProductsByCollection(
  products: ShopifyProduct[],
  handle: string,
) {
  const filterId = resolveShopFilterId(handle)
  if (filterId === 'all') return products
  return products.filter((product) => productMatchesCollection(product, filterId))
}

export function formatShopPrice(amount: string, currencyCode = 'USD') {
  const value = Number(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}
