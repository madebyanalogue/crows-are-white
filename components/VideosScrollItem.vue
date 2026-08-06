<template>
  <div
    class="videos-item"
    :data-index="index"
  >
    <CinematicVideoFrame
      ref="frameRef"
      :title="video.title"
      :runtime="displayRuntime"
      :provider="playerProvider"
      :video-src="videoUrl"
      :vimeo-id="vimeoId"
      :vimeo-url="video.vimeoUrl"
      :vimeo-hash="video.vimeoHash"
      :iframe-title="video.title"
      :interactable="interactable"
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
          data-p
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
  </div>
</template>

<script setup>
import { formatRuntime, parseVimeoData } from '~/utils/videoRuntime'
import { resolveLoopingThumbnailUrls } from '~/utils/cloudflareStream'

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
})

const emit = defineEmits(['runtime', 'playing', 'closed'])

const frameRef = ref(null)
const mediaRef = ref(null)
const playing = ref(false)

const localRuntime = ref(
  typeof props.video.runtimeSeconds === 'number' ? props.video.runtimeSeconds : null,
)

const sourceType = computed(() => props.video.sourceType || 'upload')
const videoUrl = computed(() => props.video.videoUrl || props.video.videoFile?.asset?.url || '')
const loopingThumbnail = computed(() => resolveLoopingThumbnailUrls(props.video))
const thumbnailLoop720Url = computed(() => loopingThumbnail.value.url720)
const thumbnailLoop1080Url = computed(() => {
  const { url720, url1080 } = loopingThumbnail.value
  return url1080 && url1080 !== url720 ? url1080 : ''
})
const hasLoopingThumbnail = computed(() => Boolean(loopingThumbnail.value.url))
const thumbnailImageUrl = computed(
  () => props.video.thumbnailImageUrl || props.video.thumbnailImage?.asset?.url || '',
)
const vimeoId = computed(() => {
  if (props.video.vimeoId) return props.video.vimeoId
  return parseVimeoData(props.video.vimeoUrl)?.id || null
})

const playerProvider = computed(() => {
  if (sourceType.value === 'vimeo' && vimeoId.value) return 'vimeo'
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

.videos-item :deep(.videos-item__frame) {
  width: var(--video-frame-width);
}

.videos-item__media {
  --videos-thumb-extra: 10%;
  position: absolute;
  left: 0;
  width: 100%;
  top: calc(var(--videos-thumb-extra) / -2);
  height: calc(100% + var(--videos-thumb-extra));
  will-change: transform;
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
</style>
