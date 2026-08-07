export type ShopifyProduct = {
  id: string
  variantId: string
  handle: string
  title: string
  price: string
  currencyCode: string
  compareAtPrice?: string
  onSale: boolean
  imageUrl?: string
  imageAlt?: string
  hoverImageUrl?: string
  hoverImageAlt?: string
  productType?: string
  tags?: string[]
  collections?: string[]
}

export type ShopifyProductVariant = {
  id: string
  title: string
  price: string
  currencyCode: string
  compareAtPrice?: string
  onSale: boolean
  availableForSale: boolean
  imageUrl?: string
  imageAlt?: string
}

export type ShopifyProductDetail = ShopifyProduct & {
  description?: string
  images: Array<{url: string; altText?: string}>
  variants: ShopifyProductVariant[]
}

export type ShopifyCartLine = {
  id: string
  quantity: number
  variantId: string
  title: string
  variantTitle: string
  handle: string
  price: string
  currencyCode: string
  imageUrl?: string
}

export type ShopifyCart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  subtotal: string
  currencyCode: string
  lines: ShopifyCartLine[]
}

export type CartAction =
  | { action: 'add'; variantId: string; quantity?: number }
  | { action: 'update'; lineId: string; quantity: number }
  | { action: 'remove'; lineId: string }
