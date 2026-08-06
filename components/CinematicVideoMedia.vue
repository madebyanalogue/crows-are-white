<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  provider: {
    type: String,
    default: 'native',
  },
  videoSrc: {
    type: String,
    default: '',
  },
  iframeTitle: {
    type: String,
    default: 'Video',
  },
  shellClass: {
    type: String,
    default: '',
  },
  plyrClass: {
    type: String,
    default: '',
  },
})

const videoElRef = ref(null)
const plyrHostRef = ref(null)
const videoShellRef = ref(null)
const plyrShellRef = ref(null)

defineExpose({
  videoElRef,
  plyrHostRef,
  videoShellRef,
  plyrShellRef,
})
</script>

<template>
  <div class="cinematic-video-media">
    <div
      ref="videoShellRef"
      class="cinematic-video-media__shell"
      :class="shellClass"
    >
      <video
        v-if="provider === 'native' && videoSrc"
        v-show="active"
        ref="videoElRef"
        class="cinematic-video-media__video"
        :src="videoSrc"
        playsinline
        preload="auto"
      />
    </div>
    <div
      v-if="provider !== 'native'"
      v-show="active"
      ref="plyrShellRef"
      class="cinematic-video-media__shell"
      :class="shellClass"
    >
      <div
        ref="plyrHostRef"
        class="cinematic-video-media__plyr plyr__video-embed trailer-player"
        :class="plyrClass"
      >
        <iframe
          :title="iframeTitle"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cinematic-video-media {
  position: absolute;
  inset: 0;
  background: #000;
}

.cinematic-video-media__shell {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0;
  visibility: hidden;
}

.cinematic-video-media__video,
.cinematic-video-media__plyr {
  width: 100%;
  height: 100%;
  background: #000;
}

.cinematic-video-media__video {
  object-fit: cover;
  display: block;
}

.cinematic-video-media__plyr :deep(.plyr),
.cinematic-video-media__plyr :deep(.plyr__video-wrapper),
.cinematic-video-media__plyr :deep(.plyr__video-embed),
.cinematic-video-media__plyr :deep(iframe),
.cinematic-video-media__plyr :deep(video) {
  width: 100%;
  height: 100%;
}

.cinematic-video-media__shell,
.cinematic-video-media__plyr :deep(.plyr),
.cinematic-video-media__plyr :deep(iframe) {
  pointer-events: none;
}

.cinematic-video-media__plyr :deep(.plyr__controls),
.cinematic-video-media__plyr :deep(.plyr__control--overlaid),
.cinematic-video-media__plyr :deep(.plyr__poster) {
  display: none !important;
  opacity: 0 !important;
}
</style>
