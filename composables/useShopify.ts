import type {ShopifyProduct, ShopifyProductDetail} from '~/types/shopify'

export function useShopifyProducts() {
  return useAsyncData('shopify-products', () =>
    $fetch<{products: ShopifyProduct[]; mock: boolean}>('/api/shop/products'),
  )
}

export function useShopifyProduct(handle: MaybeRefOrGetter<string>) {
  const resolvedHandle = computed(() => toValue(handle))

  return useAsyncData(
    () => `shopify-product-${resolvedHandle.value}`,
    () => $fetch<{product: ShopifyProductDetail; mock: boolean}>(
      `/api/shop/product/${resolvedHandle.value}`,
    ),
    {watch: [resolvedHandle]},
  )
}
