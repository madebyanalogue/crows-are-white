<script setup lang="ts">
const props = defineProps({
  variant: {
    type: String,
    default: 'drawer',
    validator: (value: string) => ['drawer', 'dropdown'].includes(value),
  },
})

const emit = defineEmits(['close'])

const {
  items,
  subtotal,
  currencyCode,
  updateQty,
  removeFromCart,
  checkout,
  checkoutLoading,
  loading,
  lastAddedLineId,
  isAddingItem,
  clearLastAddedLineId,
} = useCart()

function formatPrice(amount: string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))
}

function lineTotal(price: string, qty: number) {
  return formatPrice((Number(price) * qty).toFixed(2), currencyCode.value)
}

function onClose() {
  emit('close')
}

function onItemEnterEnd(lineId: string, event: AnimationEvent) {
  if (event.animationName !== 'cart-item-enter') return
  if (lineId === lastAddedLineId.value) {
    clearLastAddedLineId()
  }
}
</script>

<template>
  <div
    class="cart-panel"
    :class="`cart-panel--${props.variant}`"
  >
    <header class="cart-panel__header">
      <h2 class="cart-panel__title">Your Cart</h2>
      <button
        type="button"
        class="cart-panel__close"
        aria-label="Close cart"
        @click="onClose"
      >
        ✕
      </button>
    </header>

    <div
      v-if="loading && items.length === 0 && !isAddingItem"
      class="cart-panel__empty"
    >
      Loading cart…
    </div>

    <div
      v-else-if="items.length === 0 && isAddingItem"
      class="cart-panel__empty"
    >
      Adding to cart…
    </div>

    <div
      v-else-if="items.length === 0"
      class="cart-panel__empty"
    >
      <p>Your cart is empty.</p>
      <NuxtLink
        to="/shop"
        class="cart-panel__shop-link"
        @click="onClose"
      >
        Browse the shop
      </NuxtLink>
    </div>

    <template v-else>
      <ul class="cart-panel__items">
        <li
          v-for="item in items"
          :key="item.id"
          class="cart-panel__item"
          :class="{ 'cart-panel__item--entering': item.id === lastAddedLineId }"
          @animationend="onItemEnterEnd(item.id, $event)"
        >
          <component
            :is="item.handle ? 'NuxtLink' : 'div'"
            v-bind="item.handle ? { to: `/shop/${item.handle}` } : {}"
            class="cart-panel__thumb"
            @click="onClose"
          >
            <img
              v-if="item.imageUrl"
              class="cart-panel__thumb-image"
              :src="item.imageUrl"
              :alt="item.title"
              loading="lazy"
              draggable="false"
            >
            <span
              v-else
              class="cart-panel__thumb-placeholder"
              aria-hidden="true"
            />
          </component>

          <div class="cart-panel__item-body">
            <div class="cart-panel__item-main">
              <p class="cart-panel__item-title">{{ item.title }}</p>
              <p
                v-if="item.variantTitle && item.variantTitle !== 'Default Title'"
                class="cart-panel__item-variant"
              >
                {{ item.variantTitle }}
              </p>
              <p class="cart-panel__item-price">
                {{ formatPrice(item.price, item.currencyCode) }}
              </p>
            </div>

            <div class="cart-panel__item-actions">
              <select
                :value="item.quantity"
                class="cart-panel__qty"
                @change="updateQty(item.id, Number(($event.target as HTMLSelectElement).value))"
              >
                <option
                  v-for="n in 10"
                  :key="n"
                  :value="n"
                >
                  {{ n }}
                </option>
              </select>
              <button
                type="button"
                class="cart-panel__remove"
                aria-label="Remove item"
                @click="removeFromCart(item.id)"
              >
                <TrashIcon />
              </button>
              <p class="cart-panel__line-total">
                {{ lineTotal(item.price, item.quantity) }}
              </p>
            </div>
          </div>
        </li>
      </ul>

      <footer class="cart-panel__footer">
        <div class="cart-panel__subtotal">
          <span>Subtotal</span>
          <span class="cart-panel__subtotal-value">{{ formatPrice(subtotal, currencyCode) }}</span>
        </div>
        <p class="cart-panel__note">
          Shipping and taxes calculated at checkout.
        </p>
        <button
          type="button"
          class="cart-panel__checkout"
          :disabled="checkoutLoading"
          @click="checkout"
        >
          {{ checkoutLoading ? 'Redirecting…' : 'Checkout' }}
        </button>
        <NuxtLink
          to="/shop"
          class="cart-panel__continue"
          @click="onClose"
        >
          Continue shopping
        </NuxtLink>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.cart-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--sans);
  font-weight: 400;
  color: var(--text-color, #111010);
}

.cart-panel :is(strong, b) {
  font-weight: 400;
}

.cart-panel--drawer {
  height: 100%;
  background: #fff;
}

.cart-panel--dropdown {
  min-height: 0;
  background: transparent;
  color: var(--menu-text-color, var(--obsidian));
}

.cart-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 47px 14px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
}

.cart-panel__title {
  margin: 0;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.cart-panel__close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0;
  background: color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
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
  padding: 32px 24px;
  color: color-mix(in srgb, currentColor 58%, transparent);
}

.cart-panel__shop-link,
.cart-panel__continue {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.cart-panel__items {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 8px 47px;
  max-height: min(52vh, 420px);
}

.cart-panel__item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  padding: 14px 4px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}

.cart-panel__item--entering {
  animation: cart-item-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cart-item-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-panel__thumb {
  display: block;
  width: 72px;
  aspect-ratio: 1;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 6%, transparent);
  color: inherit;
  text-decoration: none;
}

.cart-panel__thumb-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-panel__thumb-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.cart-panel__item-body {
  min-width: 0;
}

.cart-panel__item-title {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.35;
}

.cart-panel__item-variant {
  margin: 0.2rem 0 0;
  font-size: 12px;
  color: color-mix(in srgb, currentColor 58%, transparent);
}

.cart-panel__item-price {
  margin: 0.35rem 0 0;
  font-size: 12px;
  color: color-mix(in srgb, currentColor 58%, transparent);
}

.cart-panel__item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.cart-panel__qty {
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 0;
  padding: 5px 8px;
  font-size: 12px;
  background: transparent;
  color: inherit;
}

.cart-panel__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  border: none;
  background: none;
  color: color-mix(in srgb, currentColor 52%, transparent);
  cursor: pointer;
  transition: color 0.15s ease;
}

.cart-panel__remove:hover {
  color: inherit;
}

.cart-panel__line-total {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
}

.cart-panel__footer {
  padding: 16px 47px 35px;
  border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
}

.cart-panel__subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 8px;
}

.cart-panel__subtotal-value {
  font-weight: 400;
}

.cart-panel__note {
  margin: 0 0 14px;
  font-size: 11px;
  color: color-mix(in srgb, currentColor 52%, transparent);
}

.cart-panel__checkout {
  width: 100%;
  border: none;
  border-radius: 0;
  padding: 14px 20px;
  background: var(--menu-text-color, #111010);
  color: var(--menu-background-color, #fff);
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
}

.cart-panel--drawer .cart-panel__checkout {
  background: #111010;
  color: #fff;
}

.cart-panel__checkout:disabled {
  opacity: 0.6;
  cursor: wait;
}

.cart-panel__continue {
  display: block;
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: color-mix(in srgb, currentColor 58%, transparent);
}
</style>
