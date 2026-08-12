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
const hasOverflow = ref(false)
const currentIndex = ref(0)

const showControls = computed(() => props.items.length > 1 && hasOverflow.value)

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

  const slideStride = getSlideStride()
  if (slideStride > 0) {
    const index = Math.round(viewport.scrollLeft / slideStride)
    currentIndex.value = Math.min(Math.max(0, index), props.items.length - 1)
  } else {
    currentIndex.value = 0
  }
}

function goToSlide(index) {
  const viewport = viewportRef.value
  if (!viewport) return

  const total = props.items.length
  const slideStride = getSlideStride()
  if (!total || !slideStride) return

  const wrappedIndex = ((index % total) + total) % total

  viewport.scrollTo({
    left: wrappedIndex * slideStride,
    behavior: 'auto',
  })
  currentIndex.value = wrappedIndex
}

function scrollBySlides(direction) {
  goToSlide(currentIndex.value + direction)
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
  currentIndex.value = 0
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
      :ref="bindViewport"
      class="synopsis-image-carousel__viewport"
    >
      <div class="synopsis-image-carousel__track">
        <figure
          v-for="item in items"
          :key="item._key"
          class="synopsis-image-carousel__slide"
        >
          <div class="synopsis-image-carousel__frame">
            <AppImage
              :src="item.src"
              :width="item.width"
              :height="item.height"
              :alt="item.alt"
              class="synopsis-image-carousel__image"
              sizes="third"
            />
          </div>
          <figcaption
            v-if="item.caption"
            class="synopsis-image-carousel__caption caption"
          >
            {{ item.caption }}
          </figcaption>
        </figure>
      </div>
    </div>

    <div
      v-if="showControls"
      class="synopsis-image-carousel__controls"
    >

      <p
        class="synopsis-image-carousel__counter handwritten"
        aria-live="polite"
        :aria-label="`Image ${currentIndex + 1} of ${items.length}`"
      >
        {{ currentIndex + 1 }}/{{ items.length }}
      </p>
      <div class="synopsis-image-carousel__arrows">
        <button
          type="button"
          class="synopsis-image-carousel__arrow synopsis-image-carousel__arrow--prev"
          aria-label="Previous images"
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
    </div>
  </div>
</template>

<style scoped>
.synopsis-image-carousel {
  --synopsis-carousel-gap: 0;
  position: relative;
  width: 100%;
}

.synopsis-image-carousel__controls {
  position: relative;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  gap: 1rem;
  margin-top: 2rem;
}

.synopsis-image-carousel__arrows {
  display: flex;
  gap: 0;
}

.synopsis-image-carousel__counter {
  margin: 0;
  font-size: clamp(1.35rem, 2.2vw, 1.85rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  opacity: 0.75;
  pointer-events: none;
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

.synopsis-image-carousel__arrow svg path {
  stroke-width: 0.75px;
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

.synopsis-image-carousel__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 10px;
}

.synopsis-image-carousel__frame :deep(.app-image),
.synopsis-image-carousel__frame :deep(.app-image__media) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.synopsis-image-carousel__frame :deep(.app-image__img) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover;
  object-position: center;
}

.synopsis-image-carousel__image {
  display: block;
  width: 100%;
  height: 100%;
}

.synopsis-image-carousel__caption {
  margin-top: 0.65rem;
}
</style>
