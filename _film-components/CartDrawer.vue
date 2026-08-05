<script setup lang="ts">
const {
  isOpen,
  closeCart,
  items,
  subtotal,
  currencyCode,
  updateQty,
  removeFromCart,
  checkout,
  checkoutLoading,
  loading,
} = useCart()

const panelRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
const {$gsap: gsap} = useNuxtApp()

function formatPrice(amount: string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(Number(amount))
}

function lineTotal(price: string, qty: number) {
  return formatPrice((Number(price) * qty).toFixed(2), currencyCode.value)
}

watch(isOpen, async (open) => {
  if (!import.meta.client || !gsap) return
  await nextTick()

  if (open) {
    gsap.set(panelRef.value, {x: '105%', opacity: 0})
    gsap.set(overlayRef.value, {opacity: 0})
    gsap.to(overlayRef.value, {opacity: 1, duration: 0.25, ease: 'power2.out'})
    gsap.to(panelRef.value, {x: '0%', opacity: 1, duration: 0.45, ease: 'power3.out'})
  }
})

function animateClose() {
  if (!gsap) {
    closeCart()
    return
  }

  gsap.to(panelRef.value, {x: '105%', opacity: 0, duration: 0.35, ease: 'power3.in'})
  gsap.to(overlayRef.value, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: closeCart,
  })
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === overlayRef.value) {
    animateClose()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    animateClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="overlayRef"
      class="cart-overlay"
      @click="onOverlayClick"
    >
      <aside
        ref="panelRef"
        class="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        @click.stop
      >
        <header class="cart-panel__header">
          <h2 class="cart-panel__title">Your Cart</h2>
          <button type="button" class="cart-panel__close" aria-label="Close cart" @click="animateClose">
            ✕
          </button>
        </header>

        <div v-if="loading && items.length === 0" class="cart-panel__empty">
          Loading cart…
        </div>

        <div v-else-if="items.length === 0" class="cart-panel__empty">
          <p>Your cart is empty.</p>
          <NuxtLink to="/shop" class="cart-panel__shop-link" @click="animateClose">
            Browse the shop
          </NuxtLink>
        </div>

        <template v-else>
          <ul class="cart-panel__items">
            <li v-for="item in items" :key="item.id" class="cart-panel__item">
              <div class="cart-panel__item-main">
                <p class="cart-panel__item-title">{{ item.title }}</p>
                <p class="cart-panel__item-price">{{ formatPrice(item.price, item.currencyCode) }}</p>
              </div>
              <div class="cart-panel__item-actions">
                <select
                  :value="item.quantity"
                  class="cart-panel__qty"
                  @change="updateQty(item.id, Number(($event.target as HTMLSelectElement).value))"
                >
                  <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                </select>
                <button type="button" class="cart-panel__remove" @click="removeFromCart(item.id)">
                  Remove
                </button>
              </div>
              <p class="cart-panel__line-total">{{ lineTotal(item.price, item.quantity) }}</p>
            </li>
          </ul>

          <footer class="cart-panel__footer">
            <div class="cart-panel__subtotal">
              <span>Subtotal</span>
              <strong>{{ formatPrice(subtotal, currencyCode) }}</strong>
            </div>
            <p class="cart-panel__note">Shipping and taxes calculated at checkout.</p>
            <button
              type="button"
              class="cart-panel__checkout"
              :disabled="checkoutLoading"
              @click="checkout"
            >
              {{ checkoutLoading ? 'Redirecting…' : 'Checkout' }}
            </button>
            <NuxtLink to="/shop" class="cart-panel__continue" @click="animateClose">
              Continue shopping
            </NuxtLink>
          </footer>
        </template>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}

.cart-panel {
  width: 100%;
  max-width: 420px;
  height: 100%;
  max-height: calc(100svh - 32px);
  align-self: center;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--sans);
}

.cart-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.cart-panel__title {
  font-size: 18px;
  font-weight: 600;
  color: #111010;
}

.cart-panel__close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.05);
  color: #111010;
  cursor: pointer;
  font-size: 14px;
}

.cart-panel__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
  color: rgba(17, 16, 16, 0.6);
}

.cart-panel__shop-link {
  color: #111010;
  text-decoration: underline;
}

.cart-panel__items {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 8px 16px;
}

.cart-panel__item {
  padding: 16px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.cart-panel__item-title {
  font-size: 15px;
  font-weight: 600;
  color: #111010;
}

.cart-panel__item-price {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(17, 16, 16, 0.55);
}

.cart-panel__item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.cart-panel__qty {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0;
  padding: 6px 10px;
  font-size: 13px;
}

.cart-panel__remove {
  border: none;
  background: none;
  font-size: 12px;
  color: rgba(17, 16, 16, 0.5);
  text-decoration: underline;
  cursor: pointer;
}

.cart-panel__line-total {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}

.cart-panel__footer {
  padding: 20px 24px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.cart-panel__subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  margin-bottom: 8px;
}

.cart-panel__note {
  font-size: 12px;
  color: rgba(17, 16, 16, 0.5);
  margin-bottom: 16px;
}

.cart-panel__checkout {
  width: 100%;
  border: none;
  border-radius: 0;
  padding: 16px 24px;
  background: #111010;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.cart-panel__checkout:disabled {
  opacity: 0.6;
  cursor: wait;
}

.cart-panel__continue {
  display: block;
  margin-top: 12px;
  text-align: center;
  font-size: 13px;
  color: rgba(17, 16, 16, 0.6);
}
</style>
