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

const contentAlign = computed(() => {
  const align = props.section?.pressQuotesAlign
  if (align === 'left' || align === 'right') return align
  return 'center'
})

const alignClass = computed(() => `is-align-${contentAlign.value}`)

const carouselElement = ref(null)
const prefersReducedMotion = ref(false)
const currentIndex = ref(0)

const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < quotes.value.length - 1)

const ARROW_SCROLL_DURATION = 1.75

let parallaxInstance = null
let parallaxUpdate = null
let indexUpdate = null
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
  if (nextIndex < 0 || nextIndex >= instance.cells.length) return

  const targetX = -instance.slides[nextIndex].target

  if (arrowTween) arrowTween.kill()

  const finish = () => {
    instance.selectedIndex = nextIndex
    instance.updateSelectedSlide()
    instance.velocity = 0
    instance.positionSlider()
    applyCarouselParallax(instance)
    instance.dispatchEvent('select')
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
  indexUpdate = () => {
    currentIndex.value = instance.selectedIndex
  }
  instance.on('scroll', parallaxUpdate)
  instance.on('resize', parallaxUpdate)
  instance.on('settle', parallaxUpdate)
  instance.on('select', indexUpdate)
  indexUpdate()
  parallaxUpdate()
}

function unbindParallax() {
  if (!parallaxInstance) return
  if (parallaxUpdate) {
    parallaxInstance.off('scroll', parallaxUpdate)
    parallaxInstance.off('resize', parallaxUpdate)
    parallaxInstance.off('settle', parallaxUpdate)
  }
  if (indexUpdate) parallaxInstance.off('select', indexUpdate)
  parallaxInstance = null
  parallaxUpdate = null
  indexUpdate = null
}

const { flickity, ready, reload, destroy: destroyFlickity } = useFlickity(carouselElement, () => ({
  cellAlign: contentAlign.value,
  contain: false,
  draggable: true,
  freeScroll: false,
  friction: 0.24,
  selectedAttraction: 0.012,
  percentPosition: true,
  pageDots: false,
  prevNextButtons: false,
  wrapAround: false,
  onReady: bindParallax,
}))

watch(
  () => [quotes.value.length, contentAlign.value],
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
    :class="[
      alignClass,
      { 'is-stack-mode': isStackMode },
    ]"
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
        :disabled="!canGoPrev"
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

      <div class="page-section-press-quotes__frame">
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

        <HandwrittenScrollCounter
          v-if="quotes.length > 1"
          :index="currentIndex"
          :total="quotes.length"
          placement="bottom-right"
        />
      </div>

      <button
        v-if="quotes.length > 1"
        type="button"
        class="page-section-press-quotes__arrow page-section-press-quotes__arrow--next"
        aria-label="Next press quote"
        :disabled="!canGoNext"
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
  --press-quotes-slide-gap: 15px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100dvh;
  padding-block: clamp(3rem, 8vw, 6rem);
  color: var(--text-color);
  background: var(--background-color);
  overflow: hidden;
}


.page-section-press-quotes__header {
  padding: 0 0 clamp(1.5rem, 4vw, 2.75rem);
}

.page-section-press-quotes.is-align-left .page-section-press-quotes__header {
  text-align: left;
}

.page-section-press-quotes.is-align-center .page-section-press-quotes__header {
  text-align: center;
}

.page-section-press-quotes.is-align-right .page-section-press-quotes__header {
  text-align: right;
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
  gap: clamp(2rem, 6vw, 4rem);
}

.page-section-press-quotes.is-align-left .page-section-press-quotes__stack {
  align-items: flex-start;
}

.page-section-press-quotes.is-align-center .page-section-press-quotes__stack {
  align-items: center;
}

.page-section-press-quotes.is-align-right .page-section-press-quotes__stack {
  align-items: flex-end;
}

.page-section-press-quotes__stack-item {
  width: var(--press-quotes-frame-width);
  aspect-ratio: var(--press-quotes-frame-ratio);
  overflow: hidden;
}

.page-section-press-quotes__stage {
  display: flex;
  align-items: center;
  width: 100%;
  gap: clamp(0.75rem, 2vw, 1.5rem);
}

.page-section-press-quotes.is-align-left .page-section-press-quotes__stage {
  justify-content: flex-start;
}

.page-section-press-quotes.is-align-center .page-section-press-quotes__stage {
  justify-content: center;
}

.page-section-press-quotes.is-align-right .page-section-press-quotes__stage {
  justify-content: flex-end;
}

.page-section-press-quotes__frame {
  position: relative;
  flex: 0 1 var(--press-quotes-frame-width);
  width: var(--press-quotes-frame-width);
}

.page-section-press-quotes__viewport {
  position: relative;
  width: 100%;
  aspect-ratio: var(--press-quotes-frame-ratio);
  overflow: visible;
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

.page-section-press-quotes__arrow:disabled {
  opacity: 0.25;
  cursor: default;
  pointer-events: none;
}

.page-section-press-quotes__carousel {
  width: 100%;
  height: 100%;
}

.page-section-press-quotes__carousel:not(.flickity-enabled) {
  display: flex;
  overflow: visible;
}

.page-section-press-quotes__cell {
  width: calc(100% - var(--press-quotes-slide-gap));
  height: 100%;
  flex-shrink: 0;
  margin-right: var(--press-quotes-slide-gap);
  overflow: visible;
}

.page-section-press-quotes__carousel :deep(.flickity-cell) {
  width: calc(100% - var(--press-quotes-slide-gap));
  margin-right: var(--press-quotes-slide-gap);
  height: 100%;
  overflow: visible;
}

.page-section-press-quotes__card {
  width: 100%;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
  corner-shape: notch;
}

.page-section-press-quotes__visual {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
  background: color-mix(in srgb, var(--text-color) 8%, var(--background-color));
}

.page-section-press-quotes__layers {
  position: absolute;
  inset: 0;
  overflow: visible;
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
  overflow: visible;
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
