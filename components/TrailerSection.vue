<script setup>
const props = defineProps({
  videoId: {
    type: String,
    default: '',
  },
  videoSrc: {
    type: String,
    default: '',
  },
  posterSrc: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Watch Trailer',
  },
})

const { film } = useSiteContent()
const { $lenis } = useNuxtApp()
const { register, unregister } = useTrailerPlayer()

const frameRef = ref(null)

const trailerId = computed(() => props.videoId || film.value?.trailerId || '')
const trailerSrc = computed(
  () => props.videoSrc || film.value?.trailerSrc || '',
)
const posterUrl = computed(() => {
  if (props.posterSrc) return props.posterSrc
  if (film.value?.trailerPoster) return film.value.trailerPoster
  if (trailerId.value) {
    return `https://i.ytimg.com/vi/${trailerId.value}/maxresdefault.jpg`
  }
  return ''
})
const useNativeVideo = computed(() => Boolean(trailerSrc.value))
const playerProvider = computed(() => (useNativeVideo.value ? 'native' : 'youtube'))

const api = {
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

function scrollStageIntoView() {
  const el = frameRef.value?.$el || frameRef.value?.thumbnailRef?.value
  const stage = el?.querySelector?.('.cinematic-video-frame__stage') || el
  if (!stage) return

  const rect = stage.getBoundingClientRect()
  const target =
    window.scrollY + rect.top - (window.innerHeight / 2 - rect.height / 2)

  if ($lenis?.scrollTo) {
    $lenis.scrollTo(target, { duration: 0.8 })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
}

async function beforeOpen() {
  scrollStageIntoView()
  setTimeout(() => stopLenis(), 500)
}

function onClose() {
  startLenis()
}

onMounted(() => {
  register(api)
})

onBeforeUnmount(() => {
  unregister(api)
  startLenis()
})

defineExpose(api)
</script>

<template>
  <section
    id="trailer"
    class="trailer-section"
    data-trailer-section
  >
    <CinematicVideoFrame
      ref="frameRef"
      notch-corners
      :title="label"
      :provider="playerProvider"
      :video-src="trailerSrc"
      :youtube-id="trailerId"
      :poster-url="posterUrl"
      iframe-title="Crows Are White — Official Trailer"
      frame-class="trailer-section__frame"
      show-fullscreen
      show-close
      close-on-darken
      close-on-escape
      scroll-scale
      :before-open="beforeOpen"
      :on-close="onClose"
    />
  </section>
</template>

<style scoped>
.trailer-section {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 4vw, 2.5rem);
  background: var(--crema, #f0f0ed);
  overflow: visible;
}

.trailer-section:has(.is-open) {
  z-index: var(--z-cinematic-video);
}

.trailer-section :deep(.trailer-section__frame) {
  width: 90%;
}

@media (max-width: 767px) {
  .trailer-section {
    padding-inline: 0.75rem;
  }
}
</style>
