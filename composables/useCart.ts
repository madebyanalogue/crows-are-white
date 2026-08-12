import type {ShopifyCart} from '~/types/shopify'
import { lockOverlayScroll, unlockOverlayScroll } from '~/composables/useOverlayScrollLock'

const CART_SLOT_OPEN_MS = 380

export function useCart() {
  const cart = useState<ShopifyCart | null>('shopify-cart', () => null)
  const loading = useState('shopify-cart-loading', () => false)
  const checkoutLoading = useState('shopify-checkout-loading', () => false)
  const isOpen = useState('cart-drawer-open', () => false)
  const lastAddedLineId = useState<string | null>('cart-last-added-line-id', () => null)
  const lastAddedIsNewLine = useState('cart-last-added-is-new-line', () => false)
  const pendingNewLineSlot = useState('cart-pending-new-line-slot', () => false)
  const isAddingItem = useState('cart-adding-item', () => false)

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

  function waitForSlotOpen() {
    if (!import.meta.client) return Promise.resolve()
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, CART_SLOT_OPEN_MS)
    })
  }

  async function addToCartWithOpen(variantId: string, quantity = 1) {
    const isNewLine = !cart.value?.lines.some((entry) => entry.variantId === variantId)
    isAddingItem.value = true

    try {
      if (!isOpen.value) {
        openCart()
        await waitForCartOpen()
      }

      if (isNewLine) {
        pendingNewLineSlot.value = true
        await nextTick()
        await waitForSlotOpen()
      }

      await mutateCart({action: 'add', variantId, quantity})

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
