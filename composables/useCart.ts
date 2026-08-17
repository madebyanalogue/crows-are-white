import type {ShopifyCart} from '~/types/shopify'
import { lockOverlayScroll, unlockOverlayScroll } from '~/composables/useOverlayScrollLock'

export function useCart() {
  const cart = useState<ShopifyCart | null>('shopify-cart', () => null)
  const loading = useState('shopify-cart-loading', () => false)
  const checkoutLoading = useState('shopify-checkout-loading', () => false)
  const isOpen = useState('cart-drawer-open', () => false)
  const lastAddedLineId = useState<string | null>('cart-last-added-line-id', () => null)
  const lastAddedIsNewLine = useState('cart-last-added-is-new-line', () => false)
  const pendingNewLineSlot = useState('cart-pending-new-line-slot', () => false)
  const isAddingItem = useState('cart-adding-item', () => false)
  const fetchId = useState('shopify-cart-fetch-id', () => 0)

  const count = computed(() => cart.value?.totalQuantity ?? 0)
  const subtotal = computed(() => cart.value?.subtotal ?? '0.00')
  const currencyCode = computed(() => cart.value?.currencyCode ?? 'USD')
  const items = computed(() => cart.value?.lines ?? [])

  async function refreshCart() {
    const id = ++fetchId.value
    loading.value = true
    try {
      const response = await $fetch<{cart: ShopifyCart | null}>('/api/shop/cart')
      if (id !== fetchId.value) return
      cart.value = response.cart
    } finally {
      if (id === fetchId.value) loading.value = false
    }
  }

  onMounted(() => {
    if (cart.value === null) {
      refreshCart()
    }
  })

  async function mutateCart(body: Record<string, unknown>) {
    const id = ++fetchId.value
    loading.value = true
    try {
      const response = await $fetch<{cart: ShopifyCart}>('/api/shop/cart', {
        method: 'POST',
        body,
      })
      if (id !== fetchId.value) return
      cart.value = response.cart
    } finally {
      if (id === fetchId.value) loading.value = false
    }
  }

  async function addToCart(variantId: string, quantity = 1) {
    await mutateCart({action: 'add', variantId, quantity})
  }

  function clearLastAddedLineId() {
    lastAddedLineId.value = null
    lastAddedIsNewLine.value = false
  }

  function waitForCartOpen() {
    if (!import.meta.client) return Promise.resolve()

    const { cartDisplayMode } = useSiteSettings()
    const duration = cartDisplayMode.value === 'drawer' ? 450 : 320
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, duration)
    })
  }

  async function addToCartWithOpen(variantId: string, quantity = 1) {
    const wasOpen = isOpen.value
    const isNewLine = !cart.value?.lines.some((entry) => entry.variantId === variantId)
    isAddingItem.value = true

    try {
      await mutateCart({action: 'add', variantId, quantity})
      await nextTick()

      if (!wasOpen) {
        isOpen.value = true
        return
      }

      if (isNewLine) {
        const line = cart.value?.lines.find((entry) => entry.variantId === variantId)
        if (line) {
          lastAddedLineId.value = line.id
          lastAddedIsNewLine.value = true
        }
      }
    } finally {
      isAddingItem.value = false
      pendingNewLineSlot.value = false
    }
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
    if (!isAddingItem.value) refreshCart()
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
    if (open) lockOverlayScroll()
    else unlockOverlayScroll()
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
    lastAddedLineId,
    lastAddedIsNewLine,
    pendingNewLineSlot,
    isAddingItem,
    refreshCart,
    addToCart,
    addToCartWithOpen,
    clearLastAddedLineId,
    waitForCartOpen,
    updateQty,
    removeFromCart,
    checkout,
    openCart,
    closeCart,
    toggleCart,
  }
}
