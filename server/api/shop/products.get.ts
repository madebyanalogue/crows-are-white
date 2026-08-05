import {fetchProducts, useShopifyConfig} from '~/server/utils/shopify'
import {mockProducts} from '~/server/utils/shopify-mock'

export default defineEventHandler(async () => {
  const {mockMode} = useShopifyConfig()

  if (mockMode) {
    return {products: mockProducts, mock: true}
  }

  const products = await fetchProducts()
  return {products, mock: false}
})
