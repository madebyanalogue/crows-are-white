export function isOnSale(price: string, compareAtPrice?: string | null) {
  if (!compareAtPrice) return false
  return Number(compareAtPrice) > Number(price)
}
