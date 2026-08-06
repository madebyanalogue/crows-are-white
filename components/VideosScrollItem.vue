<template>
  <div
    class="videos-item"
    :class="{ 'videos-item--stack': layout === 'stack' }"
    :data-index="index"
  >
    <CinematicVideoFrame
      ref="frameRef"
      :title="video.title"
      :runtime="layout === 'stack' ? '' : displayRuntime"
      :provider="playerProvider"
      :video-src="videoUrl"
      :vimeo-id="vimeoId"
      :vimeo-url="video.vimeoUrl"
      :vimeo-hash="video.vimeoHash"
      :iframe-title="video.title"
      :interactable="interactable"
      :overlay-show-title="layout !== 'stack'"
      :overlay-show-runtime="layout !== 'stack'"
      show-close
      close-on-darken
      close-on-escape
      frame-class="videos-item__frame"
      :on-duration="setRuntimeFromSeconds"
      @playing="onPlaying"
      @close="onClose"
    >
      <template #thumbnail>
        <div
          ref="mediaRef"
          class="videos-item__media"
        >
          <video
            v-if="hasLoopingThumbnail"
            class="videos-item__thumb-video"
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
            class="videos-item__thumb-image"
            :src="thumbnailImageUrl"
            :alt="video.title"
            draggable="false"
          >
          <div
            v-else
            class="videos-item__thumb-fallback"
            aria-hidden="true"
          />
        </div>
      </template>
    </CinematicVideoFrame>

    <p
      v-if="layout === 'stack'"
      class="videos-item__stack-title serif"
    >
      {{ video.title }}
    </p>
  </div>
</template>

<script setup>
import { formatRuntime, parseVimeoData } from '~/utils/videoRuntime'
import { cloudflareStreamMp4Url, resolveLoopingThumbnailUrls } from '~/utils/cloudflareStream'

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  interactable: {
    type: Boolean,
    default: true,
  },
  layout: {
    type: String,
    default: 'slider',
    validator: (value) => ['slider', 'stack'].includes(value),
  },
})

const emit = defineEmits(['runtime', 'playing', 'closed'])

const frameRef = ref(null)
const mediaRef = ref(null)
const playing = ref(false)

const localRuntime = ref(
  typeof props.video.runtimeSeconds === 'number' ? props.video.runtimeSeconds : null,
)

const sourceType = computed(() => props.video.sourceType || 'upload')
const videoUrl = computed(() => {
  if (sourceType.value === 'vimeo') return ''
  if (sourceType.value === 'cloudflare') {
    return props.video.videoUrl
      || cloudflareStreamMp4Url(props.video.cloudflareUrl)
      || ''
  }
  return props.video.videoUrl || props.video.videoFile?.asset?.url || ''
})
const thumbnailType = computed(() => props.video.thumbnailType || 'image')
const loopingThumbnail = computed(() => resolveLoopingThumbnailUrls(props.video))
const thumbnailLoop720Url = computed(() => loopingThumbnail.value.url720)
const thumbnailLoop1080Url = computed(() => {
  const { url720, url1080 } = loopingThumbnail.value
  return url1080 && url1080 !== url720 ? url1080 : ''
})
const hasLoopingThumbnail = computed(
  () => thumbnailType.value === 'video' && Boolean(loopingThumbnail.value.url),
)
const thumbnailImageUrl = computed(() => {
  if (thumbnailType.value !== 'image') return ''
  return props.video.thumbnailImageUrl || props.video.thumbnailImage?.asset?.url || ''
})
const vimeoId = computed(() => {
  if (props.video.vimeoId) return props.video.vimeoId
  return parseVimeoData(props.video.vimeoUrl)?.id || null
})

const playerProvider = computed(() => {
  if (sourceType.value === 'vimeo' && vimeoId.value) return 'vimeo'
  if (videoUrl.value) return 'native'
  if (vimeoId.value) return 'vimeo'
  return 'native'
})

const displayRuntime = computed(() => formatRuntime(localRuntime.value))

watch(
  () => props.video.runtimeSeconds,
  (value) => {
    if (typeof value === 'number') localRuntime.value = value
  },
)

function setRuntimeFromSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return
  const rounded = Math.round(seconds)
  if (localRuntime.value === rounded) return
  localRuntime.value = rounded
  emit('runtime', { index: props.index, runtimeSeconds: rounded })
}

async function ensureMp4Runtime() {
  if (localRuntime.value != null || playerProvider.value !== 'native' || !videoUrl.value) return

  await new Promise((resolve) => {
    const el = document.createElement('video')
    el.preload = 'metadata'
    el.muted = true
    el.playsInline = true
    const cleanup = () => {
      el.removeAttribute('src')
      el.load()
      resolve()
    }
    el.addEventListener('loadedmetadata', () => {
      setRuntimeFromSeconds(el.duration)
      cleanup()
    }, { once: true })
    el.addEventListener('error', cleanup, { once: true })
    el.src = videoUrl.value
  })
}

function onPlaying() {
  playing.value = true
  emit('playing', props.index)
}

function onClose() {
  playing.value = false
  emit('closed', props.index)
}

function stop() {
  frameRef.value?.stop?.()
  playing.value = false
}

function play() {
  frameRef.value?.open?.()
}

const isPlaying = computed(() => playing.value)

defineExpose({ stop, play, mediaRef, isPlaying })

onMounted(() => {
  ensureMp4Runtime()
})
</script>

<style scoped>
.videos-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto;
  box-sizing: border-box;
}

.videos-item--stack {
  flex-direction: column;
  align-items: stretch;
}

.videos-item :deep(.videos-item__frame) {
  width: var(--video-frame-width);
}

.videos-item--stack :deep(.videos-item__frame) {
  width: 100%;
}

.videos-item__media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.videos-item--stack .videos-item__media {
  position: absolute;
  inset: 0;
}

.videos-item__thumb-image,
.videos-item__thumb-video,
.videos-item__thumb-fallback {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.videos-item__thumb-fallback {
  background: #8e968d;
}

.videos-item__stack-title {
  margin: 1.2em 0;
  padding: 0;
  color: var(--text-color);
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.15;
  text-align: left;
  text-transform: uppercase;
}
</style>
