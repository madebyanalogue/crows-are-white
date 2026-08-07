<script setup lang="ts">
import type {ShopifyProductDetail} from '~/types/shopify'
import {formatShopPrice} from '~/utils/shopCollections'

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

const carouselElement = ref<HTMLElement | null>(null)

const selectedVariant = computed(() =>
  props.product.variants.find((variant) => variant.id === props.selectedVariantId),
)

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

const {flickity, reload} = useFlickity(carouselElement, () => ({
  cellAlign: 'center',
  contain: true,
  draggable: carouselImages.value.length > 1,
  friction: 0.28,
  pageDots: false,
  prevNextButtons: false,
  wrapAround: carouselImages.value.length > 1,
  selectedAttraction: 0.025,
}))

watch(
  () => carouselImages.value.length,
  async () => {
    await nextTick()
    reload()
  },
)

watch(
  () => props.selectedVariantId,
  async (variantId) => {
    const variant = props.product.variants.find((item) => item.id === variantId)
    if (!variant?.imageUrl || !flickity.value) return

    await nextTick()
    const index = carouselImages.value.findIndex((image) => image.url === variant.imageUrl)
    if (index >= 0) flickity.value.select(index)
  },
)

const addToCartLabel = computed(() => {
  if (props.adding) return 'Adding…'
  if (!selectedVariant.value?.availableForSale) return 'Sold Out'
  const price = formatShopPrice(selectedVariant.value.price, selectedVariant.value.currencyCode)
  return `Add to Cart — ${price}`
})

const hasSize = computed(() => props.product.variants.length > 1)

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
          <p
            v-if="product.productType"
            class="shop-product-hero__type"
          >
            {{ product.productType }}
          </p>
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
          <div
            ref="carouselElement"
            class="shop-product-hero__carousel"
          >
            <div
              v-for="(image, index) in carouselImages"
              :key="`${image.url}-${index}`"
              class="shop-product-hero__cell"
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
            v-if="carouselImages.length === 0"
            class="shop-product-hero__frame shop-product-hero__frame--empty"
            aria-hidden="true"
          />
        </div>

        <div class="shop-product-hero__actions">
          <div class="shop-product-hero__actions-row">
            <div
              v-if="hasSize"
              class="shop-product-hero__size-box shop-product-hero__action-box shop-product-hero__action-box--secondary"
            >
              <select
                id="shop-product-variant"
                :value="selectedVariantId"
                class="shop-product-hero__select"
                aria-label="Size"
                @change="onVariantChange"
              >
                <option
                  v-for="variant in product.variants"
                  :key="variant.id"
                  :value="variant.id"
                  :disabled="!variant.availableForSale"
                >
                  {{ variant.title }}
                  <template v-if="!variant.availableForSale"> — Sold out</template>
                </option>
              </select>
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
            :disabled="adding || !selectedVariant?.availableForSale"
            @click="emit('add-to-cart')"
          >
            {{ addToCartLabel }}
          </button>
        </div>
      </div>

      <div
        class="shop-product-hero__aside"
        aria-hidden="true"
      />
    </div>
  </section>
</template>

<style scoped>
.shop-product-hero {
  --site-header-bar-height: 50px;
  --site-header-panel-width-closed: 360px;
  --shop-product-actions-offset: 70px;
  --shop-product-actions-stack-height: calc(var(--site-header-bar-height) * 2 + 15px);

  height: 100dvh;
  min-height: 600px;
  max-height: 100dvh;
  box-sizing: border-box;
  padding-top: calc(var(--header-height, 112) * 1px);
  background: var(--shop-bg);
  color: var(--shop-text);
  border-bottom: 1px solid var(--shop-line);
  overflow: hidden;
}

.shop-product-hero__grid {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(0, 1fr) minmax(320px, 1fr);
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
  width: 0.85em;
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
    clamp(1rem, 2.5vw, 2rem)
    calc(var(--shop-product-actions-offset) + 1rem);
}

.shop-product-hero__copy {
  display: grid;
  gap: 0.85rem;
  max-width: 28rem;
}

.shop-product-hero__type {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
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
  min-height: 0;
  height: 100%;
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

.shop-product-hero__carousel {
  width: 100%;
  height: 100%;
}

.shop-product-hero__carousel:not(.flickity-enabled) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-product-hero__carousel:not(.flickity-enabled) .shop-product-hero__cell:not(:first-child) {
  display: none;
}

.shop-product-hero__carousel :deep(.flickity-viewport) {
  width: 100%;
  height: 100%;
}

.shop-product-hero__carousel :deep(.flickity-slider) {
  display: flex;
  align-items: center;
  height: 100%;
}

.shop-product-hero__cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: flex;
  gap: 15px;
  width: 100%;
}

.shop-product-hero__size-box {
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  padding: 0;
}

.shop-product-hero__actions-row:not(:has(.shop-product-hero__size-box)) .shop-product-hero__qty-box {
  flex: 1 1 100%;
}

.shop-product-hero__actions-row:has(.shop-product-hero__size-box) .shop-product-hero__qty-box {
  flex: 1 1 0;
  min-width: 0;
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

.shop-product-hero__select {
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0 1rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: center;
  text-align-last: center;
  text-transform: uppercase;
  cursor: pointer;
  appearance: none;
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
}

@media (max-width: 999px) {
  .shop-product-hero__grid {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .shop-product-hero__info {
    grid-column: 1;
    grid-row: 2;
    justify-content: flex-start;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .shop-product-hero__center {
    grid-column: 1;
    grid-row: 1;
    min-height: min(52dvh, 520px);
  }

  .shop-product-hero__carousel-area {
    inset: 0 0 calc(var(--shop-product-actions-offset) + var(--shop-product-actions-stack-height)) 0;
  }

  .shop-product-hero__aside {
    display: none;
  }

  .shop-product-hero {
    height: auto;
    min-height: max(600px, 100dvh);
    max-height: none;
  }
}
</style>
