<template>
  <div class="video" :class="{ 'video--hero': hero }">
    <div ref="parallaxRef" class="video__parallax">
      <video
        v-if="src"
        ref="mediaRef"
        class="video__media"
        :src="src"
        autoplay
        muted
        loop
        playsinline
        disablepictureinpicture
        preload="auto"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  src: {
    type: String,
    default: '',
  },
  hero: {
    type: Boolean,
    default: false,
  },
})

const mediaRef = ref(null)
const parallaxRef = ref(null)

function attemptPlay() {
  const el = mediaRef.value
  if (!el) return

  const play = () => {
    const result = el.play()
    if (result?.catch) result.catch(() => {})
  }

  if (el.readyState >= 2) {
    play()
  } else {
    el.addEventListener('loadeddata', play, { once: true })
  }
}

onMounted(() => {
  nextTick(attemptPlay)
})

defineExpose({
  mediaRef,
  parallaxRef,
})
</script>

<style scoped>
.video {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: var(--obsidian);
}

.video__parallax {
  width: 100%;
  height: 100%;
  will-change: transform;
}

.video__media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
