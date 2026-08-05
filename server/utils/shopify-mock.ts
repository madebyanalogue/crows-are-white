import type {ShopifyCart, ShopifyProduct, ShopifyProductDetail} from '~/types/shopify'
import {isOnSale} from '~/utils/shopifySale'

export const mockProducts: ShopifyProduct[] = [
  {
    id: 'gid://shopify/Product/mock-poster',
    variantId: 'gid://shopify/ProductVariant/mock-poster',
    handle: 'official-poster',
    title: 'Official Poster',
    price: '24.00',
    compareAtPrice: '30.00',
    onSale: true,
    currencyCode: 'USD',
    collections: ['posters'],
    tags: ['prints'],
    productType: 'Prints',
  },
  {
    id: 'gid://shopify/Product/mock-tee',
    variantId: 'gid://shopify/ProductVariant/mock-tee',
    handle: 'directors-cut-tee',
    title: "Director's Cut Tee",
    price: '32.00',
    onSale: false,
    currencyCode: 'USD',
    collections: ['apparel'],
    tags: ['apparel'],
    productType: 'Apparel',
  },
  {
    id: 'gid://shopify/Product/mock-hoodie',
    variantId: 'gid://shopify/ProductVariant/mock-hoodie',
    handle: 'monk-metal-hoodie',
    title: 'Monk & Metal Hoodie',
    price: '58.00',
    compareAtPrice: '72.00',
    onSale: true,
    currencyCode: 'USD',
    collections: ['apparel'],
    tags: ['apparel'],
    productType: 'Apparel',
  },
  {
    id: 'gid://shopify/Product/mock-cap',
    variantId: 'gid://shopify/ProductVariant/mock-cap',
    handle: 'ice-cream-club-cap',
    title: 'Ice Cream Club Cap',
    price: '28.00',
    onSale: false,
    currencyCode: 'USD',
    collections: ['apparel'],
    tags: ['apparel'],
    productType: 'Apparel',
  },
]

const mockDescriptions: Record<string, string> = {
  'official-poster': 'Official Crows Are White theatrical poster. Printed on premium matte stock.',
  'directors-cut-tee': 'Soft cotton tee featuring key art from the film. Unisex fit.',
  'monk-metal-hoodie': 'Heavyweight hoodie for late-night enlightenment sessions and metal shows.',
  'ice-cream-club-cap': 'Embroidered cap — ice cream club membership not required.',
}

export function getMockProductByHandle(handle: string): ShopifyProductDetail | null {
  const product = mockProducts.find((item) => item.handle === handle)
  if (!product) return null

  return {
    ...product,
    description: mockDescriptions[handle] || '',
    images: product.imageUrl
      ? [{url: product.imageUrl, altText: product.imageAlt || product.title}]
      : [],
    variants: [{
      id: product.variantId,
      title: 'Default',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      onSale: isOnSale(product.price, product.compareAtPrice),
      currencyCode: product.currencyCode,
      availableForSale: true,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
    }],
  }
}

type MockLine = {
  id: string
  variantId: string
  quantity: number
}

function emptyCart(): ShopifyCart {
  return {
    id: 'mock-cart',
    checkoutUrl: '',
    totalQuantity: 0,
    subtotal: '0.00',
    currencyCode: 'USD',
    lines: [],
  }
}

function buildMockCart(lines: MockLine[]): ShopifyCart {
  if (lines.length === 0) {
    return emptyCart()
  }

  const cartLines = lines.map((line) => {
    const product = mockProducts.find((item) => item.variantId === line.variantId)
    if (!product) {
      throw createError({statusCode: 400, statusMessage: 'Unknown product variant'})
    }

    return {
      id: line.id,
      quantity: line.quantity,
      variantId: product.variantId,
      title: product.title,
      variantTitle: 'Default',
      handle: product.handle,
      price: product.price,
      currencyCode: product.currencyCode,
      imageUrl: product.imageUrl,
    }
  })

  const subtotal = cartLines
    .reduce((sum, line) => sum + Number(line.price) * line.quantity, 0)
    .toFixed(2)

  return {
    id: 'mock-cart',
    checkoutUrl: 'https://checkout.shopify.com/mock/crows-are-white',
    totalQuantity: cartLines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    currencyCode: 'USD',
    lines: cartLines,
  }
}

export function readMockCart(event: Parameters<typeof getCookie>[0]): ShopifyCart {
  const raw = getCookie(event, 'mock-cart')
  if (!raw) {
    return emptyCart()
  }

  try {
    const lines = JSON.parse(raw) as MockLine[]
    return buildMockCart(lines)
  } catch {
    return emptyCart()
  }
}

export function writeMockCart(event: Parameters<typeof setCookie>[0], lines: MockLine[]) {
  setCookie(event, 'mock-cart', JSON.stringify(lines), {
    maxAge: 60 * 60 * 24 * 14,
    path: '/',
    sameSite: 'lax',
  })
}

export function clearMockCart(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, 'mock-cart', {path: '/'})
}

export function addMockLine(event: Parameters<typeof getCookie>[0], variantId: string, quantity = 1) {
  const cart = readMockCart(event)
  const lines: MockLine[] = cart.lines.map((line) => ({
    id: line.id,
    variantId: line.variantId,
    quantity: line.quantity,
  }))

  const existing = lines.find((line) => line.variantId === variantId)
  if (existing) {
    existing.quantity += quantity
  } else {
    lines.push({
      id: `mock-line-${variantId}`,
      variantId,
      quantity,
    })
  }

  writeMockCart(event, lines)
  return buildMockCart(lines)
}

export function updateMockLine(
  event: Parameters<typeof getCookie>[0],
  lineId: string,
  quantity: number,
) {
  const cart = readMockCart(event)
  let lines: MockLine[] = cart.lines.map((line) => ({
    id: line.id,
    variantId: line.variantId,
    quantity: line.quantity,
  }))

  if (quantity <= 0) {
    lines = lines.filter((line) => line.id !== lineId)
  } else {
    const target = lines.find((line) => line.id === lineId)
    if (!target) {
      throw createError({statusCode: 404, statusMessage: 'Cart line not found'})
    }
    target.quantity = quantity
  }

  writeMockCart(event, lines)
  return buildMockCart(lines)
}

export function removeMockLine(event: Parameters<typeof getCookie>[0], lineId: string) {
  return updateMockLine(event, lineId, 0)
}
