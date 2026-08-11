<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  ariaLabel: {
    type: String,
    default: 'Synopsis image gallery',
  },
})

const viewportRef = ref(null)
const atStart = ref(true)
const atEnd = ref(false)
const hasOverflow = ref(false)

const showControls = computed(() => props.items.length > 1 && hasOverflow.value)
const canGoPrev = computed(() => !atStart.value)
const canGoNext = computed(() => !atEnd.value)

function getSlideWidth() {
  const viewport = viewportRef.value
  if (!viewport) return 0
  const slide = viewport.querySelector('.synopsis-image-carousel__slide')
  return slide?.offsetWidth ?? 0
}

function getSlideStride() {
  const slideWidth = getSlideWidth()
  if (!slideWidth) return 0

  const track = viewportRef.value?.querySelector('.synopsis-image-carousel__track')
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

function scrollBySlides(direction) {
  const viewport = viewportRef.value
  if (!viewport) return

  const slideStride = getSlideStride()
  if (!slideStride) return

  viewport.scrollBy({
    left: direction * slideStride,
    behavior: 'auto',
  })
}

function bindViewport(el) {
  if (viewportRef.value) {
    viewportRef.value.removeEventListener('scroll', updateScrollState)
  }

  viewportRef.value = el

  if (!el) return

  el.addEventListener('scroll', updateScrollState, { passive: true })
  nextTick(updateScrollState)
}

function resetScroll() {
  const viewport = viewportRef.value
  if (!viewport) return
  viewport.scrollLeft = 0
  updateScrollState()
}

watch(
  () => props.items.map((item) => item._key).join(','),
  () => nextTick(resetScroll),
)

onMounted(() => {
  window.addEventListener('resize', updateScrollState, { passive: true })
  nextTick(updateScrollState)
})

onBeforeUnmount(() => {
  viewportRef.value?.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <div
    class="synopsis-image-carousel"
    :aria-label="ariaLabel"
  >
    <div
      v-if="showControls"
      class="synopsis-image-carousel__controls"
    >
      <button
        type="button"
        class="synopsis-image-carousel__arrow synopsis-image-carousel__arrow--prev"
        aria-label="Previous images"
        :disabled="!canGoPrev"
        @click="scrollBySlides(-1)"
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
        class="synopsis-image-carousel__arrow synopsis-image-carousel__arrow--next"
        aria-label="Next images"
        :disabled="!canGoNext"
        @click="scrollBySlides(1)"
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

    <div
      :ref="bindViewport"
      class="synopsis-image-carousel__viewport"
    >
      <div class="synopsis-image-carousel__track">
        <figure
          v-for="item in items"
          :key="item._key"
          class="synopsis-image-carousel__slide"
        >
          <AppImage
            :src="item.src"
            :width="item.width"
            :height="item.height"
            :alt="item.alt"
            class="synopsis-image-carousel__image"
            sizes="third"
          />
          <figcaption
            v-if="item.caption"
            class="synopsis-image-carousel__caption caption"
          >
            {{ item.caption }}
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
</template>

<style scoped>
.synopsis-image-carousel {
  --synopsis-carousel-gap: 0;
  width: 50%;
}

.synopsis-image-carousel__controls {
  display: flex;
  justify-content: flex-end;
  gap: 0;
  margin-bottom: 1rem;
}

.synopsis-image-carousel__arrow {
  display: grid;
  place-items: center;
  width: clamp(2.5rem, 6vw, 3.25rem);
  height: clamp(2.5rem, 6vw, 3.25rem);
  margin: 0;
  padding: 0;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.synopsis-image-carousel__arrow--prev {
  border-right: 0;
}

.synopsis-image-carousel__arrow--prev svg {
  transform: scaleX(-1);
}

.synopsis-image-carousel__arrow svg {
  width: clamp(1rem, 1.4vw, 1.35rem);
  height: auto;
}

.synopsis-image-carousel__arrow:hover {
  opacity: 0.65;
}

.synopsis-image-carousel__arrow:disabled {
  opacity: 0.25;
  cursor: default;
  pointer-events: none;
}

.synopsis-image-carousel__viewport {
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 0;
  touch-action: pan-x;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: auto;
}

.synopsis-image-carousel__viewport::-webkit-scrollbar {
  display: none;
}

.synopsis-image-carousel__track {
  display: flex;
  gap: var(--synopsis-carousel-gap);
}

.synopsis-image-carousel__slide {
  flex: 0 0 100%;
  min-width: 0;
  margin: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.synopsis-image-carousel__image {
  display: block;
  width: 100%;
}

.synopsis-image-carousel__image :deep(.app-image__media) {
  aspect-ratio: 1.8;
}

.synopsis-image-carousel__image :deep(.app-image__img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.synopsis-image-carousel__caption {
  margin-top: 0.65rem;
}
</style>
