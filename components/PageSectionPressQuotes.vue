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
const LAYER_FACTORS = [0.28, 0.58, 1]
const PARALLAX_STRENGTH = LAYER_OVERFLOW_RATIO * 100

const { pressQuotes: allPressQuotes } = useSiteContent()

const quotes = computed(() => {
  const selected = (props.section?.pressQuotesItems || []).filter(Boolean)
  if (selected.length) return selected
  return allPressQuotes.value || []
})
const hasQuotes = computed(() => quotes.value.length > 0)
const sectionTitle = computed(() => props.section?.pressQuotesTitle?.trim() || 'Press Quotes')
const showTitle = computed(() => props.section?.pressQuotesShowTitle !== false)

const sliderElement = ref(null)
const sliderSettled = ref(false)

function layerImageUrl(quote, layerKey) {
  return resolveSanityAssetUrl(quote?.[layerKey]?.asset) || ''
}

function hasLayerImage(quote, layerKey) {
  return Boolean(layerImageUrl(quote, layerKey))
}

function layerAlt(quote, layerIndex) {
  const publication = quote?.pub || 'Press quote'
  return `${publication} — parallax layer ${layerIndex}`
}

function quoteKey(quote, index) {
  return quote?._id || `${quote?.pub || 'quote'}-${index}`
}

const prefersReducedMotion = ref(false)

function applyParallax(instance) {
  if (prefersReducedMotion.value || !instance?.items?.length || !instance.parallaxValues?.length) return

  instance.items.forEach((slideEl, slideIndex) => {
    const parallax = instance.parallaxValues[slideIndex] ?? 0
    const layers = slideEl.querySelectorAll('[data-parallax-layer]')

    layers.forEach((layer, layerIndex) => {
      const factor = LAYER_FACTORS[layerIndex] ?? LAYER_FACTORS[LAYER_FACTORS.length - 1]
      const shift = parallax * PARALLAX_STRENGTH * factor
      gsap.set(layer, { xPercent: -50 + shift, force3D: true })
    })
  })
}

const { slider, destroy: destroySlider } = useSmooothy(sliderElement, () => ({
  infinite: false,
  snap: true,
  variableWidth: true,
  scrollInput: true,
  lerpFactor: 0.38,
  snapStrength: 0.14,
  dragSensitivity: 0.006,
  scrollSensitivity: 1.15,
  speedDecay: 0.94,
  setOffset: ({ wrapperWidth }) => wrapperWidth / 2,
  onUpdate: applyParallax,
  onResize: (instance) => {
    applyParallax(instance)
  },
  onReady: (instance) => {
    instance.resize?.()
    applyParallax(instance)
    sliderSettled.value = true
  },
}))

watch(
  () => quotes.value.length,
  async (count) => {
    if (!count) return
    await nextTick()
    slider.value?.resize?.()
    applyParallax(slider.value)
  },
)

onMounted(() => {
  if (!import.meta.client) return
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onBeforeUnmount(() => {
  destroySlider()
})
</script>

<template>
  <section
    v-if="hasQuotes"
    class="page-section-press-quotes"
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

    <div class="page-section-press-quotes__viewport">
      <div
        ref="sliderElement"
        class="page-section-press-quotes__slider"
        :class="{ 'is-settled': sliderSettled }"
        data-slider
      >
        <div
          v-for="(quote, index) in quotes"
          :key="quoteKey(quote, index)"
          class="page-section-press-quotes__slide"
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

              <div class="page-section-press-quotes__copy">
                <blockquote class="page-section-press-quotes__quote serif">
                  “{{ quote.quote }}”
                </blockquote>
                <p class="page-section-press-quotes__cite">
                  <span class="page-section-press-quotes__publication">{{ quote.pub }}</span>
                  <span
                    v-if="quote.reviewer"
                    class="page-section-press-quotes__reviewer"
                  >
                    {{ quote.reviewer }}
                  </span>
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-section-press-quotes {
  --press-quotes-gap: clamp(16px, 2.5vw, 32px);
  --press-quotes-slide-width: 96%;
  --press-quotes-frame-ratio: 1420 / 800;
  --press-quotes-layer-scale: 1600 / 1420;
  position: relative;
  padding: clamp(3rem, 8vw, 6rem) 0;
  color: var(--text-color);
  background: var(--background-color);
  overflow: hidden;
}

@media (min-width: 700px) {
  .page-section-press-quotes {
    --press-quotes-slide-width: 90%;
  }
}

@media (min-width: 1000px) {
  .page-section-press-quotes {
    --press-quotes-slide-width: 60%;
  }
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

.page-section-press-quotes__viewport {
  width: 100%;
  overflow: hidden;
}

.page-section-press-quotes__slider {
  display: flex;
  width: 100%;
  overflow-x: hidden;
  touch-action: pan-y;
  cursor: grab;
  visibility: hidden;
}

.page-section-press-quotes__slider.is-settled {
  visibility: visible;
}

.page-section-press-quotes__slider:active {
  cursor: grabbing;
}

.page-section-press-quotes__slide {
  flex: 0 0 auto;
  width: calc(var(--press-quotes-slide-width) + var(--press-quotes-gap));
  padding-inline: calc(var(--press-quotes-gap) / 2);
  box-sizing: border-box;
}

.page-section-press-quotes__card {
  width: 100%;
}

.page-section-press-quotes__visual {
  position: relative;
  width: 100%;
  aspect-ratio: var(--press-quotes-frame-ratio);
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

.page-section-press-quotes__copy {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.75rem;
  height: 100%;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  background: linear-gradient(
    180deg,
    rgb(0 0 0 / 0%) 35%,
    rgb(0 0 0 / 42%) 100%
  );
  color: #fff;
}

.page-section-press-quotes__quote {
  margin: 0;
  max-width: 28ch;
  font-size: clamp(1.25rem, 2.4vw, 2.35rem);
  line-height: 1.15;
  letter-spacing: 0.01em;
}

.page-section-press-quotes__cite {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin: 0;
  font-size: clamp(0.75rem, 1.1vw, 0.95rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-section-press-quotes__publication {
  font-weight: 600;
}

.page-section-press-quotes__reviewer {
  opacity: 0.82;
}

.page-section-press-quotes__reviewer::before {
  content: '·';
  margin-right: 0.75rem;
}

@media (prefers-reduced-motion: reduce) {
  .page-section-press-quotes__layer-img {
    will-change: auto;
  }

  .page-section-press-quotes__slider {
    cursor: default;
  }
}
</style>
