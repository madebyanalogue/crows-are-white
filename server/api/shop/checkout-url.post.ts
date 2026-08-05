import {fetchCheckoutUrl, getCartIdCookie, useShopifyConfig} from '~/server/utils/shopify'
import {readMockCart} from '~/server/utils/shopify-mock'

export default defineEventHandler(async (event) => {
  const {mockMode} = useShopifyConfig()

  if (mockMode) {
    const cart = readMockCart(event)
    if (cart.lines.length === 0) {
      throw createError({statusCode: 400, statusMessage: 'Cart is empty'})
    }
    return {checkoutUrl: cart.checkoutUrl, mock: true}
  }

  const cartId = getCartIdCookie(event)
  if (!cartId) {
    throw createError({statusCode: 400, statusMessage: 'Cart not found'})
  }

  const checkoutUrl = await fetchCheckoutUrl(cartId)
  return {checkoutUrl, mock: false}
})
