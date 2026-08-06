<script setup>
import gsap from 'gsap'
import { resolveSanityAssetUrl } from '~/utils/sanity'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const FRAME_WIDTH = 1420
const LAYER_WIDTH = 1600
const LAYER_OVERFLOW_RATIO = (LAYER_WIDTH - FRAME_WIDTH) / FRAME_WIDTH / 2
const LAYER_FACTORS = [0.15, 0.5, 1]
const PARALLAX_STRENGTH = LAYER_OVERFLOW_RATIO * 100 * 1.45

const { pressQuotes: allPressQuotes } = useSiteContent()

const quotes = computed(() => {
  const selected = (props.section?.pressQuotesItems || []).filter(Boolean)
  if (selected.length) return selected
  return allPressQuotes.value || []
})
const hasQuotes = computed(() => quotes.value.length > 0)
const sectionTitle = computed(() => props.section?.pressQuotesTitle?.trim() || 'Press Quotes')
const showTitle = computed(() => props.section?.pressQuotesShowTitle !== false)
const isStackMode = computed(() => props.section?.pressQuotesStackMode === true)

const carouselElement = ref(null)
const prefersReducedMotion = ref(false)

const ARROW_SCROLL_DURATION = 1.75

let parallaxInstance = null
let parallaxUpdate = null
let arrowTween = null

function layerImageUrl(quote, layerKey) {
  return resolveSanityAssetUrl(quote?.[layerKey]?.asset) || ''
}

function hasLayerImage(quote, layerKey) {
  return Boolean(layerImageUrl(quote, layerKey))
}

function layerAlt(quote, layerIndex) {
  const publication = quote?.pub || 'Press quote'
  return `${publication} — layer ${layerIndex}`
}

function quoteKey(quote, index) {
  return quote?._id || `${quote?.pub || 'quote'}-${index}`
}

function setLayersParallax(layers, normalized) {
  if (prefersReducedMotion.value) return

  layers.forEach((layer, layerIndex) => {
    if (layerIndex === 2) {
      gsap.set(layer, { xPercent: -50, force3D: true })
      return
    }

    const factor = LAYER_FACTORS[layerIndex] ?? LAYER_FACTORS[LAYER_FACTORS.length - 1]
    const maxShift = PARALLAX_STRENGTH * factor
    const shift = gsap.utils.clamp(-maxShift, maxShift, normalized * maxShift)
    gsap.set(layer, { xPercent: -50 + shift, force3D: true })
  })
}

function scrollByArrow(direction) {
  const instance = flickity.value
  if (!instance?.cells?.length || instance.cells.length < 2) return

  const nextIndex = instance.selectedIndex + direction
  instance.isDragSelect = false
  instance._wrapSelect(nextIndex)

  const wrappedIndex = (
    (nextIndex % instance.slides.length) + instance.slides.length
  ) % instance.slides.length
  const targetX = -instance.slides[wrappedIndex].target

  if (arrowTween) arrowTween.kill()

  const finish = () => {
    instance.selectedIndex = wrappedIndex
    instance.updateSelectedSlide()
    instance.velocity = 0
    instance.positionSlider()
    applyCarouselParallax(instance)
    instance.dispatchEvent('settle')
  }

  if (prefersReducedMotion.value) {
    instance.x = targetX
    finish()
    return
  }

  const motion = { x: instance.x }
  arrowTween = gsap.to(motion, {
    x: targetX,
    duration: ARROW_SCROLL_DURATION,
    ease: 'power4.out',
    onUpdate: () => {
      instance.x = motion.x
      instance.velocity = 0
      instance.positionSlider()
      applyCarouselParallax(instance)
    },
    onComplete: () => {
      arrowTween = null
      finish()
    },
  })
}

function applyCarouselParallax(instance) {
  if (prefersReducedMotion.value || !instance?.cells?.length) return

  const viewportRect = instance.viewport.getBoundingClientRect()
  const viewportCenterX = viewportRect.left + viewportRect.width / 2

  instance.cells.forEach((cell) => {
    const cellRect = cell.element.getBoundingClientRect()
    const cellCenterX = cellRect.left + cellRect.width / 2
    const cellHalfWidth = Math.max(cellRect.width / 2, 1)
    const normalized = (cellCenterX - viewportCenterX) / cellHalfWidth
    const layers = cell.element.querySelectorAll('[data-parallax-layer]')
    setLayersParallax(layers, normalized)
  })
}

function bindParallax(instance) {
  unbindParallax()
  parallaxInstance = instance
  parallaxUpdate = () => {
    applyCarouselParallax(instance)
  }
  instance.on('scroll', parallaxUpdate)
  instance.on('resize', parallaxUpdate)
  instance.on('settle', parallaxUpdate)
  parallaxUpdate()
}

function unbindParallax() {
  if (!parallaxInstance || !parallaxUpdate) return
  parallaxInstance.off('scroll', parallaxUpdate)
  parallaxInstance.off('resize', parallaxUpdate)
  parallaxInstance.off('settle', parallaxUpdate)
  parallaxInstance = null
  parallaxUpdate = null
}

const { flickity, ready, reload, destroy: destroyFlickity } = useFlickity(carouselElement, () => ({
  cellAlign: 'left',
  contain: true,
  draggable: true,
  freeScroll: false,
  friction: 0.28,
  selectedAttraction: 0.025,
  percentPosition: true,
  pageDots: false,
  prevNextButtons: false,
  wrapAround: true,
  onReady: bindParallax,
}))

watch(
  () => quotes.value.length,
  async () => {
    if (!quotes.value.length || isStackMode.value) return
    await nextTick()
    reload()
    if (parallaxInstance) applyCarouselParallax(parallaxInstance)
  },
)

watch(isStackMode, (stack) => {
  if (stack) {
    if (arrowTween) arrowTween.kill()
    unbindParallax()
    destroyFlickity()
  }
})

onMounted(() => {
  if (!import.meta.client) return
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onBeforeUnmount(() => {
  if (arrowTween) arrowTween.kill()
  unbindParallax()
})
</script>

<template>
  <section
    v-if="hasQuotes"
    class="page-section-press-quotes"
    :class="{ 'is-stack-mode': isStackMode }"
    aria-label="Press Quotes"
  >
    <div
      v-if="showTitle"
      class="page-section-press-quotes__header"
    >
      <h2 class="page-section-press-quotes__title serif">
        {{ sectionTitle }}
      </h2>
    </div>

    <div
      v-if="isStackMode"
      class="page-section-press-quotes__stack"
    >
      <article
        v-for="(quote, index) in quotes"
        :key="quoteKey(quote, index)"
        class="page-section-press-quotes__stack-item"
      >
        <div class="page-section-press-quotes__visual">
          <div class="page-section-press-quotes__layers">
            <div
              v-for="layerIndex in 3"
              :key="`layer-${layerIndex}`"
              class="page-section-press-quotes__layer"
              :style="{ zIndex: layerIndex }"
            >
              <img
                v-if="hasLayerImage(quote, `layer${layerIndex}`)"
                class="page-section-press-quotes__layer-img"
                :src="layerImageUrl(quote, `layer${layerIndex}`)"
                :alt="layerAlt(quote, layerIndex)"
                draggable="false"
                loading="lazy"
              >
            </div>
          </div>
        </div>
      </article>
    </div>

    <div
      v-else
      class="page-section-press-quotes__stage"
    >
      <button
        v-if="quotes.length > 1"
        type="button"
        class="page-section-press-quotes__arrow page-section-press-quotes__arrow--prev"
        aria-label="Previous press quote"
        @click="scrollByArrow(-1)"
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
        class="page-section-press-quotes__viewport"
        :class="{ 'is-ready': ready }"
      >
        <div
          ref="carouselElement"
          class="page-section-press-quotes__carousel"
        >
          <div
            v-for="(quote, index) in quotes"
            :key="quoteKey(quote, index)"
            class="page-section-press-quotes__cell"
          >
            <article class="page-section-press-quotes__card">
              <div class="page-section-press-quotes__visual">
                <div class="page-section-press-quotes__layers">
                  <div
                    v-for="layerIndex in 3"
                    :key="`layer-${layerIndex}`"
                    class="page-section-press-quotes__layer"
                    :style="{ zIndex: layerIndex }"
                  >
                    <img
                      v-if="hasLayerImage(quote, `layer${layerIndex}`)"
                      data-parallax-layer
                      class="page-section-press-quotes__layer-img"
                      :src="layerImageUrl(quote, `layer${layerIndex}`)"
                      :alt="layerAlt(quote, layerIndex)"
                      draggable="false"
                      loading="lazy"
                    >
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <button
        v-if="quotes.length > 1"
        type="button"
        class="page-section-press-quotes__arrow page-section-press-quotes__arrow--next"
        aria-label="Next press quote"
        @click="scrollByArrow(1)"
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
  </section>
</template>

<style scoped>
.page-section-press-quotes {
  --press-quotes-frame-width: min(100%, 1420px);
  --press-quotes-frame-ratio: 1420 / 800;
  --press-quotes-layer-scale: 1600 / 1420;
  position: relative;
  padding: clamp(3rem, 8vw, 6rem) 0;
  color: var(--text-color);
  background: var(--background-color);
  overflow: hidden;
}

.page-section-press-quotes__header {
  padding: 0 var(--gutter) clamp(1.5rem, 4vw, 2.75rem);
}

.page-section-press-quotes__title {
  margin: 0;
  font-size: clamp(1.75rem, 3.2vw, 3rem);
  letter-spacing: 0.02em;
  line-height: 1.1;
}

.page-section-press-quotes__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem, 6vw, 4rem);
  padding-inline: var(--gutter);
}

.page-section-press-quotes__stack-item {
  width: var(--press-quotes-frame-width);
  aspect-ratio: var(--press-quotes-frame-ratio);
  overflow: hidden;
}

.page-section-press-quotes__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
}

.page-section-press-quotes__viewport {
  position: relative;
  flex: 0 1 var(--press-quotes-frame-width);
  width: var(--press-quotes-frame-width);
  aspect-ratio: var(--press-quotes-frame-ratio);
  overflow: hidden;
  visibility: hidden;
}

.page-section-press-quotes__viewport.is-ready {
  visibility: visible;
}

.page-section-press-quotes__arrow {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: clamp(2.5rem, 4vw, 3.25rem);
  height: clamp(2.5rem, 4vw, 3.25rem);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.page-section-press-quotes__arrow svg {
  width: clamp(1rem, 1.4vw, 1.35rem);
  height: auto;
}

.page-section-press-quotes__arrow--prev svg {
  transform: scaleX(-1);
}

.page-section-press-quotes__arrow:hover {
  color: var(--menu-highlight-color, var(--arancio));
}

.page-section-press-quotes__arrow:focus-visible {
  outline: 2px solid var(--menu-highlight-color, var(--arancio));
  outline-offset: 4px;
}

.page-section-press-quotes__carousel {
  width: 100%;
  height: 100%;
}

.page-section-press-quotes__carousel:not(.flickity-enabled) {
  display: flex;
  overflow: hidden;
}

.page-section-press-quotes__cell {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
}

.page-section-press-quotes__carousel :deep(.flickity-cell) {
  margin-right: 0;
  height: 100%;
  overflow: hidden;
}

.page-section-press-quotes__card {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.page-section-press-quotes__visual {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: color-mix(in srgb, var(--text-color) 8%, var(--background-color));
}

.page-section-press-quotes__layers {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.page-section-press-quotes__layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.page-section-press-quotes__layer:nth-child(3) .page-section-press-quotes__layer-img {
  width: 100%;
}

.page-section-press-quotes__layer-img {
  position: absolute;
  top: 0;
  left: 50%;
  width: calc(100% * var(--press-quotes-layer-scale));
  height: 100%;
  max-width: none;
  object-fit: cover;
  transform: translateX(-50%);
  will-change: transform;
}

.page-section-press-quotes__carousel :deep(.flickity-viewport) {
  overflow: hidden;
  height: 100% !important;
  transition: height 0.2s;
}

.page-section-press-quotes__carousel :deep(.flickity-slider) {
  display: flex;
  align-items: stretch;
  height: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .page-section-press-quotes__carousel :deep(.flickity-viewport) {
    transition: none;
  }

  .page-section-press-quotes__layer-img {
    will-change: auto;
  }
}
</style>
