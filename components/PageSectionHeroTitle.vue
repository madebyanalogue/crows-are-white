<template>
  <section
    v-if="titleBlocks.length"
    ref="sectionRef"
    class="section-hero-title section-padding"
    :class="{ 'section-hero-title--mouse-effect': mouseEffectEnabled }"
  >
    <div class="section-hero-title__inner jumbo text-center grid-1 gap-section">
      <h1 class=" serif">
        <SanityInline :blocks="titleBlocks" />
      </h1>
      <div
        v-if="showVerticalLine"
        class="section-hero-title__line"
        aria-hidden="true"
      />
    </div>

    <div
      v-if="mouseEffectEnabled && effectImages.length"
      ref="cardRef"
      class="section-hero-title__effect-card"
      :style="cardStyle"
      aria-hidden="true"
    >
      <div ref="mediasRef" class="section-hero-title__effect-medias">
        <AppImage
          v-for="(image, index) in effectImages"
          :key="image._key || image.asset?._id || index"
          :src="image.asset?._id || ''"
          :width="image.asset?.metadata?.dimensions?.width"
          :height="image.asset?.metadata?.dimensions?.height"
          :alt="image.alt || ''"
          class="section-hero-title__effect-media"
          :class="{ 'section-hero-title__effect-media--on': index === activeImageIndex }"
          sizes="sm:20vw"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { parseAspectRatioString } from '~/utils/aspectRatio'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const sectionRef = ref(null)
const cardRef = ref(null)
const mediasRef = ref(null)

const titleBlocks = computed(() => props.section?.heroTitleTitle ?? [])
const showVerticalLine = computed(() => props.section?.heroTitleVerticalLine === true)
const mouseEffectEnabled = computed(() => props.section?.heroTitleMouseEffect === true)
const effectImages = computed(() => props.section?.heroTitleMouseEffectImages ?? [])

const cardAspectRatio = computed(() => (
  parseAspectRatioString(props.section?.heroTitleMouseEffectImageRatio) || '0.8'
))

const cardStyle = computed(() => ({
  aspectRatio: cardAspectRatio.value,
}))

const { activeImageIndex } = useHeroTitleMouseEffect({
  enabled: mouseEffectEnabled,
  sectionRef,
  cardRef,
  mediasRef,
  imageCount: computed(() => effectImages.value.length),
})
</script>

<style scoped>
.section-hero-title__inner {
  position: relative;
  z-index: 1;
  align-items: center;
  padding: 1.1em 0;
}

.section-hero-title__line {
  width: 1px;
  height: calc(var(--unit) * 16);
  background: currentColor;
  margin: 0 auto;
}

.section-hero-title--mouse-effect {
  position: relative;
  overflow: hidden;
  cursor: none;
}

.section-hero-title__effect-card {
  width: 20vw;
  min-width: 120px;
  max-width: 280px;
  border-radius: 2%;
  overflow: hidden;
  position: absolute;
  pointer-events: none;
  z-index: 2;
}

.section-hero-title__effect-medias {
  position: relative;
  width: 100%;
  height: 100%;
  transform: scale(1.2, 1.2);
}

.section-hero-title__effect-media {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  visibility: hidden;
  pointer-events: none;
}

.section-hero-title__effect-media--on {
  visibility: visible;
}

.section-hero-title__effect-media :deep(.app-image__media),
.section-hero-title__effect-media :deep(.app-image__img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (hover: none) {
  .section-hero-title--mouse-effect {
    cursor: auto;
  }

  .section-hero-title__effect-card {
    display: none;
  }
}
</style>
