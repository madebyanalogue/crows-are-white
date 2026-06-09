import { products } from '~/data/site'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])

  const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0))

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0),
  )

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const existing = items.value.find((i) => i.id === productId)
    if (existing) {
      existing.qty += 1
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
      })
    }
  }

  function updateQty(productId: string, qty: number) {
    const item = items.value.find((i) => i.id === productId)
    if (!item) return
    if (qty <= 0) {
      removeFromCart(productId)
    } else {
      item.qty = qty
    }
  }

  function removeFromCart(productId: string) {
    items.value = items.value.filter((i) => i.id !== productId)
  }

  return { items, count, subtotal, addToCart, updateQty, removeFromCart }
}
