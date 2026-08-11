<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps({
  variant: {
    type: String,
    default: 'drawer',
    validator: (value: string) => ['drawer', 'dropdown'].includes(value),
  },
  revealContent: {
    type: Boolean,
    default: false,
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
  lastAddedIsNewLine,
  pendingNewLineSlot,
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
  if (lineId !== lastAddedLineId.value || !lastAddedIsNewLine.value) return
  clearLastAddedLineId()
}

const panelRef = ref<HTMLElement | null>(null)
let revealTween: gsap.core.Tween | null = null
let hasRevealedContent = false

function revealTargetEls() {
  const root = panelRef.value
  if (!root) return []

  const items = root.querySelectorAll(
    '.cart-panel__item:not(.cart-panel__item--placeholder)',
  )
  const footer = root.querySelector('.cart-panel__footer')
  const empty = root.querySelector('.cart-panel__empty')
  const targets = [...items]
  if (footer) targets.push(footer)
  else if (empty) targets.push(empty)
  return targets
}

function killRevealTween() {
  revealTween?.kill()
  revealTween = null
}

function resetRevealTargets() {
  if (props.variant !== 'dropdown' || !import.meta.client) return
  const targets = revealTargetEls()
  if (targets.length) gsap.set(targets, { autoAlpha: 0, y: 14 })
}

function animateRevealTargets() {
  if (props.variant !== 'dropdown' || !import.meta.client) return

  const targets = revealTargetEls()
  if (!targets.length) return

  killRevealTween()
  gsap.set(targets, { autoAlpha: 0, y: 14 })
  revealTween = gsap.to(targets, {
    autoAlpha: 1,
    y: 0,
    duration: 0.38,
    stagger: 0.055,
    ease: 'power2.out',
    onComplete: () => {
      revealTween = null
    },
  })
  hasRevealedContent = true
}

function scheduleReveal() {
  if (props.variant !== 'dropdown' || !props.revealContent) return

  nextTick(() => {
    if (!props.revealContent) return
    animateRevealTargets()
  })
}

function canRevealNow() {
  if (loading.value && items.value.length === 0 && !isAddingItem.value) return false
  return true
}

function hideRevealTargets() {
  if (props.variant !== 'dropdown' || !import.meta.client) return
  resetRevealTargets()
}

watch(() => props.revealContent, (visible) => {
  if (props.variant !== 'dropdown' || !import.meta.client) return

  if (!visible) {
    hasRevealedContent = false
    killRevealTween()
    resetRevealTargets()
    return
  }

  hideRevealTargets()
  if (canRevealNow()) scheduleReveal()
})

watch([loading, () => items.value.length, pendingNewLineSlot, isAddingItem], () => {
  if (props.variant !== 'dropdown' || !import.meta.client) return

  if (!props.revealContent) {
    hideRevealTargets()
    return
  }

  if (hasRevealedContent) return
  if (!canRevealNow()) return
  hideRevealTargets()
  scheduleReveal()
})

onMounted(() => {
  if (props.variant === 'dropdown') {
    hideRevealTargets()
  }
})

onBeforeUnmount(() => {
  killRevealTween()
})
</script>

<template>
  <div
    ref="panelRef"
    class="cart-panel"
    :class="[
      `cart-panel--${props.variant}`,
      {
        'cart-panel--content-hidden':
          props.variant === 'dropdown' && !props.revealContent,
      },
    ]"
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
      v-if="loading && items.length === 0 && !isAddingItem && props.variant !== 'dropdown'"
      class="cart-panel__empty"
    >
      Loading cart…
    </div>

    <div
      v-else-if="items.length === 0 && isAddingItem && !pendingNewLineSlot"
      class="cart-panel__empty"
    >
      Adding to cart…
    </div>

    <div
      v-else-if="items.length === 0 && !pendingNewLineSlot && !(props.variant === 'dropdown' && loading)"
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

    <template v-else-if="items.length > 0 || pendingNewLineSlot">
      <ul class="cart-panel__items">
        <li
          v-for="item in items"
          :key="item.id"
          class="cart-panel__item"
          :class="{
            'cart-panel__item--content-entering':
              item.id === lastAddedLineId && lastAddedIsNewLine,
          }"
          @animationend="onItemEnterEnd(item.id, $event)"
        >
          <div class="cart-panel__item-slot">
            <div class="cart-panel__item-inner">
              <NuxtLink
                v-if="item.handle"
                :to="`/shop/${item.handle}`"
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
              </NuxtLink>
              <div
                v-else
                class="cart-panel__thumb"
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
              </div>

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
            </div>
          </div>
        </li>

        <li
          v-if="pendingNewLineSlot && !lastAddedLineId"
          class="cart-panel__item cart-panel__item--placeholder cart-panel__item--slot-opening"
          aria-hidden="true"
        >
          <div class="cart-panel__item-slot">
            <div class="cart-panel__item-inner cart-panel__item-inner--placeholder" />
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
  color: var(--cart-text-color, var(--menu-text-color, var(--obsidian)));
}

.cart-panel :is(strong, b) {
  font-weight: 400;
}

.cart-panel--drawer {
  height: 100%;
  background: var(--cart-background-color, var(--menu-background-color, #fff));
}

.cart-panel--dropdown {
  min-height: 0;
  background: var(--cart-background-color, var(--menu-background-color, transparent));
  color: var(--cart-text-color, var(--menu-text-color, var(--obsidian)));
}

.cart-panel--dropdown.cart-panel--content-hidden {
  opacity: 0;
  visibility: hidden;
}

.cart-panel--dropdown.cart-panel--content-hidden :is(
  .cart-panel__item:not(.cart-panel__item--placeholder),
  .cart-panel__footer,
  .cart-panel__empty
) {
  opacity: 0;
  transform: translateY(14px);
}

.cart-panel__header {
  display: none;
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
  padding: 0 4px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}

.cart-panel__item-slot {
  display: grid;
  grid-template-rows: 1fr;
}

.cart-panel__item-inner {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
  padding: 14px 0;
  overflow: hidden;
}

.cart-panel__item--placeholder {
  pointer-events: none;
}

.cart-panel__item--slot-opening .cart-panel__item-slot {
  grid-template-rows: 0fr;
  animation: cart-slot-open 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.cart-panel__item-inner--placeholder {
  min-height: 100px;
}

.cart-panel__item--content-entering .cart-panel__item-inner {
  animation: cart-item-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cart-slot-open {
  to {
    grid-template-rows: 1fr;
  }
}

@keyframes cart-item-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
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
  transition: opacity 0.2s ease;
}

.cart-panel__thumb:hover,
.cart-panel__thumb:focus-visible {
  opacity: 0.82;
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
  color: inherit;
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
  color: inherit;
}

.cart-panel__checkout {
  width: 100%;
  border: none;
  border-radius: 0;
  padding: 14px 20px;
  background: var(--cart-feature-color, var(--menu-highlight-color, #111010));
  color: var(--cart-background-color, var(--menu-background-color, #fff));
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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
  font-size: 12px;
  color: color-mix(in srgb, currentColor 58%, transparent);
}
</style>
