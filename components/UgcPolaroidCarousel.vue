<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  pending: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: 'Photos from the community will appear here soon.',
  },
  ariaLabel: {
    type: String,
    default: 'Community photos',
  },
})

const viewportRef = ref(null)
const atStart = ref(true)
const atEnd = ref(false)

const skeletonCount = 4

const showControls = computed(() =>
  !props.pending && props.items.length > 1,
)

const canGoPrev = computed(() => !atStart.value)
const canGoNext = computed(() => !atEnd.value)

const rotations = [-2.5, 1.75, -1.25, 2, -1.5, 1.25, -2, 0.75]

function rotationForIndex(index) {
  return rotations[index % rotations.length]
}

function getSlideWidth() {
  const viewport = viewportRef.value
  if (!viewport) return 0
  const slide = viewport.querySelector('.ugc-polaroid-carousel__slide')
  return slide?.offsetWidth ?? 0
}

function updateScrollState() {
  const viewport = viewportRef.value
  if (!viewport) return

  const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
  atStart.value = viewport.scrollLeft <= 1
  atEnd.value = viewport.scrollLeft >= maxScroll - 1
}

function scrollBySlides(direction) {
  const viewport = viewportRef.value
  if (!viewport) return

  const slideWidth = getSlideWidth()
  if (!slideWidth) return

  viewport.scrollBy({
    left: direction * slideWidth,
    behavior: 'smooth',
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
  () => props.items.map((item) => item._id).join(','),
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
    class="ugc-polaroid-carousel"
    :aria-label="ariaLabel"
  >
    <div
      v-if="pending"
      class="ugc-polaroid-carousel__viewport"
      aria-busy="true"
    >
      <div class="ugc-polaroid-carousel__track">
        <div
          v-for="n in skeletonCount"
          :key="n"
          class="ugc-polaroid-carousel__slide"
        >
          <div class="ugc-polaroid-carousel__skeleton" />
        </div>
      </div>
    </div>

    <p
      v-else-if="!items.length"
      class="ugc-polaroid-carousel__empty serif"
    >
      {{ emptyMessage }}
    </p>

    <div
      v-else
      class="ugc-polaroid-carousel__stage"
    >
      <button
        v-if="showControls"
        type="button"
        class="ugc-polaroid-carousel__arrow ugc-polaroid-carousel__arrow--prev"
        aria-label="Previous photos"
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

      <div
        :ref="bindViewport"
        class="ugc-polaroid-carousel__viewport"
      >
        <div class="ugc-polaroid-carousel__track">
          <div
            v-for="(item, index) in items"
            :key="item._id"
            class="ugc-polaroid-carousel__slide"
          >
            <UgcPolaroid
              :item="item"
              :rotation="rotationForIndex(index)"
            />
          </div>
        </div>
      </div>

      <button
        v-if="showControls"
        type="button"
        class="ugc-polaroid-carousel__arrow ugc-polaroid-carousel__arrow--next"
        aria-label="Next photos"
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
  </div>
</template>

<style scoped>
.ugc-polaroid-carousel {
  --ugc-carousel-slides-visible: 1.35;
}

@media (min-width: 660px) {
  .ugc-polaroid-carousel {
    --ugc-carousel-slides-visible: 2.5;
  }
}

@media (min-width: 1000px) {
  .ugc-polaroid-carousel {
    --ugc-carousel-slides-visible: 3.5;
  }
}

@media (min-width: 1280px) {
  .ugc-polaroid-carousel {
    --ugc-carousel-slides-visible: 4;
  }
}

.ugc-polaroid-carousel__stage {
  display: flex;
  align-items: stretch;
}

.ugc-polaroid-carousel__viewport {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: clamp(1rem, 3vw, 2rem);
  touch-action: pan-x;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.ugc-polaroid-carousel__viewport::-webkit-scrollbar {
  display: none;
}

.ugc-polaroid-carousel__track {
  display: flex;
  padding: 0 clamp(1rem, 3vw, 2rem);
}

.ugc-polaroid-carousel__slide {
  flex: 0 0 calc(100% / var(--ugc-carousel-slides-visible));
  min-width: 0;
  padding: 1rem 0.65rem 1.5rem;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.ugc-polaroid-carousel__arrow {
  flex: 0 0 clamp(2.5rem, 6vw, 3.5rem);
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.ugc-polaroid-carousel__arrow:disabled {
  opacity: 0.25;
  cursor: default;
}

.ugc-polaroid-carousel__arrow svg {
  width: clamp(1rem, 1.4vw, 1.35rem);
  height: auto;
}

.ugc-polaroid-carousel__empty {
  margin: 0;
  padding: 2rem clamp(1rem, 3vw, 2rem);
  text-align: center;
  opacity: 0.72;
}

.ugc-polaroid-carousel__skeleton {
  aspect-ratio: 0.82;
  background: linear-gradient(
    110deg,
    color-mix(in srgb, currentColor 8%, transparent) 8%,
    color-mix(in srgb, currentColor 14%, transparent) 18%,
    color-mix(in srgb, currentColor 8%, transparent) 33%
  );
  background-size: 200% 100%;
  animation: ugc-shimmer 1.4s linear infinite;
}

@keyframes ugc-shimmer {
  to {
    background-position-x: -200%;
  }
}
</style>
