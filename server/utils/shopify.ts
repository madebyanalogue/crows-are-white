import type {H3Event} from 'h3'
import {createStorefrontApiClient} from '@shopify/storefront-api-client'
import type {ShopifyCart, ShopifyProduct, ShopifyProductDetail} from '~/types/shopify'
import {isOnSale} from '~/utils/shopifySale'

const API_VERSION = '2025-01'

export function useShopifyConfig() {
  const config = useRuntimeConfig()
  const mockMode = config.mockShopify || !config.shopifyStorefrontToken || !config.shopifyStoreDomain

  return {
    mockMode,
    storeDomain: config.shopifyStoreDomain as string,
    token: config.shopifyStorefrontToken as string,
  }
}

export function getStorefrontClient(storeDomain: string, token: string) {
  return createStorefrontApiClient({
    storeDomain,
    apiVersion: API_VERSION,
    privateAccessToken: token,
  })
}

export async function storefrontRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const {mockMode, storeDomain, token} = useShopifyConfig()

  if (mockMode) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Shopify is in mock mode',
    })
  }

  const client = getStorefrontClient(storeDomain, token)
  const {data, errors} = await client.request(query, {variables})

  if (errors) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Shopify Storefront API error',
      data: errors,
    })
  }

  return data as T
}

const PRODUCT_FIELDS = `
  id
  title
  handle
  productType
  tags
  collections(first: 10) {
    nodes {
      handle
    }
  }
  featuredImage {
    url
    altText
  }
  images(first: 2) {
    nodes {
      url
      altText
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  variants(first: 1) {
    nodes {
      id
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
    }
  }
`

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          image {
            url
          }
          product {
            title
            handle
            featuredImage {
              url
            }
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

export async function fetchProducts(): Promise<ShopifyProduct[]> {
  const data = await storefrontRequest<{
    products: {nodes: Array<{
      id: string
      title: string
      handle: string
      productType?: string
      tags?: string[]
      collections?: {nodes: Array<{handle: string}>}
      featuredImage?: {url: string; altText?: string}
      images?: {nodes: Array<{url: string; altText?: string}>}
      priceRange: {minVariantPrice: {amount: string; currencyCode: string}}
      variants: {nodes: Array<{
        id: string
        price: {amount: string; currencyCode: string}
        compareAtPrice?: {amount: string; currencyCode: string} | null
      }>}
    }>}
  }>(`
    query Products {
      products(first: 24, sortKey: TITLE) {
        nodes {
          ${PRODUCT_FIELDS}
        }
      }
    }
  `)

  return data.products.nodes
    .filter((product) => product.variants.nodes[0])
    .map((product) => {
      const variant = product.variants.nodes[0]
      const compareAtPrice = variant.compareAtPrice?.amount
      const galleryImages = product.images?.nodes || []
      const hoverImage = galleryImages[1]

      return {
        id: product.id,
        variantId: variant.id,
        handle: product.handle,
        title: product.title,
        price: variant.price.amount,
        currencyCode: variant.price.currencyCode,
        compareAtPrice,
        onSale: isOnSale(variant.price.amount, compareAtPrice),
        imageUrl: product.featuredImage?.url,
        imageAlt: product.featuredImage?.altText,
        hoverImageUrl: hoverImage?.url,
        hoverImageAlt: hoverImage?.altText,
        productType: product.productType || '',
        tags: product.tags || [],
        collections: (product.collections?.nodes || []).map((item) => item.handle),
      }
    })
}

const PRODUCT_DETAIL_FIELDS = `
  id
  title
  handle
  productType
  description
  featuredImage {
    url
    altText
  }
  images(first: 10) {
    nodes {
      url
      altText
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  variants(first: 25) {
    nodes {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      image {
        url
        altText
      }
    }
  }
`

export async function fetchProductByHandle(handle: string): Promise<ShopifyProductDetail | null> {
  const data = await storefrontRequest<{
    product: {
      id: string
      title: string
      handle: string
      productType?: string
      description: string
      featuredImage?: {url: string; altText?: string}
      images: {nodes: Array<{url: string; altText?: string}>}
      priceRange: {minVariantPrice: {amount: string; currencyCode: string}}
      variants: {nodes: Array<{
        id: string
        title: string
        availableForSale: boolean
        price: {amount: string; currencyCode: string}
        compareAtPrice?: {amount: string; currencyCode: string} | null
        image?: {url: string; altText?: string}
      }>}
    } | null
  }>(`
    query Product($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_DETAIL_FIELDS}
      }
    }
  `, {handle})

  const product = data.product
  if (!product || product.variants.nodes.length === 0) return null

  const firstVariant = product.variants.nodes[0]
  const firstCompareAtPrice = firstVariant.compareAtPrice?.amount
  const variants = product.variants.nodes.map((variant) => {
    const compareAtPrice = variant.compareAtPrice?.amount

    return {
      id: variant.id,
      title: variant.title,
      price: variant.price.amount,
      currencyCode: variant.price.currencyCode,
      compareAtPrice,
      onSale: isOnSale(variant.price.amount, compareAtPrice),
      availableForSale: variant.availableForSale,
      imageUrl: variant.image?.url,
      imageAlt: variant.image?.altText,
    }
  })

  return {
    id: product.id,
    variantId: firstVariant.id,
    handle: product.handle,
    title: product.title,
    productType: product.productType || '',
    price: firstVariant.price.amount,
    currencyCode: firstVariant.price.currencyCode,
    compareAtPrice: firstCompareAtPrice,
    onSale: variants.some((variant) => variant.onSale),
    imageUrl: product.featuredImage?.url,
    imageAlt: product.featuredImage?.altText,
    description: product.description,
    images: product.images.nodes,
    variants,
  }
}

function mapCart(cart: {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {subtotalAmount: {amount: string; currencyCode: string}}
  lines: {
    nodes: Array<{
      id: string
      quantity: number
      merchandise: {
        id: string
        title: string
        image?: {url: string}
        product: {title: string; handle: string; featuredImage?: {url: string}}
        price: {amount: string; currencyCode: string}
      }
    }>
  }
}): ShopifyCart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.cost.subtotalAmount.amount,
    currencyCode: cart.cost.subtotalAmount.currencyCode,
    lines: cart.lines.nodes.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      variantId: line.merchandise.id,
      title: line.merchandise.product.title,
      variantTitle: line.merchandise.title,
      handle: line.merchandise.product.handle,
      price: line.merchandise.price.amount,
      currencyCode: line.merchandise.price.currencyCode,
      imageUrl: line.merchandise.image?.url || line.merchandise.product.featuredImage?.url,
    })),
  }
}

export async function fetchCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await storefrontRequest<{cart: Parameters<typeof mapCart>[0] | null}>(`
    query Cart($id: ID!) {
      cart(id: $id) {
        ${CART_FIELDS}
      }
    }
  `, {id: cartId})

  return data.cart ? mapCart(data.cart) : null
}

export async function createCart(lines: Array<{merchandiseId: string; quantity: number}>) {
  const data = await storefrontRequest<{cartCreate: {cart: Parameters<typeof mapCart>[0]; userErrors: Array<{message: string}>}}>(`
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    input: {lines: lines.map((line) => ({merchandiseId: line.merchandiseId, quantity: line.quantity}))},
  })

  if (data.cartCreate.userErrors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: data.cartCreate.userErrors[0].message,
    })
  }

  return mapCart(data.cartCreate.cart)
}

export async function addCartLines(cartId: string, lines: Array<{merchandiseId: string; quantity: number}>) {
  const data = await storefrontRequest<{cartLinesAdd: {cart: Parameters<typeof mapCart>[0]; userErrors: Array<{message: string}>}}>(`
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          message
        }
      }
    }
  `, {
    cartId,
    lines: lines.map((line) => ({merchandiseId: line.merchandiseId, quantity: line.quantity})),
  })

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw createError({statusCode: 400, statusMessage: data.cartLinesAdd.userErrors[0].message})
  }

  return mapCart(data.cartLinesAdd.cart)
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{id: string; quantity: number}>,
) {
  const data = await storefrontRequest<{cartLinesUpdate: {cart: Parameters<typeof mapCart>[0]; userErrors: Array<{message: string}>}}>(`
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          message
        }
      }
    }
  `, {cartId, lines})

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw createError({statusCode: 400, statusMessage: data.cartLinesUpdate.userErrors[0].message})
  }

  return mapCart(data.cartLinesUpdate.cart)
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  const data = await storefrontRequest<{cartLinesRemove: {cart: Parameters<typeof mapCart>[0]; userErrors: Array<{message: string}>}}>(`
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          message
        }
      }
    }
  `, {cartId, lineIds})

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw createError({statusCode: 400, statusMessage: data.cartLinesRemove.userErrors[0].message})
  }

  return mapCart(data.cartLinesRemove.cart)
}

export async function fetchCheckoutUrl(cartId: string): Promise<string> {
  const data = await storefrontRequest<{cart: {checkoutUrl: string; lines: {nodes: unknown[]}}}>(`
    query CheckoutUrl($id: ID!) {
      cart(id: $id) {
        checkoutUrl
        lines(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  `, {id: cartId})

  if (!data.cart || data.cart.lines.nodes.length === 0) {
    throw createError({statusCode: 400, statusMessage: 'Cart is empty or expired'})
  }

  return data.cart.checkoutUrl
}

export function getCartIdCookie(event: H3Event) {
  return getCookie(event, 'shopify-cart-id')
}

export function setCartIdCookie(event: H3Event, cartId: string) {
  setCookie(event, 'shopify-cart-id', cartId, {
    maxAge: 60 * 60 * 24 * 14,
    path: '/',
    sameSite: 'lax',
  })
}

export function clearCartIdCookie(event: H3Event) {
  deleteCookie(event, 'shopify-cart-id', {path: '/'})
}
