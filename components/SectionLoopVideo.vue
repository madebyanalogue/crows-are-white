<script setup>
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
})

const videoRef = ref(null)
const videoReady = ref(false)

const mediaStyle = computed(() => {
  const transform = props.mediaTransform?.trim()
  if (!transform) return undefined
  return { transform }
})

const playbackUrl = computed(() => props.loop?.url720 || props.loop?.url || '')
const posterUrl = computed(() => props.loop?.posterUrl || '')
const preloadMode = computed(() => (props.priority ? 'auto' : 'metadata'))
const hasDesktopSource = computed(() =>
  !props.priority
  && props.loop?.url1080
  && props.loop.url1080 !== props.loop?.url720,
)

function markVideoReady() {
  videoReady.value = true
}

function onVideoCanPlay() {
  markVideoReady()
}

function onVideoPlaying() {
  markVideoReady()
}

onMounted(() => {
  if (!props.priority || !import.meta.client) return

  const el = videoRef.value
  if (!el) return

  el.load()

  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    markVideoReady()
  }
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
      :preload="preloadMode"
      :poster="posterUrl || undefined"
      :fetchpriority="priority ? 'high' : 'auto'"
      @canplay="onVideoCanPlay"
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

.section-loop-video__el {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
