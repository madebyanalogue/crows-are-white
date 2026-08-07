import type {ShopifyCart} from '~/types/shopify'

export function useCart() {
  const cart = useState<ShopifyCart | null>('shopify-cart', () => null)
  const loading = useState('shopify-cart-loading', () => false)
  const checkoutLoading = useState('shopify-checkout-loading', () => false)
  const isOpen = useState('cart-drawer-open', () => false)

  const count = computed(() => cart.value?.totalQuantity ?? 0)
  const subtotal = computed(() => cart.value?.subtotal ?? '0.00')
  const currencyCode = computed(() => cart.value?.currencyCode ?? 'USD')
  const items = computed(() => cart.value?.lines ?? [])

  async function refreshCart() {
    loading.value = true
    try {
      const response = await $fetch<{cart: ShopifyCart | null}>('/api/shop/cart')
      cart.value = response.cart
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (cart.value === null) {
      refreshCart()
    }
  })

  async function mutateCart(body: Record<string, unknown>) {
    loading.value = true
    try {
      const response = await $fetch<{cart: ShopifyCart}>('/api/shop/cart', {
        method: 'POST',
        body,
      })
      cart.value = response.cart
    } finally {
      loading.value = false
    }
  }

  function addToCart(variantId: string, quantity = 1) {
    return mutateCart({action: 'add', variantId, quantity})
  }

  function updateQty(lineId: string, quantity: number) {
    return mutateCart({action: 'update', lineId, quantity})
  }

  function removeFromCart(lineId: string) {
    return mutateCart({action: 'remove', lineId})
  }

  async function checkout() {
    checkoutLoading.value = true
    try {
      const response = await $fetch<{checkoutUrl: string}>('/api/shop/checkout-url', {
        method: 'POST',
      })
      await navigateTo(response.checkoutUrl, {external: true})
    } finally {
      checkoutLoading.value = false
    }
  }

  function openCart() {
    isOpen.value = true
    refreshCart()
  }

  function closeCart() {
    isOpen.value = false
  }

  function toggleCart() {
    if (isOpen.value) closeCart()
    else openCart()
  }

  const { cartDisplayMode } = useSiteSettings()

  watch(isOpen, (open) => {
    if (!import.meta.client || cartDisplayMode.value !== 'drawer') return
    document.body.style.overflow = open ? 'hidden' : ''
  })

  return {
    cart,
    items,
    count,
    subtotal,
    currencyCode,
    loading,
    checkoutLoading,
    isOpen,
    refreshCart,
    addToCart,
    updateQty,
    removeFromCart,
    checkout,
    openCart,
    closeCart,
    toggleCart,
  }
}
