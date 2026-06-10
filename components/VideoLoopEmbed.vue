<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    videoId: string
    videoSrc?: string
    title?: string
    aspectClass?: string
  }>(),
  {
    title: 'Video loop',
    aspectClass: 'aspect-video',
  },
)

const mounted = ref(false)
const videoReady = ref(false)

onMounted(() => {
  mounted.value = true
})

const loopSrc = computed(() => {
  if (!mounted.value || props.videoSrc) return undefined

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: props.videoId,
    controls: '0',
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
    cc_load_policy: '0',
    showinfo: '0',
    autohide: '1',
    enablejsapi: '0',
  })

  if (import.meta.client) {
    params.set('origin', window.location.origin)
  }

  return `https://www.youtube-nocookie.com/embed/${props.videoId}?${params.toString()}`
})

function onIframeLoad() {
  // Fade in after autoplay has started so the YouTube play overlay is hidden
  setTimeout(() => {
    videoReady.value = true
  }, 600)
  // Fallback — reveal even if autoplay is delayed
  setTimeout(() => {
    videoReady.value = true
  }, 2000)
}

function onVideoPlaying() {
  videoReady.value = true
}
</script>

<template>
  <div
    class="video-loop relative w-full overflow-hidden bg-black pointer-events-none"
    :class="aspectClass"
  >
    <video
      v-if="videoSrc"
      class="video-loop__native absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
      :class="videoReady ? 'opacity-100' : 'opacity-0'"
      :src="videoSrc"
      autoplay
      muted
      loop
      playsinline
      disablepictureinpicture
      disableremoteplayback
      @playing="onVideoPlaying"
    />

    <iframe
      v-else-if="loopSrc"
      class="video-loop__iframe absolute left-1/2 top-1/2 border-0 transition-opacity duration-500"
      :class="videoReady ? 'opacity-100' : 'opacity-0'"
      :src="loopSrc"
      :title="title"
      tabindex="-1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      @load="onIframeLoad"
    />

    <template v-if="!videoSrc">
      <div class="video-loop__ui-mask-corner video-loop__ui-mask-corner--br" aria-hidden="true" />
      <div class="video-loop__ui-mask-corner video-loop__ui-mask-corner--bl" aria-hidden="true" />
    </template>
  </div>
</template>

<style scoped>
.video-loop__native,
.video-loop__iframe {
  pointer-events: none;
}

.video-loop__iframe {
  width: auto;
  height: auto;
  min-width: 100%;
  min-height: 100%;
  aspect-ratio: 16 / 9;
  transform: translate(-50%, -50%) scale(1.08);
}

/* Hide YouTube logo / watch-on-youtube chrome in corners */
.video-loop__ui-mask-corner {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  background: #000;
}

.video-loop__ui-mask-corner--br {
  right: 0;
  bottom: 0;
  width: 7rem;
  height: 3.5rem;
}

.video-loop__ui-mask-corner--bl {
  left: 0;
  bottom: 0;
  width: 5rem;
  height: 2.5rem;
}
</style>
