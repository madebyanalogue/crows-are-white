import type {ShopifyProduct} from '~/types/shopify'
import {
  filterProductsByCollection,
  resolveShopFilterId,
  type ShopFilterId,
} from '~/utils/shopCollections'

export function resolveShopSectionLimit(value: unknown, fallback = 16) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 24) : fallback
}

export function inferShopProductCollection(product?: ShopifyProduct | null): ShopFilterId {
  if (!product) return 'all'

  for (const collection of ['apparel', 'posters'] as const) {
    if (filterProductsByCollection([product], collection).length) {
      return collection
    }
  }

  return 'all'
}

export function buildDefaultRelatedProductsSection(product?: ShopifyProduct | null) {
  return {
    _id: 'default-related-products',
    relatedProductsTitle: 'Related',
    relatedProductsCollection: inferShopProductCollection(product),
    relatedProductsLimit: 16,
    relatedProductsExcludeCurrent: true,
  }
}

export function resolveShopSectionProducts(
  products: ShopifyProduct[],
  options: {
    collection?: string | null
    limit?: number
    excludeHandle?: string | null
  } = {},
) {
  const limit = options.limit ?? 16
  const collection = resolveShopFilterId(options.collection || 'all')
  const filtered = filterProductsByCollection(products, collection)
  const excluded = options.excludeHandle
    ? filtered.filter((product) => product.handle !== options.excludeHandle)
    : filtered
  const sliced = excluded.slice(0, limit)

  if (!sliced.length || sliced.length >= limit) {
    return sliced
  }

  const padded: ShopifyProduct[] = []
  while (padded.length < limit) {
    padded.push(...sliced)
  }

  return padded.slice(0, limit)
}
