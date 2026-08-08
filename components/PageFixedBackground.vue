<script setup>
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'

const props = defineProps({
  source: {
    type: Object,
    default: null,
  },
  prefix: {
    type: String,
    default: 'pageBackground',
  },
  title: {
    type: String,
    default: 'Page background',
  },
  fixed: {
    type: Boolean,
    default: true,
  },
})

const mediaTypeField = computed(() => `${props.prefix}MediaType`)

const loop = computed(() => {
  if (props.source?.[mediaTypeField.value] !== 'video') return null
  return resolveSectionLoopVideo(props.source, props.prefix)
})

const hasVideo = computed(() =>
  Boolean(
    loop.value?.kind === 'mp4'
    || loop.value?.kind === 'cloudflare'
    || loop.value?.kind === 'youtube',
  ),
)

const overlayOpacity = computed(() => {
  const value = Number(props.source?.[`${props.prefix}OverlayOpacity`])
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 100) / 100
})

const scrimOpacity = computed(() => {
  const value = Number(props.source?.[`${props.prefix}ScrimOpacity`])
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 100) / 100
})

const backgroundStyle = computed(() => ({
  '--page-fixed-background-overlay': overlayOpacity.value,
  '--page-fixed-background-scrim': scrimOpacity.value,
}))
</script>

<template>
  <div
    v-if="hasVideo"
    class="page-fixed-background"
    :class="{ 'page-fixed-background--fixed': fixed }"
    :style="backgroundStyle"
    aria-hidden="true"
  >
    <SectionLoopVideo
      :loop="loop"
      :title="title"
      aspect-class="page-fixed-background__media"
    />
    <div
      v-if="scrimOpacity > 0"
      class="page-fixed-background__scrim"
      aria-hidden="true"
    />
    <div class="page-fixed-background__overlay" />
  </div>
</template>

<style scoped>
.page-fixed-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.page-fixed-background--fixed {
  position: fixed;
}

.page-fixed-background__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #000;
  opacity: var(--page-fixed-background-scrim, 0);
  pointer-events: none;
}

.page-fixed-background__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--background-color, #fff);
  opacity: var(--page-fixed-background-overlay, 0);
  pointer-events: none;
}

.page-fixed-background :deep(.page-fixed-background__media) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.page-fixed-background :deep(.section-loop-video),
.page-fixed-background :deep(.video-loop) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.page-fixed-background :deep(.section-loop-video__el),
.page-fixed-background :deep(.video-loop__native),
.page-fixed-background :deep(.video-loop__iframe) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (prefers-reduced-motion: reduce) {
  .page-fixed-background {
    display: none;
  }
}
</style>
