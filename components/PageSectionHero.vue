<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const loop = computed(() => resolveSectionLoopVideo(props.section, 'hero'))
const logoUrl = computed(() => resolveSanityAssetUrl(props.section?.heroLogo?.asset) || '')

const buttons = computed(() => {
  const items = props.section?.heroButtons || []
  return items
    .map((item, index) => ({
      _key: item._key || `hero-btn-${index}`,
      text: item.linkTitle || '',
      link: {
        type: item.type,
        page: item.page,
        url: item.url,
      },
      isButton: item.style !== 'secondary',
    }))
    .filter((item) => item.text)
})

const showScrim = computed(() => props.section?.heroShowScrim !== false)
</script>

<template>
  <section
    id="hero"
    class="page-section-hero"
    data-hero-section
  >
    <div class="page-section-hero__media-wrap">
      <SectionLoopVideo
        :loop="loop"
        title="Hero background"
        aspect-class="page-section-hero__media"
      />
      <div
        v-if="showScrim"
        class="page-section-hero__scrim"
        aria-hidden="true"
      />
    </div>

    <img
      v-if="logoUrl"
      class="page-section-hero__logo"
      :src="logoUrl"
      :alt="section.heroLogoAlt || 'Crows Are White'"
      draggable="false"
    >

    <div
      v-if="buttons.length"
      class="page-section-hero__cta-group"
    >
      <MenuLink
        v-for="button in buttons"
        :key="button._key"
        :item="button"
        :link-class="button.isButton ? 'btn-primary' : 'btn-secondary'"
        :show-arrow="false"
      />
    </div>
  </section>
</template>

<style scoped>
.page-section-hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  background: #000;
  color: var(--fuji, #fff);
}

.page-section-hero__media-wrap {
  position: absolute;
  inset: 0;
}

.page-section-hero :deep(.page-section-hero__media) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.page-section-hero :deep(.video-loop),
.page-section-hero :deep(.section-loop-video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.page-section-hero :deep(.video-loop__native),
.page-section-hero :deep(.video-loop__iframe),
.page-section-hero :deep(.section-loop-video__el) {
  object-position: center 20%;
}

.page-section-hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.page-section-hero__logo {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: min(72vw, 520px);
  height: auto;
  transform: translate(-50%, -58%);
  pointer-events: none;
  user-select: none;
}

.page-section-hero__cta-group {
  position: absolute;
  left: 50%;
  bottom: clamp(2rem, 8vh, 5rem);
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem 1rem;
  width: min(92vw, 640px);
  transform: translateX(-50%);
}

.page-section-hero__cta-group :deep(.menu-link) {
  pointer-events: auto;
}
</style>
