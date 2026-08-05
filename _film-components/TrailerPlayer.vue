<script setup lang="ts">
import Plyr from 'plyr'

const props = defineProps<{
  videoId: string
}>()

const container = ref<HTMLElement | null>(null)
let player: Plyr | null = null

onMounted(() => {
  if (!container.value || !import.meta.client) return

  const origin = window.location.origin
  const iframe = container.value.querySelector('iframe')
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${props.videoId}?autoplay=1&origin=${encodeURIComponent(origin)}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`
  }

  player = new Plyr(container.value, {
    autoplay: true,
    clickToPlay: true,
    hideControls: true,
    resetOnEnd: false,
    controls: ['play', 'progress', 'fullscreen'],
    youtube: {
      noCookie: true,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1,
    },
  })

  player.play().catch(() => {})
})

onBeforeUnmount(() => {
  player?.destroy()
  player = null
})
</script>

<template>
  <div ref="container" class="plyr__video-embed trailer-player aspect-video w-full bg-black">
    <iframe
      title="Crows Are White — Official Trailer"
      allowfullscreen
      allow="autoplay; encrypted-media; picture-in-picture"
    />
  </div>
</template>
