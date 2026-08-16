<script setup lang="ts">
import type {ShopifyProductDetail} from '~/types/shopify'
import {formatShopPrice, resolveProductShopFilter, shopIndexHref} from '~/utils/shopCollections'
import {isVariantPurchasable, resolveDefaultVariantId} from '~/utils/shopVariants'

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

const resolvedVariantId = computed(() =>
  resolveDefaultVariantId(props.product.variants, props.selectedVariantId),
)

const selectedVariant = computed(() =>
  props.product.variants.find((variant) => variant.id === resolvedVariantId.value),
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

const CAROUSEL_DRAG_ATTRACTION = 0.022

let carouselInstance: {
  off: (event: string, handler: () => void) => void
  selectedIndex: number
  on: (event: string, handler: () => void) => void
  previous: (isWrap?: boolean, isInstant?: boolean) => void
  next: (isWrap?: boolean, isInstant?: boolean) => void
  select: (index: number, isWrapped?: boolean, isInstant?: boolean) => void
  isAnimating?: boolean
  options: {
    selectedAttraction: number
  }
} | null = null
let carouselSelectHandler: (() => void) | null = null

function bindCarousel(instance: NonNullable<typeof carouselInstance>) {
  if (carouselInstance && carouselSelectHandler) {
    carouselInstance.off('select', carouselSelectHandler)
  }

  carouselInstance = instance
  carouselSelectHandler = () => {
    activeImageIndex.value = instance.selectedIndex
    displayImageIndex.value = instance.selectedIndex
  }

  instance.on('select', carouselSelectHandler)
  carouselSelectHandler()
}

function unbindCarousel() {
  if (carouselInstance && carouselSelectHandler) {
    carouselInstance.off('select', carouselSelectHandler)
  }
  carouselInstance = null
  carouselSelectHandler = null
}

const { flickity, reload } = useFlickity(carouselRef, () => ({
  cellAlign: 'center',
  contain: true,
  draggable: hasMultipleImages.value,
  freeScroll: false,
  friction: 0.28,
  selectedAttraction: CAROUSEL_DRAG_ATTRACTION,
  pageDots: false,
  prevNextButtons: false,
  wrapAround: hasMultipleImages.value,
  onReady: bindCarousel,
}))

function showPreviousImage() {
  flickity.value?.previous(true, false)
}

function showNextImage() {
  flickity.value?.next(true, false)
}

function selectCarouselIndex(index: number, isInstant = true) {
  if (!carouselImages.value.length) return

  const normalizedIndex = hasMultipleImages.value
    ? ((index % carouselImages.value.length) + carouselImages.value.length) % carouselImages.value.length
    : index

  if (normalizedIndex < 0 || normalizedIndex >= carouselImages.value.length) return

  if (flickity.value) {
    flickity.value.select(normalizedIndex, true, isInstant)
    return
  }

  activeImageIndex.value = normalizedIndex
  displayImageIndex.value = normalizedIndex
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

watch(
  () => carouselImages.value.length,
  async () => {
    await nextTick()
    reload()
    selectCarouselIndex(0, true)
  },
)

watch(
  () => props.product.id,
  () => nextTick(() => selectCarouselIndex(0, true)),
)

watch(
  () => props.selectedVariantId,
  (variantId) => {
    const variant = props.product.variants.find((item) => item.id === variantId)
    if (!variant?.imageUrl) return

    const index = carouselImages.value.findIndex((image) => image.url === variant.imageUrl)
    if (index >= 0) selectCarouselIndex(index)
  },
)

onBeforeUnmount(() => {
  unbindCarousel()
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
  resolvedVariantId,
  (variantId) => {
    if (variantId && variantId !== props.selectedVariantId) {
      emit('update:selectedVariantId', variantId)
    }
  },
  {immediate: true},
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
              v-if="hasMultipleImages"
              ref="carouselRef"
              class="shop-product-hero__carousel shop-product-hero__carousel--scrollable"
              tabindex="0"
              role="region"
              :aria-label="`${product.title} images`"
              @keydown="onCarouselKeydown"
            >
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
            <div
              v-else-if="carouselImages.length"
              class="shop-product-hero__carousel"
            >
              <div class="shop-product-hero__track">
                <div class="shop-product-hero__slide">
                  <div class="shop-product-hero__frame">
                    <img
                      :src="carouselImages[0].url"
                      :alt="carouselImages[0].altText || product.title"
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
              class="shop-product-hero__carousel-dots"
              role="tablist"
              :aria-label="`${product.title} image pagination`"
            >
              <button
                v-for="(image, index) in carouselImages"
                :key="`dot-${image.url}-${index}`"
                type="button"
                class="shop-product-hero__carousel-dot"
                :class="{ 'is-active': displayImageIndex === index }"
                role="tab"
                :aria-selected="displayImageIndex === index"
                :aria-label="`Show image ${index + 1} of ${carouselImages.length}`"
                @click="selectCarouselIndex(index)"
              />
            </div>

            <div
              v-if="hasMultipleImages"
              class="shop-product-hero__carousel-nav"
            >
              <button
                type="button"
                class="shop-product-hero__carousel-btn shop-product-hero__carousel-btn--prev"
                aria-label="Previous image"
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

          <div class="shop-product-hero__actions-row">
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

      <div
        v-if="hasMultipleImages"
        class="shop-product-hero__thumbnails"
      >
        <button
          v-for="(image, index) in carouselImages"
          :key="`thumb-${image.url}-${index}`"
          type="button"
          class="shop-product-hero__thumbnail"
          :class="{ 'is-active': activeImageIndex === index }"
          :aria-label="`Show image ${index + 1} of ${carouselImages.length}`"
          :aria-current="activeImageIndex === index ? 'true' : undefined"
          @click="selectCarouselIndex(index)"
        >
          <img
            :src="image.url"
            :alt="image.altText || product.title"
            class="shop-product-hero__thumbnail-image"
            draggable="false"
            loading="lazy"
            @dragstart.prevent
          >
        </button>
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
  --shop-line:#eee;

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
  grid-template-rows: minmax(0, 1fr) auto;
  height: 100%;
  min-height: 0;
}

.shop-product-hero__center {
  display: contents;
}

.shop-product-hero__back-row {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  z-index: calc(var(--z-site-header) - 1);
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(0, 1fr) minmax(320px, 1fr);
  align-items: center;
  height: var(--site-header-bar-height);
  padding: 0 var(--shop-x-padding);
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
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  min-height: 0;
  padding:
    calc(var(--site-header-bar-height) + 0.75rem)
    0
    calc(var(--shop-product-actions-offset) + 1rem)
    var(--shop-x-padding);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.shop-product-hero__copy {
  display: grid;
  gap: 1.05rem;
  width: min(100%, var(--site-header-panel-width-closed));
}

.shop-product-hero__type {
  display: inline-block;
  margin: 0 0 3px;
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
  letter-spacing: 0.015em;
  margin-bottom: 0.75rem;
  /* text-transform: uppercase; */
}

.shop-product-hero__description {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  opacity: 0.82;
}

.shop-product-hero__carousel-area {
  position: relative;
  grid-column: 2;
  grid-row: 1;
  justify-self: center;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, max(0px, calc(100cqw - 640px)));
  min-height: 0;
  overflow: hidden;
}

.shop-product-hero__carousel-shell {
  position: relative;
  aspect-ratio: 1;
  width: auto;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
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
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border: 1px solid color-mix(in srgb, currentColor 100%, transparent);
  background: color-mix(in srgb, var(--shop-bg) 100%, transparent);
  color: inherit;
  cursor: pointer;
  pointer-events: auto;
  transform: translateY(-50%);
  transition: opacity 0.18s ease, filter 0.18s ease;
  opacity: 0.4;
}
.shop-product-hero__carousel-btn:hover {
  opacity: 1;
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

.shop-product-hero__carousel-dots {
  display: none;
}

.shop-product-hero__carousel-dot {
  display: block;
  width: 10px;
  height: 2px;
  border-radius: 2px;
  margin: 0;
  padding: 0;
  border: 0;
  background: #000;
  opacity: 0.25;
  cursor: pointer;
  transition: width 0.18s ease, opacity 0.18s ease;
}

.shop-product-hero__carousel-dot.is-active {
  width: 15px;
  height: 2px;
  opacity: 1;
  border-radius: 2px;
}

.shop-product-hero__carousel {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.shop-product-hero__carousel:not(.flickity-enabled) {
  overflow: hidden;
}

.shop-product-hero__carousel:not(.flickity-enabled) .shop-product-hero__slide:not(:first-child) {
  display: none;
}

.shop-product-hero__carousel--scrollable,
.shop-product-hero__carousel--scrollable.flickity-enabled {
  overflow: hidden;
}

.shop-product-hero__carousel :deep(.flickity-viewport) {
  overflow: hidden;
  height: 100% !important;
}

.shop-product-hero__track {
  display: flex;
  align-items: center;
  gap: 0;
  height: 100%;
}

.shop-product-hero__slide,
.shop-product-hero__carousel :deep(.flickity-cell) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-product-hero__frame {
  aspect-ratio: 1;
  width: 100%;
  height: auto;
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
  position: relative;
  grid-column: 2;
  grid-row: 2;
  justify-self: center;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: min(100%, var(--site-header-panel-width-closed));
  padding-bottom: var(--shop-product-actions-offset);
  box-sizing: border-box;
}

.shop-product-hero__variant-box,
.shop-product-hero__actions-row {
  width: min(100%, var(--site-header-panel-width-closed));
}

.shop-product-hero__actions-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 15px;
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

.shop-product-hero__actions > .shop-product-hero__action-box {
  width: min(100%, var(--site-header-panel-width-closed));
}

.shop-product-hero__action-box--primary {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--shop-text);
  background: var(--shop-text);
  color: var(--shop-bg);
  cursor: pointer;
  letter-spacing: 0.05em;
  font-weight: 300;
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

.shop-product-hero__thumbnails {
  grid-column: 3;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 0;
  padding:
    clamp(1rem, 2vw, 1.5rem)
    clamp(1rem, 2.5vw, 3rem);
}

.shop-product-hero__thumbnail {
  display: block;
  flex-shrink: 0;
  width: clamp(2.75rem, 6vw, 100px);
  aspect-ratio: 1;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: none;
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.shop-product-hero__thumbnail:hover {
  opacity: 1;
}

.shop-product-hero__thumbnail.is-active {
  opacity: 1;
}

.shop-product-hero__thumbnail-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-product-hero__aside {
  position: relative;
  grid-column: 3;
  grid-row: 2;
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
  .shop-product-hero {
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
    padding-top: 75px;
  }

  .shop-product-hero__back-row {
    display: none;
  }

  .shop-product-hero__grid {
    container-type: normal;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    height: auto;
    min-height: 0;
    overflow: hidden;
  }

  .shop-product-hero__info {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
    align-items: center;
    justify-content: center;
    padding: 0 var(--wrapper-padding);
    padding-top: 2.5rem;
    padding-bottom: 3.5rem;
    overflow-y: visible;
  }

  .shop-product-hero__center {
    display: grid;
    grid-column: 1;
    grid-row: 1;
    grid-template-rows: auto auto;
    gap: 25px;
    align-self: center;
    justify-self: center;
    width: min(100%, 720px);
    height: auto;
  }

  .shop-product-hero__carousel-area {
    grid-column: auto;
    grid-row: auto;
    width: 100%;
    height: auto;
    min-height: 0;
    align-self: center;
    overflow: visible;
  }

  .shop-product-hero__carousel-shell {
    width: 100%;
    height: auto;
    max-height: unset;
    aspect-ratio: 1;
    overflow: visible;
  }

  .shop-product-hero__carousel-dots {
    position: absolute;
    left: 50%;
    bottom: 0px;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transform: translateX(-50%);
    pointer-events: auto;
  }

  .shop-product-hero__carousel-nav,
  .shop-product-hero__thumbnails,
  .shop-product-hero__aside {
    display: none;
  }

  .shop-product-hero__carousel:not(.flickity-enabled),
  .shop-product-hero__carousel--scrollable:not(.flickity-enabled) {
    overflow: hidden;
    height: 100%;
  }

  .shop-product-hero__carousel--scrollable.flickity-enabled {
    overflow: visible;
  }

  .shop-product-hero__carousel.flickity-enabled,
  .shop-product-hero__carousel.flickity-enabled .shop-product-hero__track,
  .shop-product-hero__carousel.flickity-enabled .shop-product-hero__slide,
  .shop-product-hero__carousel.flickity-enabled :deep(.flickity-cell),
  .shop-product-hero__carousel.flickity-enabled :deep(.flickity-viewport) {
    height: auto !important;
  }

  .shop-product-hero__carousel.flickity-enabled :deep(.flickity-viewport) {
    height: auto !important;
    overflow: visible;
  }

  .shop-product-hero__frame {
    width: 100%;
    height: auto;
    max-height: none;
  }

  .shop-product-hero__image {
    width: 100%;
    height: auto;
  }

  .shop-product-hero__actions {
    grid-column: auto;
    grid-row: auto;
    width: 100%;
    max-width: 100%;
    padding-bottom: 0;
    padding: 0 var(--wrapper-padding);
  }
}

@media (max-width: 699px) {
  .shop-product-hero {
    padding-top: 68px;
  }
}
</style>
