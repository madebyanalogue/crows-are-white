<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

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
  if (value === false) return 'none'
  return 'large'
}

function resolveMediaLoop(item) {
  if (!item || item.mediaType !== 'video') return null
  return resolveSectionLoopVideo({
    mediaVideoSource: item.videoSource,
    mediaLoopCloudflare720: item.loopCloudflare720,
    mediaLoopCloudflare1080: item.loopCloudflare1080,
    mediaVideoFile: item.videoFile,
    mediaVideoId: item.videoId,
  }, 'media')
}

function resolveQuarterItem(item, index) {
  if (!item) return null

  if (item.mediaType === 'video') {
    const loop = resolveMediaLoop(item)
    if (!loop) return null
    return {
      _key: item._key || `quarters-item-${index}`,
      kind: 'video',
      loop,
      alt: item.alt?.trim() || 'Video',
    }
  }

  const imageUrl = resolveSanityAssetUrl(item?.image?.asset) || ''
  if (!imageUrl) return null

  return {
    _key: item._key || `quarters-item-${index}`,
    kind: 'image',
    imageUrl,
    alt: item.alt?.trim() || '',
  }
}

const title = computed(() => props.section?.quartersTitle?.trim() || '')

const items = computed(() =>
  (props.section?.quartersItems || [])
    .map((item, index) => resolveQuarterItem(item, index))
    .filter(Boolean),
)

const hasContent = computed(() => items.value.length > 0)

const useWrapper = computed(() => props.section?.quartersUseWrapper === true)

const sectionStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.quartersPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.quartersPaddingBottom)],
}))

const sectionRef = ref(null)
let inViewObserver = null

onMounted(() => {
  if (!import.meta.client || !sectionRef.value) return

  const section = sectionRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return

  section.classList.add('is-ready')

  inViewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        section.classList.add('in-view')
        inViewObserver?.disconnect()
        inViewObserver = null
      })
    },
    { threshold: 0.15 },
  )

  inViewObserver.observe(section)
})

onBeforeUnmount(() => {
  inViewObserver?.disconnect()
  inViewObserver = null
})
</script>

<template>
  <section
    v-if="hasContent"
    ref="sectionRef"
    class="page-section-quarters"
    aria-label="Quarters"
    :style="sectionStyle"
  >
    <div
      class="page-section-quarters__inner"
      :class="{ wrapper: useWrapper }"
    >
      <h2
        v-if="title"
        class="page-section-quarters__title serif"
      >
        {{ title }}
      </h2>

      <ul class="page-section-quarters__grid">
        <li
          v-for="(item, index) in items"
          :key="item._key"
          class="page-section-quarters__item"
          :style="{ '--item-index': index }"
        >
          <div class="page-section-quarters__media">
            <SectionLoopVideo
              v-if="item.kind === 'video'"
              :loop="item.loop"
              :title="item.alt"
              aspect-class="page-section-quarters__video"
              object-fit="cover"
            />
            <img
              v-else
              class="page-section-quarters__image"
              :src="item.imageUrl"
              :alt="item.alt"
              draggable="false"
              loading="lazy"
            >
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.page-section-quarters {
  --quarters-stagger: 0.35s;
  color: inherit;
}

.page-section-quarters__inner {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vw, 2rem);
}

.page-section-quarters__title {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  font-weight: 300;
  letter-spacing: 0.03em;
  text-align: center;
}

.page-section-quarters__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 700px) {
  .page-section-quarters__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.page-section-quarters__item {
  --item-index: 0;
  min-width: 0;
}

.page-section-quarters__media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.page-section-quarters__image,
.page-section-quarters :deep(.section-loop-video),
.page-section-quarters :deep(.section-loop-video__el) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-section-quarters.is-ready .page-section-quarters__item {
  opacity: 0;
  animation: none;
}

.page-section-quarters.is-ready.in-view .page-section-quarters__item {
  animation: page-section-quarters-show 0s forwards;
  animation-delay: calc(var(--item-index) * var(--quarters-stagger));
}

@keyframes page-section-quarters-show {
  to {
    opacity: 1;
  }
}
</style>
