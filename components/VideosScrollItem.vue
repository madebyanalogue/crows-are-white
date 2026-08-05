<template>
  <div
    class="videos-item"
    :data-index="index"
  >
    <div
      ref="frameRef"
      class="videos-item__frame"
      :class="{ 'is-playing': isPlaying }"
    >
      <button
        v-if="!isPlaying"
        type="button"
        class="videos-item__hit"
        :aria-label="`Play ${video.title}`"
        @click="onHitClick"
      />

      <div
        ref="mediaRef"
        class="videos-item__media"
        data-p
      >
        <video
          v-if="thumbnailVideoUrl && !hideThumbnail"
          class="videos-item__thumb-video"
          :src="thumbnailVideoUrl"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
        />
        <img
          v-else-if="thumbnailImageUrl && !hideThumbnail"
          class="videos-item__thumb-image"
          :src="thumbnailImageUrl"
          :alt="video.title"
          draggable="false"
        >
        <div
          v-else-if="!hideThumbnail"
          class="videos-item__thumb-fallback"
          aria-hidden="true"
        />
      </div>

      <div
        ref="overlayRef"
        class="videos-item__overlay"
      >
        <p class="videos-item__title serif">
          {{ video.title }}
        </p>
        <span
          class="videos-item__play"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 14.5v19l16-9.5-16-9.5z"
              stroke="currentColor"
              stroke-width=".7"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <p class="videos-item__runtime serif">
          {{ displayRuntime }}
        </p>
      </div>

      <div
        ref="playerWrapRef"
        class="videos-item__player"
        :class="{ 'is-active': isPlaying }"
      >
        <div
          v-if="isPlaying && sourceType === 'upload' && videoUrl"
          ref="plyrHostRef"
          class="videos-item__plyr videos-player"
        >
          <video
            class="videos-item__native"
            :src="videoUrl"
            playsinline
            preload="auto"
          />
        </div>
        <div
          v-else-if="isPlaying && sourceType === 'vimeo' && vimeoId"
          ref="plyrHostRef"
          class="videos-item__plyr videos-player plyr__video-embed"
          data-plyr-provider="vimeo"
          :data-plyr-embed-id="vimeoId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
import { formatRuntime, parseVimeoData } from '~/utils/videoRuntime'

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

const emit = defineEmits(['runtime', 'playing'])

const frameRef = ref(null)
const mediaRef = ref(null)
const overlayRef = ref(null)
const playerWrapRef = ref(null)
const plyrHostRef = ref(null)

const isPlaying = ref(false)
const hideThumbnail = ref(false)
const localRuntime = ref(
  typeof props.video.runtimeSeconds === 'number' ? props.video.runtimeSeconds : null,
)

const sourceType = computed(() => props.video.sourceType || 'upload')
const videoUrl = computed(() => props.video.videoUrl || props.video.videoFile?.asset?.url || '')
const thumbnailVideoUrl = computed(
  () => props.video.thumbnailVideoUrl || props.video.thumbnailVideo?.asset?.url || '',
)
const thumbnailImageUrl = computed(
  () => props.video.thumbnailImageUrl || props.video.thumbnailImage?.asset?.url || '',
)
const vimeoId = computed(() => {
  if (props.video.vimeoId) return props.video.vimeoId
  return parseVimeoData(props.video.vimeoUrl)?.id || null
})

const displayRuntime = computed(() => formatRuntime(localRuntime.value))

let player = null
let playToken = 0

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
  if (localRuntime.value != null || sourceType.value !== 'upload' || !videoUrl.value) return

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

function destroyPlayer() {
  if (player) {
    try {
      player.destroy()
    } catch {
      // already destroyed
    }
    player = null
  }
}

async function initPlayer() {
  destroyPlayer()
  const host = plyrHostRef.value
  if (!host || !import.meta.client) return null

  const { default: Plyr } = await import('plyr')

  player = new Plyr(host, {
    autoplay: true,
    clickToPlay: true,
    hideControls: false,
    resetOnEnd: false,
    controls: [
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'fullscreen',
    ],
    vimeo: {
      byline: false,
      portrait: false,
      title: false,
      dnt: true,
    },
  })

  const controls = host.querySelector('.plyr__controls')
  if (controls) gsap.set(controls, { opacity: 0 })
  const overlaid = host.querySelector('.plyr__control--overlaid')
  if (overlaid) gsap.set(overlaid, { opacity: 0 })

  player.on('loadedmetadata', () => {
    setRuntimeFromSeconds(player.duration)
  })

  player.on('ready', () => {
    setRuntimeFromSeconds(player.duration)
    player.play()?.catch?.(() => {})
  })

  return host
}

async function fadeTo(target, vars) {
  if (!target) return
  await new Promise((resolve) => {
    gsap.to(target, {
      ...vars,
      onComplete: resolve,
    })
  })
}

function onHitClick() {
  if (!props.interactable) return
  play()
}

async function play() {
  if (isPlaying.value || !props.interactable) return
  const token = ++playToken
  emit('playing', props.index)

  const overlay = overlayRef.value
  const media = mediaRef.value
  const playerWrap = playerWrapRef.value
  if (!overlay || !media || !playerWrap) return

  // 1) Fade out title / runtime / play icon
  await fadeTo(overlay, { opacity: 0, duration: 0.35, ease: 'power2.out' })
  if (token !== playToken) return

  // Mount player under the thumbnail, still invisible
  isPlaying.value = true
  await nextTick()
  if (token !== playToken) return

  const host = await initPlayer()
  if (token !== playToken) return
  gsap.set(playerWrap, { opacity: 1 })
  if (host) gsap.set(host, { opacity: 0 })

  // 2) Fade out thumbnail
  await fadeTo(media, { opacity: 0, duration: 0.4, ease: 'power2.out' })
  if (token !== playToken) return
  hideThumbnail.value = true

  // 3) Fade in playing video
  if (host) {
    await fadeTo(host, { opacity: 1, duration: 0.45, ease: 'power2.out' })
  }
  if (token !== playToken) return

  // 4) Fade in controls
  const controls = host?.querySelector('.plyr__controls')
  if (controls) {
    await fadeTo(controls, { opacity: 1, duration: 0.4, ease: 'power2.out' })
  }
}

function stop() {
  playToken += 1
  destroyPlayer()
  isPlaying.value = false
  hideThumbnail.value = false

  nextTick(() => {
    const overlay = overlayRef.value
    const media = mediaRef.value
    const playerWrap = playerWrapRef.value
    if (overlay) gsap.set(overlay, { clearProps: 'opacity' })
    if (media) gsap.set(media, { clearProps: 'opacity' })
    if (playerWrap) gsap.set(playerWrap, { clearProps: 'opacity' })
  })
}

defineExpose({ stop, play, mediaRef, isPlaying })

onMounted(() => {
  ensureMp4Runtime()
})

onBeforeUnmount(() => {
  playToken += 1
  destroyPlayer()
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

.videos-item__frame {
  position: relative;
 
  aspect-ratio: 16 / 9;
  overflow: hidden;
  width: var(--video-frame-width);
}


.videos-item__hit {
  position: absolute;
  inset: 0;
  z-index: 4;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.videos-item__media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 110%;
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

.videos-item__overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 5%;
  pointer-events: none;
  color: var(--background-color);
}

.videos-item__title,
.videos-item__runtime {
  margin: 0;
  font-size: clamp(20px, 2vw, 100px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.1;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.25);
}

.videos-item__title {
  justify-self: start;
  text-align: left;
  max-width: 18ch;
}

.videos-item__runtime {
  justify-self: end;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.videos-item__play {
  justify-self: center;
  display: grid;
  place-items: center;
  width: clamp(42px, 12vw, 155px);
  height: clamp(42px, 12vw, 155px);
  color: var(--background-color);
}

.videos-item__play svg {
  width: 100%;
  height: 100%;
}

.videos-item__player {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
}

.videos-item__player.is-active {
  pointer-events: auto;
}

.videos-item__plyr,
.videos-item__native {
  width: 100%;
  height: 100%;
}

.videos-item__plyr :deep(.plyr),
.videos-item__plyr :deep(.plyr__video-wrapper),
.videos-item__plyr :deep(.plyr__video-embed),
.videos-item__plyr :deep(video),
.videos-item__plyr :deep(iframe) {
  width: 100%;
  height: 100%;
}

.videos-item__plyr :deep(.plyr) {
  --plyr-color-main: #ffffff;
  --plyr-video-control-color: #ffffff;
  --plyr-video-control-color-hover: #ffffff;
  --plyr-video-control-background-hover: rgba(255, 255, 255, 0.12);
  --plyr-range-fill-background: #ffffff;
  --plyr-range-track-background: rgba(255, 255, 255, 0.28);
  --plyr-range-thumb-background: #ffffff;
  --plyr-font-family: var(--serif);
  height: 100%;
}

.videos-item__plyr :deep(.plyr__controls) {
  opacity: 0;
}

.videos-item__plyr :deep(.plyr__control--overlaid) {
  display: none;
}

@media (max-width: 699px) {
  .videos-item__title,
  .videos-item__runtime {
    max-width: 12ch;
  }
}
</style>
