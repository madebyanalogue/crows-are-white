<script setup lang="ts">
import gsap from 'gsap'
import type {ShopifyCartLine} from '~/types/shopify'

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

const exitingItems = ref<ShopifyCartLine[] | null>(null)
const exitingSubtotal = ref<string | null>(null)
const skipEmptyLoading = ref(false)
let clearLastTween: gsap.core.Animation | null = null

const displayItems = computed(() => exitingItems.value ?? items.value)
const displaySubtotal = computed(() => exitingSubtotal.value ?? subtotal.value)

function killClearLastTween() {
  clearLastTween?.kill()
  clearLastTween = null
}

function resetClearLastState() {
  killClearLastTween()
  exitingItems.value = null
  exitingSubtotal.value = null
  skipEmptyLoading.value = false
  if (import.meta.client && panelRef.value) {
    gsap.set(panelRef.value, { clearProps: 'height,overflow' })
  }
}

async function onRemoveItem(lineId: string) {
  const isLastItem = items.value.length === 1 && !exitingItems.value
  if (!isLastItem || !import.meta.client || !panelRef.value) {
    return removeFromCart(lineId)
  }

  const panel = panelRef.value
  exitingItems.value = items.value.slice()
  exitingSubtotal.value = subtotal.value
  skipEmptyLoading.value = true
  const removePromise = removeFromCart(lineId)

  try {
    await nextTick()
    killRevealTween()
    killClearLastTween()

    const filled = panel.querySelectorAll('.cart-panel__item, .cart-panel__footer')
    const fadeOut = gsap.to(filled, {
      autoAlpha: 0,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: true,
    })
    clearLastTween = fadeOut
    await fadeOut

    if (props.variant === 'dropdown') {
      gsap.set(panel, {
        height: panel.getBoundingClientRect().height,
        overflow: 'hidden',
      })
    }

    exitingItems.value = null
    exitingSubtotal.value = null
    await nextTick()

    const emptyEl = panel.querySelector('.cart-panel__empty')
    if (emptyEl) gsap.set(emptyEl, { autoAlpha: 0 })

    if (props.variant === 'dropdown') {
      const target = emptyEl ? emptyEl.scrollHeight : panel.scrollHeight
      const heightTween = gsap.to(panel, {
        height: target,
        duration: 0.34,
        ease: 'power2.inOut',
        overwrite: true,
      })
      clearLastTween = heightTween
      await heightTween
    }

    if (emptyEl) {
      const fadeIn = gsap.to(emptyEl, {
        autoAlpha: 1,
        duration: 0.32,
        ease: 'power2.out',
      })
      clearLastTween = fadeIn
      await fadeIn
    }

    if (props.variant === 'dropdown') {
      gsap.set(panel, { clearProps: 'height,overflow' })
    }
  } catch {
    resetClearLastState()
  } finally {
    exitingItems.value = null
    exitingSubtotal.value = null
    clearLastTween = null
    await removePromise
    skipEmptyLoading.value = false
  }
}

function onItemEnterEnd(lineId: string, event: AnimationEvent) {
  if (event.animationName !== 'cart-item-enter') return
  if (lineId !== lastAddedLineId.value || !lastAddedIsNewLine.value) return
  clearLastAddedLineId()
}

const panelRef = ref<HTMLElement | null>(null)
const itemsListRef = ref<HTMLElement | null>(null)
const footerBorderVisible = ref(false)
let itemsResizeObserver: ResizeObserver | null = null
let revealTween: gsap.core.Tween | null = null
let hasRevealedContent = false

const showEmptyPanel = computed(() =>
  items.value.length === 0 && !pendingNewLineSlot.value && !exitingItems.value,
)

const emptyPanelMessage = computed(() => {
  if (displayItems.value.length > 0 || skipEmptyLoading.value) return ''
  if (isAddingItem.value) return 'Adding to cart…'
  if (loading.value && !isAddingItem.value) return 'Loading cart…'
  return ''
})

function updateFooterBorderVisibility() {
  const el = itemsListRef.value
  if (!el) {
    footerBorderVisible.value = false
    return
  }

  footerBorderVisible.value = el.scrollHeight > el.clientHeight + 1
}

function bindItemsList(el: HTMLElement | null) {
  itemsListRef.value = el
  itemsResizeObserver?.disconnect()
  itemsResizeObserver = null

  if (!el || !import.meta.client) {
    footerBorderVisible.value = false
    return
  }

  itemsResizeObserver = new ResizeObserver(() => {
    updateFooterBorderVisibility()
  })
  itemsResizeObserver.observe(el)
  updateFooterBorderVisibility()
}

function scheduleFooterBorderCheck() {
  if (!import.meta.client) return
  nextTick(() => {
    updateFooterBorderVisibility()
    requestAnimationFrame(updateFooterBorderVisibility)
  })
}

function revealTargetEls() {
  const root = panelRef.value
  if (!root) return []

  const itemEls = root.querySelectorAll(
    '.cart-panel__item:not(.cart-panel__item--placeholder)',
  )
  const footer = root.querySelector('.cart-panel__footer')
  const empty = root.querySelector('.cart-panel__empty')
  const targets = [...itemEls]
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
      scheduleFooterBorderCheck()
    },
  })
  hasRevealedContent = true
  scheduleFooterBorderCheck()
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
    resetClearLastState()
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
    scheduleFooterBorderCheck()
    return
  }

  if (hasRevealedContent) {
    scheduleFooterBorderCheck()
    return
  }
  if (!canRevealNow()) return
  hideRevealTargets()
  scheduleReveal()
})

watch([() => items.value.length, pendingNewLineSlot, () => props.variant], scheduleFooterBorderCheck)

onMounted(() => {
  if (props.variant === 'dropdown') {
    hideRevealTargets()
  }
  scheduleFooterBorderCheck()
  window.addEventListener('resize', scheduleFooterBorderCheck, { passive: true })
})

onBeforeUnmount(() => {
  killRevealTween()
  killClearLastTween()
  itemsResizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleFooterBorderCheck)
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
        'cart-panel--clearing-last': Boolean(exitingItems),
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
      v-if="showEmptyPanel"
      class="cart-panel__empty"
    >
      <template v-if="emptyPanelMessage">
        <p>{{ emptyPanelMessage }}</p>
      </template>
      <template v-else>
        <p>Your cart is empty.</p>
        <NuxtLink
          to="/shop"
          class="cart-panel__shop-link"
          @click="onClose"
        >
          Browse the shop
        </NuxtLink>
      </template>
    </div>

    <template v-else>
      <ul
        :ref="bindItemsList"
        class="cart-panel__items"
        data-lenis-prevent
      >
        <li
          v-for="item in displayItems"
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
                  <div class="cart-panel__qty-wrap">
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
                  </div>
                  <button
                    type="button"
                    class="cart-panel__remove"
                    aria-label="Remove item"
                    @click="onRemoveItem(item.id)"
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

      <footer
        class="cart-panel__footer"
        :class="{ 'cart-panel__footer--scrollable': footerBorderVisible }"
      >
        <div class="cart-panel__subtotal">
          <span>Subtotal</span>
          <span class="cart-panel__subtotal-value">{{ formatPrice(displaySubtotal, currencyCode) }}</span>
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

.cart-panel--clearing-last {
  pointer-events: none;
}

.cart-panel :is(strong, b) {
  font-weight: 400;
}

.cart-panel--drawer {
  height: 100%;
  min-height: 0;
  background: var(--cart-background-color, var(--menu-background-color, #fff));
}

.cart-panel--dropdown {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  background: var(--cart-background-color, var(--menu-background-color, transparent));
  color: var(--cart-text-color, var(--menu-text-color, var(--obsidian)));
}

.cart-panel--dropdown.cart-panel--content-hidden {
  opacity: 0;
  visibility: hidden;
}

.cart-panel--dropdown.cart-panel--content-hidden :is(
  .cart-panel__item,
  .cart-panel__empty
) {
  opacity: 0;
}

.cart-panel--dropdown.cart-panel--content-hidden .cart-panel__footer {
  opacity: 0;
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
  min-height: 11rem;
  padding: 32px 24px;
  color: color-mix(in srgb, currentColor 58%, transparent);
}

.cart-panel--dropdown .cart-panel__empty {
  flex: none;
  min-height: 11.75rem;
}

.cart-panel__empty p {
  margin: 0;
  text-align: center;
}

.cart-panel__shop-link,
.cart-panel__continue {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.cart-panel__items {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scrollbar-width: none;
  list-style: none;
  margin: 0;
  padding: 8px var(--cart-x-padding);
}

.cart-panel__items::-webkit-scrollbar {
  display: none;
}

.cart-panel--drawer .cart-panel__items,
.cart-panel--dropdown .cart-panel__items {
  max-height: none;
}

.cart-panel__item {
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
  }

  to {
    opacity: 1;
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
  position: relative;
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

.cart-panel__qty-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.cart-panel__qty-wrap::after {
  content: '';
  position: absolute;
  right: 7px;
  top: 50%;
  width: 8px;
  height: 5px;
  pointer-events: none;
  transform: translateY(-50%);
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
}

.cart-panel__qty {
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 0;
  padding: 5px 22px 5px 8px;
  font-size: 12px;
  line-height: 1.2;
  color: var(--cart-text-color, var(--menu-text-color, #111010));
  color-scheme: light;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  transition: border-color 0.15s ease;
}

.cart-panel__qty:hover,
.cart-panel__qty:focus,
.cart-panel__qty:focus-visible {
  outline: none;
  border-color: color-mix(in srgb, currentColor 48%, transparent);
}

.cart-panel__qty option {
  color: #111010;
  background-color: #fff;
}

.cart-panel__qty option:checked,
.cart-panel__qty option:focus,
.cart-panel__qty option:hover {
  color: #111010;
  background-color: #eee;
}

.cart-panel__qty::-ms-expand {
  display: none;
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
  flex-shrink: 0;
  padding: 16px var(--cart-x-padding) var(--cart-x-padding);
  border-top: 1px solid transparent;
}

.cart-panel__footer--scrollable {
  border-top-color: color-mix(in srgb, currentColor 12%, transparent);
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




.cart-panel__item-inner,
.cart-panel__item-inner > * {
  border: 1px solid red;
}
</style>
