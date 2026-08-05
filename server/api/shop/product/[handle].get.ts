import {fetchProductByHandle, useShopifyConfig} from '~/server/utils/shopify'
import {getMockProductByHandle} from '~/server/utils/shopify-mock'

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')

  if (!handle) {
    throw createError({statusCode: 400, statusMessage: 'Product handle required'})
  }

  const {mockMode} = useShopifyConfig()

  if (mockMode) {
    const product = getMockProductByHandle(handle)
    if (!product) {
      throw createError({statusCode: 404, statusMessage: 'Product not found'})
    }
    return {product, mock: true}
  }

  const product = await fetchProductByHandle(handle)
  if (!product) {
    throw createError({statusCode: 404, statusMessage: 'Product not found'})
  }

  return {product, mock: false}
})
