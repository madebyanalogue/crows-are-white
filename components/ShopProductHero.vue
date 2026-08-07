<script setup lang="ts">
import type {ShopifyProductDetail} from '~/types/shopify'
import {formatShopPrice, resolveProductShopFilter, shopIndexHref} from '~/utils/shopCollections'
import {isVariantPurchasable} from '~/utils/shopVariants'

const props = defineProps<{
  product: ShopifyProductDetail
  shopBackLink: string
  selectedVariantId: string
  quantity: number
  adding?: boolean
}>()

const emit = defineEmits<{
  'update:selectedVariantId': [value: string]
  'update:quantity': [value: number]
  'add-to-cart': []
}>()

const carouselRef = ref<HTMLElement | null>(null)

const selectedVariant = computed(() =>
  props.product.variants.find((variant) => variant.id === props.selectedVariantId),
)

const canPurchaseSelectedVariant = computed(() => isVariantPurchasable(selectedVariant.value))

const carouselImages = computed(() => {
  const seen = new Set<string>()
  const items: Array<{url: string; altText?: string}> = []

  function add(url?: string, altText?: string) {
    if (!url || seen.has(url)) return
    seen.add(url)
    items.push({url, altText})
  }

  for (const image of props.product.images || []) {
    add(image.url, image.altText)
  }

  add(props.product.imageUrl, props.product.imageAlt)

  for (const variant of props.product.variants || []) {
    add(variant.imageUrl, variant.imageAlt)
  }

  return items
})

const hasMultipleImages = computed(() => carouselImages.value.length > 1)

const activeImageIndex = ref(0)
const displayImageIndex = ref(0)
let displayImageIndexTimer: ReturnType<typeof setTimeout> | null = null

const canShowPreviousImage = computed(() => activeImageIndex.value > 0)
const canShowNextImage = computed(
  () => activeImageIndex.value < carouselImages.value.length - 1,
)

function clearDisplayImageIndexTimer() {
  if (displayImageIndexTimer) {
    clearTimeout(displayImageIndexTimer)
    displayImageIndexTimer = null
  }
}

function syncDisplayImageIndex(delay = 180) {
  clearDisplayImageIndexTimer()
  displayImageIndexTimer = setTimeout(() => {
    const viewport = carouselRef.value
    if (!viewport?.clientWidth) return

    displayImageIndex.value = Math.min(
      carouselImages.value.length - 1,
      Math.max(0, Math.round(viewport.scrollLeft / viewport.clientWidth)),
    )
  }, delay)
}

function syncActiveImageIndex() {
  const viewport = carouselRef.value
  if (!viewport?.clientWidth) return

  activeImageIndex.value = Math.min(
    carouselImages.value.length - 1,
    Math.max(0, Math.round(viewport.scrollLeft / viewport.clientWidth)),
  )
  syncDisplayImageIndex()
}

function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
  const viewport = carouselRef.value
  if (!viewport || index < 0 || index >= carouselImages.value.length) return

  const width = viewport.clientWidth
  if (!width) return

  activeImageIndex.value = index
  if (behavior === 'instant') {
    clearDisplayImageIndexTimer()
    displayImageIndex.value = index
  }

  viewport.scrollTo({
    left: index * width,
    behavior,
  })
}

function showPreviousImage() {
  scrollToIndex(activeImageIndex.value - 1)
}

function showNextImage() {
  scrollToIndex(activeImageIndex.value + 1)
}

function onCarouselKeydown(event: KeyboardEvent) {
  if (!hasMultipleImages.value) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPreviousImage()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNextImage()
  }
}

function syncScrollAfterResize() {
  const viewport = carouselRef.value
  if (!viewport?.clientWidth) return

  const index = Math.min(
    carouselImages.value.length - 1,
    Math.max(0, Math.round(viewport.scrollLeft / viewport.clientWidth)),
  )

  scrollToIndex(index, 'instant')
}

watch(
  () => carouselImages.value.length,
  () => nextTick(() => scrollToIndex(0, 'instant')),
)

watch(
  () => props.product.id,
  () => nextTick(() => scrollToIndex(0, 'instant')),
)

watch(
  () => props.selectedVariantId,
  (variantId) => {
    const variant = props.product.variants.find((item) => item.id === variantId)
    if (!variant?.imageUrl) return

    const index = carouselImages.value.findIndex((image) => image.url === variant.imageUrl)
    if (index >= 0) scrollToIndex(index)
  },
)

onMounted(() => {
  window.addEventListener('resize', syncScrollAfterResize, {passive: true})
  nextTick(() => scrollToIndex(0, 'instant'))
})

useAfterPageTransition(() => {
  nextTick(() => syncScrollAfterResize())
})

onBeforeUnmount(() => {
  clearDisplayImageIndexTimer()
  window.removeEventListener('resize', syncScrollAfterResize)
})

const addToCartLabel = computed(() => {
  if (props.adding) return 'Adding…'
  if (!canPurchaseSelectedVariant.value) return 'Sold Out'
  if (!selectedVariant.value) return 'Add to Cart'
  const price = formatShopPrice(selectedVariant.value.price, selectedVariant.value.currencyCode)
  return `Add to Cart — ${price}`
})

const hasVariants = computed(() => (props.product.variants?.length ?? 0) > 1)

const variantOptionLabel = computed(
  () => props.product.variantOptionName?.trim() || 'Variant',
)

const categoryFilter = computed(() => resolveProductShopFilter(props.product))

const categoryHref = computed(() => shopIndexHref(categoryFilter.value))

watch(
  () => props.product.variants,
  (variants) => {
    if (!variants?.length) return

    const isCurrentVariant = variants.some((variant) => variant.id === props.selectedVariantId)
    if (isCurrentVariant) return

    const firstVariant = variants.find((variant) => isVariantPurchasable(variant)) || variants[0]
    emit('update:selectedVariantId', firstVariant.id)
  },
  { immediate: true },
)

function onVariantChange(event: Event) {
  emit('update:selectedVariantId', (event.target as HTMLSelectElement).value)
}

function decrementQty() {
  if (props.quantity > 1) emit('update:quantity', props.quantity - 1)
}

function incrementQty() {
  if (props.quantity < 10) emit('update:quantity', props.quantity + 1)
}
</script>

<template>
  <section class="shop-product-hero">
    <div class="shop-product-hero__back-row">
      <div class="shop-product-hero__back-panel">
        <NuxtLink
          :to="shopBackLink"
          class="shop-product-hero__back"
        >
          <span
            class="shop-product-hero__back-arrow"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 12"
            >
              <path
                d="M13 6H1M1 6l5-5M1 6l5 5"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="shop-product-hero__back-label serif">Back to shop</span>
        </NuxtLink>
      </div>
    </div>

    <div class="shop-product-hero__grid">
      <div class="shop-product-hero__info">
        <div class="shop-product-hero__copy">
          <NuxtLink
            v-if="product.productType"
            :to="categoryHref"
            class="shop-product-hero__type"
          >
            {{ product.productType }}
          </NuxtLink>
          <h1 class="shop-product-hero__title serif">
            {{ product.title }}
          </h1>
          <p
            v-if="product.description"
            class="shop-product-hero__description"
          >
            {{ product.description }}
          </p>
        </div>
      </div>

      <div class="shop-product-hero__center">
        <div class="shop-product-hero__carousel-area">
          <ShopSaleBadge :on-sale="selectedVariant?.onSale" />
          <div class="shop-product-hero__carousel-shell">
            <div
              ref="carouselRef"
              class="shop-product-hero__carousel"
              :class="{ 'shop-product-hero__carousel--scrollable': hasMultipleImages }"
              tabindex="0"
              role="region"
              :aria-label="`${product.title} images`"
              @scroll.passive="syncActiveImageIndex"
              @keydown="onCarouselKeydown"
            >
              <div class="shop-product-hero__track">
                <div
                  v-for="(image, index) in carouselImages"
                  :key="`${image.url}-${index}`"
                  class="shop-product-hero__slide"
                >
                  <div class="shop-product-hero__frame">
                    <img
                      :src="image.url"
                      :alt="image.altText || product.title"
                      class="shop-product-hero__image"
                      draggable="false"
                      loading="lazy"
                      @dragstart.prevent
                    >
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="hasMultipleImages"
              class="shop-product-hero__carousel-nav"
            >
              <button
                type="button"
                class="shop-product-hero__carousel-btn shop-product-hero__carousel-btn--prev"
                aria-label="Previous image"
                :disabled="!canShowPreviousImage"
                @click="showPreviousImage"
              >
                <span
                  class="shop-product-hero__carousel-arrow"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 12"
                  >
                    <path
                      d="M13 6H1M1 6l5-5M1 6l5 5"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                class="shop-product-hero__carousel-btn shop-product-hero__carousel-btn--next"
                aria-label="Next image"
                :disabled="!canShowNextImage"
                @click="showNextImage"
              >
                <span
                  class="shop-product-hero__carousel-arrow shop-product-hero__carousel-arrow--next"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 12"
                  >
                    <path
                      d="M13 6H1M1 6l5-5M1 6l5 5"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
          <div
            v-if="carouselImages.length === 0"
            class="shop-product-hero__frame shop-product-hero__frame--empty"
            aria-hidden="true"
          />
        </div>

        <div class="shop-product-hero__actions">
          <div
            class="shop-product-hero__actions-row"
            :class="{ 'shop-product-hero__actions-row--with-variant': hasVariants }"
          >
            <div
              v-if="hasVariants"
              class="shop-product-hero__variant-box shop-product-hero__action-box shop-product-hero__action-box--secondary"
            >
              <div class="shop-product-hero__variant-control">
                <select
                  id="shop-product-variant"
                  :value="selectedVariantId"
                  class="shop-product-hero__select"
                  :aria-label="variantOptionLabel"
                  @change="onVariantChange"
                >
                  <option
                    v-for="variant in product.variants"
                    :key="variant.id"
                    :value="variant.id"
                    :disabled="!isVariantPurchasable(variant)"
                  >
                    {{ variant.title }}
                    <template v-if="!isVariantPurchasable(variant)"> — Sold out</template>
                  </option>
                </select>

                <div
                  class="shop-product-hero__variant-display"
                  aria-hidden="true"
                >
                  <span class="shop-product-hero__variant-label">{{ variantOptionLabel }}</span>
                  <span class="shop-product-hero__variant-value-text serif">
                    {{ selectedVariant?.title }}
                  </span>
                  <span class="shop-product-hero__variant-arrow">
                    <svg
                      viewBox="0 0 12 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div class="shop-product-hero__qty-box shop-product-hero__action-box shop-product-hero__action-box--secondary">
              <button
                type="button"
                class="shop-product-hero__qty-btn"
                aria-label="Decrease quantity"
                :disabled="quantity <= 1"
                @click="decrementQty"
              >
                −
              </button>
              <span
                class="shop-product-hero__qty-value"
                aria-live="polite"
              >{{ quantity }}</span>
              <button
                type="button"
                class="shop-product-hero__qty-btn"
                aria-label="Increase quantity"
                :disabled="quantity >= 10"
                @click="incrementQty"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            class="shop-product-hero__action-box shop-product-hero__action-box--primary"
            :disabled="adding || !canPurchaseSelectedVariant"
            @click="emit('add-to-cart')"
          >
            {{ addToCartLabel }}
          </button>
        </div>
      </div>

      <div class="shop-product-hero__aside">
        <p
          v-if="hasMultipleImages"
          class="shop-product-hero__carousel-count handwritten"
          aria-live="polite"
          :aria-label="`Image ${displayImageIndex + 1} of ${carouselImages.length}`"
        >
          {{ displayImageIndex + 1 }}/{{ carouselImages.length }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.shop-product-hero {
  --site-header-bar-height: 50px;
  --site-header-panel-width-closed: 360px;
  --shop-product-actions-offset: 50px;
  --shop-product-actions-stack-height: calc(var(--site-header-bar-height) * 2 + 15px);

  height: 100dvh;
  min-height: 600px;
  max-height: 100dvh;
  box-sizing: border-box;
  padding-top: 70px;
  background: var(--shop-bg);
  color: var(--shop-text);
  border-bottom: 1px solid var(--shop-line);
  overflow: hidden;
}

.shop-product-hero__grid {
  container-type: size;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) auto minmax(320px, 1fr);
  height: 100%;
  min-height: 0;
}

.shop-product-hero__back-row {
  position: fixed;
  top: 10px;
  left: 0;
  right: 0;
  z-index: calc(var(--z-site-header) - 1);
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(0, 1fr) minmax(320px, 1fr);
  align-items: center;
  height: var(--site-header-bar-height);
  padding: 0 1rem;
  pointer-events: none;
}

@media (min-width: 700px) {
  .shop-product-hero__back-row {
    top: 25px;
  }
}

.shop-product-hero__back-panel {
  grid-column: 1;
  width: min(100%, var(--site-header-panel-width-closed));
  height: var(--site-header-bar-height);
  display: flex;
  align-items: center;
  padding: 0 clamp(1rem, 2.5vw, 2rem);
  pointer-events: auto;
}

.shop-product-hero__back {
  display: inline-flex;
  align-items: center;
  gap: 0.65em;
  text-decoration: none;
  color: inherit;
  opacity: 0.85;
  transition:
    gap 0.25s ease,
    opacity 0.25s ease,
    color 0.25s ease;
}

.shop-product-hero__back:hover {
  gap: 0.95em;
  opacity: 1;
  color: var(--menu-highlight-color, var(--arancio));
}

.shop-product-hero__back-arrow {
  display: inline-flex;
  width: 0.7em;
  flex-shrink: 0;
  transform: translateY(-0.04em);
}

.shop-product-hero__back-arrow svg {
  display: block;
  width: 100%;
  height: auto;
}

.shop-product-hero__back-arrow path {
  stroke-width: 1;
}

.shop-product-hero__back-label {
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-transform: uppercase;
}

.shop-product-hero__info {
  position: relative;
  grid-column: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  padding:
    clamp(1rem, 2vw, 1.5rem)
    clamp(1rem, 2.5vw, 3rem)
    calc(var(--shop-product-actions-offset) + 1rem);
}

.shop-product-hero__copy {
  display: grid;
  gap: 1.25rem;
  max-width: 28rem;
}

.shop-product-hero__type {
  display: inline-block;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.18s ease;
}

.shop-product-hero__type:hover {
  opacity: 1;
}

.shop-product-hero__title {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 4rem);
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.00em;
  /* text-transform: uppercase; */
}

.shop-product-hero__description {
  margin: 0;
  max-width: 32rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  opacity: 0.82;
}

.shop-product-hero__center {
  position: relative;
  grid-column: 2;
  justify-self: center;
  align-self: stretch;
  height: 100%;
  width: auto;
  aspect-ratio: 1;
  max-width: min(100%, max(0px, calc(100cqw - 640px)));
  min-height: 0;
}

.shop-product-hero__carousel-area {
  position: absolute;
  inset:
    0
    0
    calc(var(--shop-product-actions-offset) + var(--shop-product-actions-stack-height))
    0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.shop-product-hero__carousel-shell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.shop-product-hero__carousel-nav {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.shop-product-hero__carousel-btn {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  margin: 0;
  padding: 0;
  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  background: color-mix(in srgb, var(--shop-bg) 82%, transparent);
  color: inherit;
  cursor: pointer;
  pointer-events: auto;
  transform: translateY(-50%);
  transition: opacity 0.18s ease, filter 0.18s ease;
}

.shop-product-hero__carousel-arrow {
  display: inline-flex;
  width: 0.875rem;
  flex-shrink: 0;
  transform: translateY(-0.04em);
}

.shop-product-hero__carousel-arrow--next {
  transform: translateY(-0.04em) scaleX(-1);
}

.shop-product-hero__carousel-arrow svg {
  display: block;
  width: 100%;
  height: auto;
}

.shop-product-hero__carousel-arrow path {
  stroke-width: 1;
}

.shop-product-hero__carousel-btn--prev {
  left: 0.35rem;
}

.shop-product-hero__carousel-btn--next {
  right: 0.35rem;
}

.shop-product-hero__carousel-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.shop-product-hero__carousel-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.shop-product-hero__carousel-count {
  margin: 0;
  font-size: clamp(1.35rem, 2.2vw, 1.85rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  opacity: 0.75;
  pointer-events: none;
}

.shop-product-hero__carousel {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.shop-product-hero__carousel--scrollable {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  touch-action: pan-x;
}

.shop-product-hero__carousel--scrollable::-webkit-scrollbar {
  display: none;
}

.shop-product-hero__track {
  display: flex;
  height: 100%;
}

.shop-product-hero__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.shop-product-hero__frame {
  aspect-ratio: 1;
  height: 100%;
  width: auto;
  max-width: 100%;
  max-height: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.shop-product-hero__frame--empty {
  width: min(72%, 16rem);
  border: 1px dashed color-mix(in srgb, currentColor 25%, transparent);
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.shop-product-hero__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.shop-product-hero__actions {
  position: absolute;
  left: 50%;
  bottom: var(--shop-product-actions-offset);
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: min(100%, var(--site-header-panel-width-closed));
  transform: translateX(-50%);
}

.shop-product-hero__actions-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 15px;
  width: 100%;
}

.shop-product-hero__actions-row--with-variant {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.shop-product-hero__variant-box {
  min-width: 0;
  position: relative;
  padding: 0;
}

.shop-product-hero__variant-control {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: var(--site-header-bar-height);
  margin: 0;
}

.shop-product-hero__select {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
  appearance: none;
}

.shop-product-hero__variant-display {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: var(--site-header-bar-height);
  padding: 0 0.65rem;
  box-sizing: border-box;
  pointer-events: none;
}

.shop-product-hero__variant-label {
  grid-column: 1;
  justify-self: start;
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.12em;
  text-align: left;
  text-transform: uppercase;
  color: color-mix(in srgb, currentColor 58%, transparent);
}

.shop-product-hero__variant-value-text {
  grid-column: 2;
  justify-self: center;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  font-size: 17px;
  line-height: 1;
  letter-spacing: 0.03em;
  text-align: center;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.shop-product-hero__variant-arrow {
  grid-column: 3;
  justify-self: end;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 0.85rem;
  height: 0.85rem;
  opacity: 0.72;
}

.shop-product-hero__action-box {
  box-sizing: border-box;
  width: 100%;
  height: var(--site-header-bar-height);
  min-height: var(--site-header-bar-height);
  margin: 0;
  padding: 0 1rem;
  border-radius: 0;
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1;
  letter-spacing: 0.03em;
  text-align: center;
  text-transform: uppercase;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    filter 0.25s ease;
}

.shop-product-hero__action-box--primary {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--shop-text);
  background: var(--shop-text);
  color: var(--shop-bg);
  cursor: pointer;
}

.shop-product-hero__action-box--primary:hover:not(:disabled) {
  filter: brightness(1.05);
}

.shop-product-hero__action-box--primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.shop-product-hero__action-box--secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  background: color-mix(in srgb, currentColor 4%, transparent);
  color: inherit;
}

.shop-product-hero__variant-box.shop-product-hero__action-box {
  padding: 0;
}

.shop-product-hero__variant-arrow svg {
  display: block;
  width: 100%;
  height: 100%;
}

.shop-product-hero__qty-box {
  justify-content: space-between;
  gap: 0.25rem;
  padding: 0 0.35rem;
}

.shop-product-hero__qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: var(--serif);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.shop-product-hero__qty-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.shop-product-hero__qty-value {
  flex: 1 1 auto;
  min-width: 1.5rem;
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1;
  letter-spacing: 0.03em;
  text-align: center;
}

.shop-product-hero__aside {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  min-height: 0;
  padding:
    clamp(1rem, 2vw, 1.5rem)
    clamp(1rem, 2.5vw, 3rem)
    calc(var(--shop-product-actions-offset) + 1rem);
}

@media (max-width: 999px) {
  .shop-product-hero__grid {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .shop-product-hero__info {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
    justify-content: flex-start;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .shop-product-hero__center {
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    width: min(100%, min(52dvh, 520px));
    height: auto;
    max-height: min(52dvh, 520px);
  }

  .shop-product-hero__carousel-area {
    inset: 0 0 calc(var(--shop-product-actions-offset) + var(--shop-product-actions-stack-height)) 0;
  }

  .shop-product-hero__aside {
    grid-column: 1;
    grid-row: 2;
    align-self: stretch;
    justify-content: flex-end;
    align-items: flex-end;
    padding:
      0
      clamp(1rem, 2.5vw, 2rem)
      1.5rem;
    box-sizing: border-box;
    pointer-events: none;
  }

  .shop-product-hero {
    height: auto;
    min-height: max(600px, 100dvh);
    max-height: none;
  }
}
</style>
