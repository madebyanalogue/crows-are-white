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

  // Untracked inventory (and some channel configs) can report availableForSale:false
  // while the variant is still purchasable. currentlyNotInStock:false means not sold out.
  return variant.currentlyNotInStock === false
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
