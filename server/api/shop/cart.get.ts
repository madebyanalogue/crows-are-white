import {readMockCart} from '~/server/utils/shopify-mock'
import {fetchCart, getCartIdCookie, useShopifyConfig} from '~/server/utils/shopify'

export default defineEventHandler(async (event) => {
  const {mockMode} = useShopifyConfig()

  if (mockMode) {
    return {cart: readMockCart(event), mock: true}
  }

  const cartId = getCartIdCookie(event)
  if (!cartId) {
    return {cart: null, mock: false}
  }

  const cart = await fetchCart(cartId)
  return {cart, mock: false}
})
