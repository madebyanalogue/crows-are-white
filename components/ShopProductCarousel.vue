<script setup lang="ts">
import type {ShopifyProduct} from '~/types/shopify'

const props = defineProps<{
  products: ShopifyProduct[]
  pending?: boolean
  emptyMessage?: string
  ariaLabel?: string
}>()

const viewportRef = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(false)

const skeletonCount = 4

const showControls = computed(() =>
  !props.pending && props.products.length > 1,
)

const canGoPrev = computed(() => !atStart.value)

const canGoNext = computed(() => !atEnd.value)

function getSlideWidth() {
  const viewport = viewportRef.value
  if (!viewport) return 0
  const slide = viewport.querySelector('.shop-product-carousel__slide') as HTMLElement | null
  return slide?.offsetWidth ?? 0
}

function updateScrollState() {
  const viewport = viewportRef.value
  if (!viewport) return

  const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
  atStart.value = viewport.scrollLeft <= 1
  atEnd.value = viewport.scrollLeft >= maxScroll - 1
}

function scrollBySlides(direction: -1 | 1) {
  const viewport = viewportRef.value
  if (!viewport) return

  const slideWidth = getSlideWidth()
  if (!slideWidth) return

  viewport.scrollBy({
    left: direction * slideWidth,
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
    :aria-label="ariaLabel"
  >
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
      class="shop-product-carousel__stage"
    >
      <button
        v-if="showControls"
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

      <div
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

      <button
        v-if="showControls"
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
</template>

<style scoped>
.shop-product-carousel {
  --shop-carousel-slides-visible: 1.5;
}

@media (min-width: 660px) {
  .shop-product-carousel {
    --shop-carousel-slides-visible: 3.5;
  }
}

@media (min-width: 1000px) {
  .shop-product-carousel {
    --shop-carousel-slides-visible: 4;
  }
}

.shop-product-carousel__stage {
  display: flex;
  align-items: stretch;
}

.shop-product-carousel__viewport {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 0;
  touch-action: pan-x;
  border-top: 1px solid var(--shop-line);
  border-bottom: 1px solid var(--shop-line);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.shop-product-carousel__viewport::-webkit-scrollbar {
  display: none;
}

.shop-product-carousel__track {
  display: flex;
  background:white;
}

.shop-product-carousel__slide {
  flex: 0 0 calc(100% / var(--shop-carousel-slides-visible));
  min-width: 0;
  aspect-ratio: 1;
  border-right: 1px solid var(--shop-line);
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.shop-product-carousel__arrow {
  flex: 0 0 clamp(2.5rem, 6vw, 3.5rem);
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  border: 0;
  border-top: 1px solid var(--shop-line);
  border-bottom: 1px solid var(--shop-line);
  background: var(--shop-bg);
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.shop-product-carousel__arrow--prev {
  border-right: 1px solid var(--shop-line);
}

.shop-product-carousel__arrow--next {
  border-left: 1px solid var(--shop-line);
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
  border-top: 1px solid var(--shop-line);
  border-bottom: 1px solid var(--shop-line);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
