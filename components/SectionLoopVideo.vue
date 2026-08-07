<script setup>
import { getLoopVideoHeadLinks } from '~/utils/loopVideoPreload'

const emit = defineEmits(['mediaDimensions', 'ready'])

const props = defineProps({
  loop: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: 'Video loop',
  },
  aspectClass: {
    type: String,
    default: '',
  },
  priority: {
    type: Boolean,
    default: false,
  },
  mediaTransform: {
    type: String,
    default: '',
  },
  objectFit: {
    type: String,
    default: 'cover',
    validator: (value) => ['cover', 'contain'].includes(value),
  },
})

const videoRef = ref(null)
const videoReady = ref(false)
let revealFallbackTimer = null

const mediaStyle = computed(() => {
  const transform = props.mediaTransform?.trim()
  if (!transform) return undefined
  return { transform }
})

const playbackUrl = computed(() => props.loop?.url720 || props.loop?.url || '')
const posterUrl = computed(() => props.loop?.posterUrl || '')
const hasDesktopSource = computed(() =>
  props.priority
  && props.loop?.url1080
  && props.loop.url1080 !== props.loop?.url720,
)

useHead({
  link: computed(() => getLoopVideoHeadLinks(props.loop)),
})

function markVideoReady() {
  if (videoReady.value) return
  videoReady.value = true
  emit('ready')
}

function clearRevealFallback() {
  if (revealFallbackTimer != null) {
    clearTimeout(revealFallbackTimer)
    revealFallbackTimer = null
  }
}

function scheduleRevealFallback() {
  clearRevealFallback()
  revealFallbackTimer = window.setTimeout(markVideoReady, 1800)
}

function attemptPlay() {
  const el = videoRef.value
  if (!el) return

  const play = () => {
    const result = el.play()
    if (result?.catch) result.catch(() => {})
  }

  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    play()
    markVideoReady()
    return
  }

  el.addEventListener('loadeddata', play, { once: true })
}

function onVideoLoadedMetadata(event) {
  const video = event.target
  if (!video?.videoWidth || !video?.videoHeight) return
  emit('mediaDimensions', {
    width: video.videoWidth,
    height: video.videoHeight,
  })
}

function onVideoCanPlay(event) {
  markVideoReady()
  onVideoLoadedMetadata(event)
}

function onVideoPlaying() {
  markVideoReady()
}

function initNativeVideo() {
  if (!import.meta.client) return

  const el = videoRef.value
  if (!el) return

  el.load()
  attemptPlay()
  scheduleRevealFallback()
}

watch(playbackUrl, () => {
  videoReady.value = false
  clearRevealFallback()
  nextTick(() => initNativeVideo())
})

onMounted(() => {
  initNativeVideo()
})

onBeforeUnmount(() => {
  clearRevealFallback()
})
</script>

<template>
  <VideoLoopEmbed
    v-if="loop?.kind === 'youtube' && loop.youtubeId"
    :video-id="loop.youtubeId"
    :title="title"
    :aspect-class="aspectClass"
    :media-transform="mediaTransform"
  />
  <div
    v-else-if="playbackUrl"
    class="section-loop-video"
    :class="[aspectClass, { 'section-loop-video--priority': priority }]"
  >
    <img
      v-if="posterUrl && !videoReady"
      class="section-loop-video__poster"
      :src="posterUrl"
      alt=""
      aria-hidden="true"
    >

    <video
      ref="videoRef"
      class="section-loop-video__el"
      :class="{ 'is-ready': videoReady }"
      :style="mediaStyle"
      autoplay
      muted
      loop
      playsinline
      disablepictureinpicture
      disableremoteplayback
      preload="auto"
      :poster="posterUrl || undefined"
      :fetchpriority="priority ? 'high' : 'auto'"
      @canplay="onVideoCanPlay"
      @loadedmetadata="onVideoLoadedMetadata"
      @playing="onVideoPlaying"
    >
      <source
        v-if="hasDesktopSource"
        media="(min-width: 1000px)"
        :src="loop.url1080"
        type="video/mp4"
      >
      <source
        :src="playbackUrl"
        type="video/mp4"
      >
    </video>
  </div>
</template>

<style scoped>
.section-loop-video {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: #000;
}

.section-loop-video__poster {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: v-bind(objectFit);
}

.section-loop-video__el {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: v-bind(objectFit);
  opacity: 0;
  transition: opacity 0.35s ease;
  transform-origin: bottom;
}

.section-loop-video--priority .section-loop-video__el {
  transition-duration: 0.25s;
}

.section-loop-video__el.is-ready {
  opacity: 1;
}
</style>
