<script setup>
import { resolveLoopingThumbnailUrls } from '~/utils/cloudflareStream'
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { toCssColor, resolvePageTextColor, DEFAULT_PAGE_COLOR } from '~/utils/pageColors'
import { formatRuntime, parseVimeoData, parseYoutubeId } from '~/utils/videoRuntime'

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
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') return value
  if (value === false) return 'none'
  return 'large'
}

const title = computed(() => props.section?.trailerTitle?.trim() || 'Watch Trailer')

const boldTypography = computed(() => props.section?.trailerBoldTypography === true)

const overlayColor = computed(() => {
  const { trailerTextColor, trailerBackgroundColor } = props.section || {}
  if (!trailerTextColor && !trailerBackgroundColor) return ''
  const resolved = resolvePageTextColor(trailerTextColor, trailerBackgroundColor)
  return toCssColor(resolved, 'fuji')
})

const runtimeLabel = computed(() => {
  const seconds = props.section?.trailerRuntimeSeconds
  return typeof seconds === 'number' ? formatRuntime(seconds) : ''
})

const thumbnailPayload = computed(() => ({
  thumbnailType: props.section?.trailerThumbnailType || 'image',
  thumbnailVideoSource: props.section?.trailerThumbnailVideoSource || null,
  thumbnailLoopCloudflare720: props.section?.trailerThumbnailLoopCloudflare720 || '',
  thumbnailLoopCloudflare1080: props.section?.trailerThumbnailLoopCloudflare1080 || '',
  thumbnailVideoUrl: resolveSanityAssetUrl(props.section?.trailerThumbnailVideo?.asset) || '',
  thumbnailImageUrl: resolveSanityAssetUrl(props.section?.trailerThumbnailImage?.asset) || '',
}))

const loopingThumbnail = computed(() => resolveLoopingThumbnailUrls(thumbnailPayload.value))
const thumbnailLoop720Url = computed(() => loopingThumbnail.value.url720)
const thumbnailLoop1080Url = computed(() => {
  const { url720, url1080 } = loopingThumbnail.value
  return url1080 && url1080 !== url720 ? url1080 : ''
})
const hasLoopingThumbnail = computed(
  () => props.section?.trailerThumbnailType === 'video' && Boolean(loopingThumbnail.value.url),
)
const thumbnailImageUrl = computed(() => {
  if (props.section?.trailerThumbnailType !== 'image') return ''
  return thumbnailPayload.value.thumbnailImageUrl
})

const sourceType = computed(() => props.section?.trailerSourceType || 'youtube')
const videoUrl = computed(() => resolveSanityAssetUrl(props.section?.trailerVideoFile?.asset) || '')
const vimeoData = computed(() => {
  if (sourceType.value !== 'vimeo') return null
  return parseVimeoData(props.section?.trailerVideoUrl || '')
})
const youtubeId = computed(() => {
  if (sourceType.value !== 'youtube') return ''
  return parseYoutubeId(props.section?.trailerVideoUrl || '') || ''
})

const playerProvider = computed(() => {
  if (sourceType.value === 'vimeo' && vimeoData.value?.id) return 'vimeo'
  if (sourceType.value === 'youtube' && youtubeId.value) return 'youtube'
  if (sourceType.value === 'upload' && videoUrl.value) return 'native'
  return 'youtube'
})

const sectionStyle = computed(() => {
  const style = {}
  const backgroundColor = props.section?.trailerBackgroundColor
  if (backgroundColor) {
    style.background = toCssColor(backgroundColor, DEFAULT_PAGE_COLOR)
  }
  style.paddingTop = SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.trailerPaddingTop)]
  style.paddingBottom = SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.trailerPaddingBottom)]
  return style
})

const notchMaskColor = computed(() => {
  const backgroundColor = props.section?.trailerBackgroundColor
  if (!backgroundColor) return ''
  return toCssColor(backgroundColor, DEFAULT_PAGE_COLOR)
})

const localRuntime = ref(
  typeof props.section?.trailerRuntimeSeconds === 'number'
    ? props.section.trailerRuntimeSeconds
    : null,
)

function setRuntimeFromSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return
  localRuntime.value = Math.round(seconds)
}

const displayRuntime = computed(() => formatRuntime(localRuntime.value) || runtimeLabel.value)

watch(
  () => props.section?.trailerRuntimeSeconds,
  (value) => {
    if (typeof value === 'number') localRuntime.value = value
  },
)

const frameRef = ref(null)
const { $lenis } = useNuxtApp()
const { scrollElementIntoView } = useMenuLinks()
const { register, unregister } = useTrailerPlayer()

const trailerApi = {
  open: () => frameRef.value?.open?.(),
  close: () => frameRef.value?.close?.(),
}

function stopLenis() {
  try {
    $lenis?.stop?.()
  } catch {
    // ignore
  }
}

function startLenis() {
  try {
    $lenis?.start?.()
  } catch {
    // ignore
  }
}

function scrollTrailerIntoView() {
  const root = frameRef.value?.$el
  const stage = root?.querySelector?.('.cinematic-video-frame__stage')
  if (stage) {
    scrollElementIntoView(stage, { smooth: true, align: 'center' })
    return
  }

  const section = document.getElementById('trailer')
  if (section) scrollElementIntoView(section, { smooth: true, align: 'center' })
}

async function beforeOpen() {
  scrollTrailerIntoView()
  await new Promise((resolve) => setTimeout(resolve, 450))
  stopLenis()
}

function onClose() {
  startLenis()
}

onMounted(() => {
  register(trailerApi)
})

onBeforeUnmount(() => {
  unregister(trailerApi)
  startLenis()
})
</script>

<template>
  <section
    id="trailer"
    class="page-section-trailer"
    data-trailer-section
    :style="sectionStyle"
  >
    <div class="page-section-columns wrapper">
      <CinematicVideoFrame
        ref="frameRef"
        notch-corners
        :notch-mask-color="notchMaskColor"
        :title="title"
        :runtime="displayRuntime"
        :overlay-color="overlayColor"
        :overlay-bold-typography="boldTypography"
        :overlay-show-runtime="!boldTypography"
        :provider="playerProvider"
        :video-src="videoUrl"
        :youtube-id="youtubeId"
        :vimeo-id="vimeoData?.id || ''"
        :vimeo-url="section.trailerVideoUrl || ''"
        :vimeo-hash="vimeoData?.hash || null"
        :iframe-title="title"
        frame-class="page-section-trailer__frame"
        show-fullscreen
        :scroll-scale="section.trailerScrollScale !== false"
        close-on-darken
        :before-open="beforeOpen"
        :on-close="onClose"
        :on-duration="setRuntimeFromSeconds"
      >
        <template #thumbnail>
          <video
            v-if="hasLoopingThumbnail"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
          >
            <source
              v-if="thumbnailLoop1080Url"
              media="(min-width: 1000px)"
              :src="thumbnailLoop1080Url"
              type="video/mp4"
            >
            <source
              v-if="thumbnailLoop720Url"
              :src="thumbnailLoop720Url"
              type="video/mp4"
            >
          </video>
          <img
            v-else-if="thumbnailImageUrl"
            :src="thumbnailImageUrl"
            :alt="title"
            draggable="false"
          >
          <div
            v-else
            class="page-section-trailer__fallback"
            aria-hidden="true"
          />
        </template>
      </CinematicVideoFrame>
    </div>
  </section>
</template>

<style scoped>
.page-section-trailer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: visible;
}

.page-section-trailer:has(.is-open) {
  z-index: var(--z-cinematic-video);
}

.page-section-trailer :deep(.page-section-trailer__frame) {
  width: 100%;
  max-width: 2200px;
  margin-inline: auto;
}

.page-section-trailer__fallback {
  position: absolute;
  inset: 0;
  background: #8e968d;
}
</style>
