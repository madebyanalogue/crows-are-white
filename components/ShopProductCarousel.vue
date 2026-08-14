<script setup lang="ts">
import type {ShopifyProduct} from '~/types/shopify'

const props = withDefaults(defineProps<{
  products: ShopifyProduct[]
  pending?: boolean
  emptyMessage?: string
  ariaLabel?: string
  columns?: number
}>(), {
  columns: 4,
})

const carouselStyle = computed(() => ({
  '--shop-carousel-slides-desktop': String(props.columns),
  '--shop-carousel-visible-gaps-desktop': String(Math.max(0, props.columns - 1)),
}))

const skeletonCount = computed(() => props.columns)

const viewportRef = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(false)
const hasOverflow = ref(false)

const showControls = computed(() =>
  !props.pending && props.products.length > 1 && hasOverflow.value,
)

const canGoPrev = computed(() => !atStart.value)

const canGoNext = computed(() => !atEnd.value)

function getSlideWidth() {
  const viewport = viewportRef.value
  if (!viewport) return 0
  const slide = viewport.querySelector('.shop-product-carousel__slide') as HTMLElement | null
  return slide?.offsetWidth ?? 0
}

function getSlideStride() {
  const slideWidth = getSlideWidth()
  if (!slideWidth) return 0

  const track = viewportRef.value?.querySelector('.shop-product-carousel__track') as HTMLElement | null
  if (!track) return slideWidth

  const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0')
  return slideWidth + (Number.isFinite(gap) ? gap : 0)
}

function updateScrollState() {
  const viewport = viewportRef.value
  if (!viewport) return

  const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
  hasOverflow.value = maxScroll > 1
  atStart.value = viewport.scrollLeft <= 1
  atEnd.value = viewport.scrollLeft >= maxScroll - 1
}

function scrollBySlides(direction: -1 | 1) {
  const viewport = viewportRef.value
  if (!viewport) return

  const slideStride = getSlideStride()
  if (!slideStride) return

  viewport.scrollBy({
    left: direction * slideStride,
    behavior: 'smooth',
  })
}

function goPrev() {
  scrollBySlides(-1)
}

function goNext() {
  scrollBySlides(1)
}

function resetScroll() {
  const viewport = viewportRef.value
  if (!viewport) return
  viewport.scrollLeft = 0
  updateScrollState()
}

function bindViewport(el: HTMLElement | null) {
  if (viewportRef.value) {
    viewportRef.value.removeEventListener('scroll', updateScrollState)
  }

  viewportRef.value = el

  if (!el) return

  el.addEventListener('scroll', updateScrollState, {passive: true})
  nextTick(updateScrollState)
}

watch(
  () => props.products.map((product) => product.variantId).join(','),
  () => nextTick(resetScroll),
)

onMounted(() => {
  window.addEventListener('resize', updateScrollState, {passive: true})
  nextTick(updateScrollState)
})

onBeforeUnmount(() => {
  viewportRef.value?.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <div
    class="shop-product-carousel"
    :style="carouselStyle"
    :aria-label="ariaLabel"
  >
    <div
      v-if="$slots.header || showControls"
      class="shop-product-carousel__header"
    >
      <div class="shop-product-carousel__header-start">
        <slot name="header" />

        <div
          v-if="showControls"
          class="shop-product-carousel__controls"
        >
          <button
            type="button"
            class="shop-product-carousel__arrow shop-product-carousel__arrow--prev"
            aria-label="Previous products"
            :disabled="!canGoPrev"
            @click="goPrev"
          >
            <svg
              viewBox="0 0 13 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                d="m7.304 10.919 5.007-5.08m0 0L7.304.76m5.007 5.08H.93"
              />
            </svg>
          </button>

          <button
            type="button"
            class="shop-product-carousel__arrow shop-product-carousel__arrow--next"
            aria-label="Next products"
            :disabled="!canGoNext"
            @click="goNext"
          >
            <svg
              viewBox="0 0 13 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                d="m7.304 10.919 5.007-5.08m0 0L7.304.76m5.007 5.08H.93"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="pending"
      class="shop-product-carousel__viewport"
      aria-busy="true"
    >
      <div class="shop-product-carousel__track">
        <div
          v-for="n in skeletonCount"
          :key="n"
          class="shop-product-carousel__slide"
        >
          <ShopProductCard loading />
        </div>
      </div>
    </div>

    <p
      v-else-if="!products.length"
      class="shop-product-carousel__empty serif"
    >
      {{ emptyMessage || 'No products to show.' }}
    </p>

    <div
      v-else
      :ref="bindViewport"
      class="shop-product-carousel__viewport"
    >
      <div class="shop-product-carousel__track">
        <div
          v-for="product in products"
          :key="product.variantId"
          class="shop-product-carousel__slide"
        >
          <ShopProductCard :product="product" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-product-carousel {
  --shop-carousel-slides-visible: 1.5;
  --shop-carousel-visible-gaps: 1;
  --shop-carousel-gap: 2px;
}

@media (min-width: 660px) {
  .shop-product-carousel {
    --shop-carousel-slides-visible: 3.5;
    --shop-carousel-visible-gaps: 3;
  }
}

@media (min-width: 1000px) {
  .shop-product-carousel {
    --shop-carousel-slides-visible: var(--shop-carousel-slides-desktop, 4);
    --shop-carousel-visible-gaps: var(--shop-carousel-visible-gaps-desktop, 3);
  }
}

.shop-product-carousel__header {
  min-height: clamp(2.5rem, 6vw, 3.25rem);
  margin-bottom: 2rem;
  padding: 0 clamp(1rem, 3.5vw, 3rem);
}

.shop-product-carousel__header-start {
  display: flex;
  align-items: center;
  gap: 50px;
  min-width: 0;
}

.shop-product-carousel__controls {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.35rem;
}

.shop-product-carousel__viewport {
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: clamp(1rem, 3vw, 2rem);
  touch-action: pan-x;
  padding: 0 clamp(1rem, 3vw, 2rem);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.shop-product-carousel__viewport::-webkit-scrollbar {
  display: none;
}

.shop-product-carousel__track {
  display: flex;
  gap: var(--shop-carousel-gap);
}

.shop-product-carousel__slide {
  flex: 0 0 calc(
    (100% - (var(--shop-carousel-gap) * var(--shop-carousel-visible-gaps)))
    / var(--shop-carousel-slides-visible)
  );
  min-width: 0;
  aspect-ratio: 0.8;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.shop-product-carousel__slide :deep(.shop-product-card) {
  height: 100%;
  border-radius: 0px;
  overflow: hidden;
  background: #fff;
}

.shop-product-carousel__arrow {
  display: grid;
  place-items: center;
  width: clamp(2.5rem, 6vw, 3.25rem);
  height: clamp(2.5rem, 6vw, 3.25rem);
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.shop-product-carousel__arrow svg {
  width: clamp(1rem, 1.4vw, 1.35rem);
  height: auto;
}

.shop-product-carousel__arrow--prev svg {
  transform: scaleX(-1);
}

.shop-product-carousel__arrow:hover {
  opacity: 0.65;
}

.shop-product-carousel__arrow:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -4px;
}

.shop-product-carousel__arrow:disabled {
  opacity: 0.25;
  cursor: default;
  pointer-events: none;
}

.shop-product-carousel__empty {
  margin: 0;
  padding: 2rem clamp(1rem, 3vw, 2rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
