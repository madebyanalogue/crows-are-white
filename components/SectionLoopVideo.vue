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
})

const videoReady = ref(false)

function onVideoPlaying() {
  videoReady.value = true
}
</script>

<template>
  <VideoLoopEmbed
    v-if="loop?.kind === 'youtube' && loop.youtubeId"
    :video-id="loop.youtubeId"
    :title="title"
    :aspect-class="aspectClass"
  />
  <div
    v-else-if="loop?.url || loop?.url720"
    class="section-loop-video"
    :class="aspectClass"
  >
    <video
      class="section-loop-video__el"
      :class="{ 'is-ready': videoReady }"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      @playing="onVideoPlaying"
    >
      <source
        v-if="loop.url1080 && loop.url1080 !== loop.url720"
        media="(min-width: 1000px)"
        :src="loop.url1080"
        type="video/mp4"
      >
      <source
        :src="loop.url720 || loop.url"
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
  transition: opacity 0.5s ease;
}

.section-loop-video__el.is-ready {
  opacity: 1;
}
</style>
