type ProductOptionLike = {
  name: string
  values?: string[]
}

type VariantAvailabilityLike = {
  availableForSale?: boolean
  currentlyNotInStock?: boolean
} | null | undefined

export function isVariantPurchasable(variant: VariantAvailabilityLike) {
  if (!variant) return false
  if (variant.availableForSale) return true

  // Continue selling when out of stock. availableForSale:false +
  // currentlyNotInStock:false is sold out — Shopify adds those at quantity 0.
  return variant.currentlyNotInStock === true
}

export function resolveDefaultVariantId(
  variants: Array<{id: string} & VariantAvailabilityLike> | undefined,
  preferredId = '',
) {
  if (!variants?.length) return ''
  if (preferredId && variants.some((variant) => variant.id === preferredId)) {
    return preferredId
  }

  return (variants.find((variant) => isVariantPurchasable(variant)) || variants[0]).id
}

export function resolveVariantOptionName(
  options: ProductOptionLike[] | undefined,
  fallback = 'Variant',
) {
  if (!options?.length) return fallback

  const multiValueOption = options.find((option) => (option.values?.length ?? 0) > 1)
  if (multiValueOption) return multiValueOption.name

  const nonTitleOption = options.find((option) => option.name !== 'Title')
  return nonTitleOption?.name || options[0]?.name || fallback
}
