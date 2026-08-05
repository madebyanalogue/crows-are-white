import type {CartAction} from '~/types/shopify'
import {
  addCartLines,
  createCart,
  getCartIdCookie,
  removeCartLines,
  setCartIdCookie,
  updateCartLines,
  useShopifyConfig,
} from '~/server/utils/shopify'
import {addMockLine, removeMockLine, updateMockLine} from '~/server/utils/shopify-mock'

export default defineEventHandler(async (event) => {
  const body = await readBody<CartAction>(event)
  const {mockMode} = useShopifyConfig()

  if (mockMode) {
    switch (body.action) {
      case 'add':
        return {cart: addMockLine(event, body.variantId, body.quantity ?? 1), mock: true}
      case 'update':
        return {cart: updateMockLine(event, body.lineId, body.quantity), mock: true}
      case 'remove':
        return {cart: removeMockLine(event, body.lineId), mock: true}
      default:
        throw createError({statusCode: 400, statusMessage: 'Invalid cart action'})
    }
  }

  const cartId = getCartIdCookie(event)

  switch (body.action) {
    case 'add': {
      if (!cartId) {
        const cart = await createCart([{merchandiseId: body.variantId, quantity: body.quantity ?? 1}])
        setCartIdCookie(event, cart.id)
        return {cart, mock: false}
      }

      const cart = await addCartLines(cartId, [
        {merchandiseId: body.variantId, quantity: body.quantity ?? 1},
      ])
      return {cart, mock: false}
    }
    case 'update': {
      if (!cartId) {
        throw createError({statusCode: 400, statusMessage: 'Cart not found'})
      }
      const cart = await updateCartLines(cartId, [{id: body.lineId, quantity: body.quantity}])
      return {cart, mock: false}
    }
    case 'remove': {
      if (!cartId) {
        throw createError({statusCode: 400, statusMessage: 'Cart not found'})
      }
      const cart = await removeCartLines(cartId, [body.lineId])
      return {cart, mock: false}
    }
    default:
      throw createError({statusCode: 400, statusMessage: 'Invalid cart action'})
  }
})
