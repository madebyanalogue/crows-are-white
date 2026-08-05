<template>
  <section
    v-if="hasContent"
    class="section-testimonial"
    :class="{ 'section-testimonial--has-image': hasImage }"
    :style="sectionPaddingStyle"
  >
    <div :class="{ 'wrapper-sm': !hasImage }">
      <div class="section-testimonial__content">
        <div class="section-testimonial__media">
          <figure v-if="hasImage" class="section-testimonial__figure-image">
            <AppImage
              :src="imageId"
              :width="imageWidth"
              :height="imageHeight"
              :alt="imageAlt"
              class="section-testimonial__img"
              sizes="half"
            />
          </figure>
          <svg
            v-else
            class="section-testimonial__quotes"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 43 33"
          >
            <path d="M.38,32.54c3.35-2.03,6.23-4.32,8.67-7.25,2.28-2.73,3.43-6.14,3.05-9.69-.1-.95-.46-1.76-1.11-2.48h-6.2c-2.57-1.8-3.6-5.2-2.34-8.13C3.73,2.01,6.79.38,9.99.44c2.71.05,5.12,1.05,6.88,3.08,1.36,1.57,2.28,3.38,2.74,5.45.75,3.44.51,7.02-.73,10.32-2.04,5.41-6.52,9.72-11.81,11.9-2.16.89-4.39,1.4-6.69,1.34Z" />
            <path d="M22.92,32.57c3.78-2.25,8.77-6.27,10.61-10.25,1.03-2.22,1.46-4.62,1.08-7.04-.12-.79-.47-1.66-1.09-2.14l-6.14-.02c-3.23-2.18-3.85-6.8-1.34-9.79,3.24-3.87,9.34-3.68,12.72-.49,1.76,1.65,2.91,3.78,3.43,6.16,1.13,5.19-.03,10.46-3.13,14.76-3.6,5-9.72,8.83-16.14,8.81Z" />
          </svg>
        </div>

        <div class="section-testimonial__text">
          <div class="section-testimonial__content-inner grid-1 gap-2 max-text-block-width pad-2 pad-sm-0">
            <div class="section-testimonial__quote-block gap-6">
              <div class="section-testimonial__slides">
                <div
                  v-for="(item, index) in items"
                  :key="item._key || index"
                  class="section-testimonial__slide"
                  :class="{
                    'is-displayed': index === displayedIndex,
                    'is-visible': index === displayedIndex && slideVisible,
                  }"
                >
                  <div v-if="item.quote" class="section-testimonial__quote">
                    {{ item.quote }}
                  </div>
                  <div v-if="item.cite" class="section-testimonial__cite">
                    {{ item.cite }}
                  </div>
                </div>
              </div>

              <div
                v-if="hasMultipleItems"
                class="section-testimonial__dots"
                role="tablist"
                aria-label="Testimonials"
              >
                <button
                  v-for="(item, index) in items"
                  :key="`dot-${item._key || index}`"
                  type="button"
                  class="section-testimonial__dot"
                  role="tab"
                  :aria-selected="index === displayedIndex"
                  :aria-label="`Testimonial ${index + 1}`"
                  @click="goToSlide(index)"
                >
                  <span class="section-testimonial__dot-track" />
                  <span
                    v-if="index < displayedIndex"
                    class="section-testimonial__dot-fill is--static"
                  />
                  <span
                    v-else-if="index === displayedIndex && autoplayEnabled"
                    :key="dotAnimationKey"
                    class="section-testimonial__dot-fill"
                  />
                  <span
                    v-else-if="index === displayedIndex"
                    class="section-testimonial__dot-fill is--static"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const AUTOPLAY_MS = 6000
const FADE_MS = 400

const SECTION_PADDING_VALUES = {
  none: '0',
  small: 'var(--section-padding-small)',
  large: 'var(--section-padding)',
  xlarge: 'calc(var(--section-padding) * 1.5)',
}

function resolveSectionPadding(value) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }

  // Legacy boolean: true = padding on, false = no padding
  if (value === true) return 'large'
  if (value === false) return 'none'
  return 'none'
}

const sectionPaddingStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.testimonialPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.testimonialPaddingBottom)],
}))

const sectionImage = computed(() => props.section?.testimonialImage ?? null)

const items = computed(() => {
  const fromArray = (props.section?.testimonialItems ?? [])
    .map((item, index) => ({
      _key: item?._key || `item-${index}`,
      quote: item?.quote?.trim() ?? '',
      cite: item?.cite?.trim() ?? '',
      image: item?.image ?? null,
    }))
    .filter((item) => item.quote || item.cite)

  if (fromArray.length) return fromArray

  const quote = props.section?.testimonial?.trim() ?? ''
  const cite = props.section?.testimonialCite?.trim() ?? ''
  if (quote || cite) {
    return [{ _key: 'legacy', quote, cite }]
  }

  return []
})

const hasMultipleItems = computed(() => items.value.length > 1)

const displayedIndex = ref(0)
const slideVisible = ref(true)
const autoplayEnabled = ref(true)
const dotAnimationKey = ref(0)

let transitionId = 0
let autoplayTimer = null

const activeItem = computed(() => items.value[displayedIndex.value] ?? null)

const image = computed(() => {
  const itemImage = activeItem.value?.image
  if (itemImage?.asset?._id) return itemImage
  return sectionImage.value
})
const imageId = computed(() => image.value?.asset?._id || '')
const imageWidth = computed(() => image.value?.asset?.metadata?.dimensions?.width)
const imageHeight = computed(() => image.value?.asset?.metadata?.dimensions?.height)
const hasImage = computed(() => Boolean(imageId.value))

const imageAlt = computed(() => {
  const alt = image.value?.alt
  if (typeof alt === 'string' && alt.trim()) return alt.trim()
  if (activeItem.value?.cite) return activeItem.value.cite
  if (activeItem.value?.quote) return activeItem.value.quote
  return 'Testimonial image'
})

const hasContent = computed(
  () => Boolean(items.value.length || hasImage.value),
)

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clearAutoplay() {
  if (autoplayTimer) {
    clearTimeout(autoplayTimer)
    autoplayTimer = null
  }
}

function scheduleAutoplay() {
  clearAutoplay()
  if (!autoplayEnabled.value || !hasMultipleItems.value) return

  dotAnimationKey.value += 1
  autoplayTimer = setTimeout(() => {
    if (!autoplayEnabled.value) return
    advanceSlide()
  }, AUTOPLAY_MS)
}

async function transitionToSlide(index) {
  const id = ++transitionId

  if (slideVisible.value) {
    slideVisible.value = false
    await wait(FADE_MS)
    if (id !== transitionId) return
  }

  displayedIndex.value = index
  await nextTick()
  if (id !== transitionId) return

  slideVisible.value = true
}

async function advanceSlide() {
  const nextIndex = (displayedIndex.value + 1) % items.value.length
  await transitionToSlide(nextIndex)
  scheduleAutoplay()
}

async function goToSlide(index) {
  if (index === displayedIndex.value && slideVisible.value) return

  autoplayEnabled.value = false
  clearAutoplay()
  await transitionToSlide(index)
}

watch(items, (nextItems) => {
  if (!nextItems.length) {
    displayedIndex.value = 0
    slideVisible.value = true
    autoplayEnabled.value = false
    clearAutoplay()
    return
  }

  if (displayedIndex.value >= nextItems.length) {
    displayedIndex.value = 0
  }

  if (nextItems.length <= 1) {
    autoplayEnabled.value = false
    clearAutoplay()
    return
  }

  if (!autoplayEnabled.value) return

  clearAutoplay()
  scheduleAutoplay()
})

onMounted(() => {
  if (hasMultipleItems.value) {
    scheduleAutoplay()
  }
})

onUnmounted(() => {
  clearAutoplay()
})
</script>

<style scoped>
.section-testimonial {
  --testimonial-autoplay-duration: 6s;
  overflow: hidden;
}

.section-testimonial__content {
  position: relative;
  background-color: var(--crayon);
  display: grid;
  grid-template-columns: 1fr; 
}

@media (min-width: 1000px) {
  .section-testimonial__content {
    grid-template-columns: 1fr 1fr;
  }
  .section-testimonial:not(.section-testimonial--has-image) .section-testimonial__content {
    --max-text-block-width: calc(var(--unit) * 25);
  }
}

.section-testimonial__content > * {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--crayon);
}

.section-testimonial--has-image .section-testimonial__media {
  aspect-ratio: 1 / 1;
}

.section-testimonial--has-image .section-testimonial__content > * {
  background-color: transparent;
}

@media (min-width: 1000px) {
  .section-testimonial--has-image .section-testimonial__text {
    aspect-ratio: 1 / 1;
  }
}
.section-testimonial__text {
  padding: 20px;
}
@media (min-width: 700px) {
.section-testimonial__text {
  padding: calc(var(--unit) * 8);
}
.section-testimonial--has-image .section-testimonial__text {
  padding: calc(var(--unit) * 6);
}
}

@media (min-width: 1000px) {
.section-testimonial__text,
.section-testimonial--has-image .section-testimonial__text {
  padding: calc(var(--unit) * 8);
}
}

.section-testimonial__figure-image {
  width: 100%;
  height: 100%;
  margin: 0;
  aspect-ratio: 1;
  overflow: hidden;
}

.section-testimonial__figure-image > * {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.section-testimonial__figure-image:deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.section-testimonial__img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.section-testimonial__quote-block {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0;
}

.section-testimonial__slides {
  display: grid;
}

.section-testimonial__slide {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 1.5);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.section-testimonial__slide.is-displayed {
  visibility: visible;
}

.section-testimonial__slide.is-visible {
  opacity: 1;
}

.section-testimonial__quote {
  margin: 0;
}

.section-testimonial__cite {
  margin: 0;
}

.section-testimonial__dots {
  display: flex;
  gap: 15px;
}

.section-testimonial__dot {
  position: relative;
  width: 66px;
  padding: 12px 0 0px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: currentColor;
}

.section-testimonial__dot-track {
  display: block;
  width: 100%;
  height: 1px;
  background: currentColor;
  opacity: 0.2;
}

.section-testimonial__dot-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform-origin: left center;
  transform: scaleX(0);
  animation: section-testimonial-dot-fill var(--testimonial-autoplay-duration) linear forwards;
}

.section-testimonial__dot-fill.is--static {
  transform: scaleX(1);
  animation: none;
}

@keyframes section-testimonial-dot-fill {
  to {
    transform: scaleX(1);
  }
}

.section-testimonial__quotes {
  height: auto;
  opacity: 1;
  position: absolute;
  top: 0;
  left: 10%;
  width: 22%;
  height: auto;
  transform: translateY(-40%);
}

@media (min-width: 1000px) {
  .section-testimonial__quotes {
    transform: translateY(-15%);
    width: 25%;
  }
}

.app-image__media {
  aspect-ratio: 1;
}

.app-image__media > * {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
