<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  runtime: {
    type: String,
    default: '',
  },
  provider: {
    type: String,
    default: 'native',
  },
  videoSrc: {
    type: String,
    default: '',
  },
  youtubeId: {
    type: String,
    default: '',
  },
  vimeoId: {
    type: String,
    default: '',
  },
  vimeoUrl: {
    type: String,
    default: '',
  },
  vimeoHash: {
    type: String,
    default: null,
  },
  iframeTitle: {
    type: String,
    default: 'Video',
  },
  posterUrl: {
    type: String,
    default: '',
  },
  interactable: {
    type: Boolean,
    default: true,
  },
  showOverlay: {
    type: Boolean,
    default: true,
  },
  overlayShowTitle: {
    type: Boolean,
    default: true,
  },
  overlayShowRuntime: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: false,
  },
  closeOnDarken: {
    type: Boolean,
    default: true,
  },
  closeOnEscape: {
    type: Boolean,
    default: false,
  },
  scrollScale: {
    type: Boolean,
    default: false,
  },
  overlayColor: {
    type: String,
    default: '',
  },
  frameClass: {
    type: String,
    default: '',
  },
  onDuration: {
    type: Function,
    default: null,
  },
  beforeOpen: {
    type: Function,
    default: null,
  },
  onOpen: {
    type: Function,
    default: null,
  },
  onClose: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['playing', 'runtime', 'close'])

const stageRef = ref(null)
const thumbnailRef = ref(null)
const thumbnailInnerRef = ref(null)
const overlayRef = ref(null)
const dialogRef = ref(null)
const darkenRef = ref(null)
const closeRef = ref(null)
const mediaComponentRef = ref(null)
const controlsRef = ref(null)

const canPlay = computed(() => {
  if (props.provider === 'vimeo') return Boolean(props.vimeoId || props.vimeoUrl)
  if (props.provider === 'youtube') return Boolean(props.youtubeId)
  return Boolean(props.videoSrc)
})

const overlayStyle = computed(() => {
  if (!props.overlayColor) return undefined
  return { '--background-color': props.overlayColor, color: props.overlayColor }
})

let scaleProxy = { value: 0 }
let scrollTrigger = null

const experience = useCinematicVideoExperience(
  () => ({
    provider: props.provider,
    videoSrc: props.videoSrc,
    youtubeId: props.youtubeId,
    vimeoId: props.vimeoId,
    vimeoUrl: props.vimeoUrl,
    vimeoHash: props.vimeoHash,
    iframeTitle: props.iframeTitle,
    onDuration: (seconds) => {
      props.onDuration?.(seconds)
      emit('runtime', seconds)
    },
  }),
  {
    mediaComponentRef,
    controlsRef,
    overlayRef,
    thumbnailRef,
    dialogRef,
    darkenRef,
    closeRef,
  },
  {
    canOpen: () => props.interactable && canPlay.value,
    beforeOpen: () => props.beforeOpen?.(),
    onOpen: () => {
      emit('playing')
      props.onOpen?.()
    },
    onClose: () => {
      emit('close')
      props.onClose?.()
    },
    extendOpenTimeline: (tl) => {
      if (!props.scrollScale) return
      tl.to(scaleProxy, { value: 1, duration: 0.7, onUpdate: applyScale }, 0)
    },
    extendCloseTimeline: (tl) => {
      if (!props.scrollScale) return
      tl.to(scaleProxy, { value: 0, duration: 0.55, onUpdate: applyScale }, 0)
    },
  },
)

const {
  isOpen,
  playerReady,
  isPlaying,
  isMuted,
  currentLabel,
  totalLabel,
  progressPct,
  open,
  close,
  stop,
  togglePlay,
  toggleSound,
  seekFromEvent,
  onScrubDown,
  setupInitialState,
  onDialogEnter,
  onDialogLeave,
} = experience

function onHitClick() {
  if (!props.interactable || !canPlay.value) return
  open()
}

function onDarkenClick() {
  if (!props.closeOnDarken || !isOpen.value) return
  close()
}

function onKeydown(event) {
  if (props.closeOnEscape && event.key === 'Escape' && isOpen.value) close()
}

function applyScale() {
  if (!props.scrollScale) return
  const poster = thumbnailRef.value
  const img = thumbnailInnerRef.value
  if (!poster || !img) return

  const openScale = scaleProxy.value
  const mobile = window.matchMedia('(max-width: 767px)').matches
  const e = 1 - (scrollTrigger?.progress ?? 0)
  const blended = e * (1 - openScale) + openScale

  if (mobile) {
    poster.style.transform = `scale(${blended * 5 + 95}%)`
    img.style.transform = `scale(${100 - blended * 5 + 5}%)`
  } else {
    poster.style.transform = `scale(${blended * 20 + 80}%)`
    img.style.transform = `scale(${100 - blended * 20 + 30}%)`
  }
}

function setupScrollScale() {
  if (!props.scrollScale) return
  scrollTrigger?.kill()
  const stage = stageRef.value
  if (!stage) return

  scrollTrigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: applyScale,
  })
  applyScale()
}

onMounted(() => {
  setupInitialState()
  setupScrollScale()
  if (props.closeOnEscape) window.addEventListener('keydown', onKeydown)
  if (props.scrollScale) window.addEventListener('resize', applyScale)
})

onBeforeUnmount(() => {
  scrollTrigger?.kill()
  scrollTrigger = null
  if (props.closeOnEscape) window.removeEventListener('keydown', onKeydown)
  if (props.scrollScale) window.removeEventListener('resize', applyScale)
})

defineExpose({ open, close, stop, isOpen, thumbnailRef })
</script>

<template>
  <div
    class="cinematic-video-frame"
    :class="[frameClass, { 'is-open': isOpen }]"
  >
    <div
      ref="stageRef"
      class="cinematic-video-frame__stage"
      :class="{ 'is-open': isOpen }"
    >
      <button
        v-if="!isOpen"
        type="button"
        class="cinematic-video-frame__hit"
        :aria-label="`Play ${title}`"
        :tabindex="interactable ? 0 : -1"
        :aria-disabled="!interactable || !canPlay"
        @mousedown.stop
        @touchstart.stop
        @click.stop="onHitClick"
      />

      <div
        ref="thumbnailRef"
        class="cinematic-video-frame__thumbnail"
      >
        <slot name="thumbnail">
          <img
            v-if="posterUrl"
            ref="thumbnailInnerRef"
            class="cinematic-video-frame__thumbnail-img"
            :src="posterUrl"
            alt=""
            draggable="false"
          >
          <div
            v-else
            ref="thumbnailInnerRef"
            class="cinematic-video-frame__thumbnail-fallback"
            aria-hidden="true"
          />
        </slot>
        <div
          class="cinematic-video-frame__thumbnail-tint"
          aria-hidden="true"
        />
      </div>

      <div
        v-if="showOverlay"
        ref="overlayRef"
        class="cinematic-video-frame__overlay-wrap"
        :style="overlayStyle"
      >
        <CinematicVideoOverlay
          :title="title"
          :runtime="runtime"
          :show-title="overlayShowTitle"
          :show-runtime="overlayShowRuntime"
        />
      </div>

      <div
        ref="dialogRef"
        class="cinematic-video-frame__dialog"
        role="dialog"
        :aria-modal="isOpen ? 'true' : undefined"
        :aria-label="`${title} player`"
        @mouseenter="onDialogEnter"
        @mouseleave="onDialogLeave"
        @click="togglePlay"
      >
        <div
          v-if="showClose"
          class="cinematic-video-frame__bar cinematic-video-frame__bar--top"
        >
          <button
            ref="closeRef"
            type="button"
            class="cinematic-video-frame__close"
            aria-label="Close video"
            @click.stop="close"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <CinematicVideoMedia
          ref="mediaComponentRef"
          :active="playerReady"
          :provider="provider"
          :video-src="videoSrc"
          :iframe-title="iframeTitle"
          shell-class="cinematic-video-frame__media-shell"
          plyr-class="cinematic-video-frame__plyr"
        />

        <div class="cinematic-video-frame__bar cinematic-video-frame__bar--bottom">
          <CinematicVideoControls
            ref="controlsRef"
            :is-playing="isPlaying"
            :is-muted="isMuted"
            :current-label="currentLabel"
            :total-label="totalLabel"
            :progress-pct="progressPct"
            @toggle-play="togglePlay"
            @toggle-sound="toggleSound"
            @scrub-down="onScrubDown"
            @seek="seekFromEvent"
          />
        </div>
      </div>
    </div>

    <div
      ref="darkenRef"
      class="cinematic-video-frame__darken"
      aria-hidden="true"
      @click="onDarkenClick"
    />
  </div>
</template>

<style scoped>
.cinematic-video-frame {
  --cinematic-bar-pad-x: clamp(1rem, 3vw, 3rem);
  --cinematic-bar-pad-y: clamp(0.75rem, 1.5vw, 1.25rem);

  position: relative;
  width: 100%;
}

.cinematic-video-frame.is-open {
  z-index: 450;
}

.cinematic-video-frame__stage {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  width: 100%;
  background: #000;
}

.cinematic-video-frame__stage.is-open {
  z-index: 55;
}

.cinematic-video-frame__hit {
  position: absolute;
  inset: 0;
  z-index: 4;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.cinematic-video-frame__thumbnail {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  transform-origin: center center;
  will-change: transform;
  pointer-events: none;
}

.cinematic-video-frame__thumbnail-img,
.cinematic-video-frame__thumbnail-fallback,
.cinematic-video-frame__thumbnail :deep(video),
.cinematic-video-frame__thumbnail :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center;
  will-change: transform;
}

.cinematic-video-frame__thumbnail-fallback {
  background: #8e968d;
}

.cinematic-video-frame__thumbnail-tint {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  pointer-events: none;
}

.cinematic-video-frame__overlay-wrap {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.cinematic-video-frame__dialog {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
}

.cinematic-video-frame__bar {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  padding: var(--cinematic-bar-pad-y) var(--cinematic-bar-pad-y);
  pointer-events: none;
}

.cinematic-video-frame__bar--top {
  top: 0;
  justify-content: flex-end;
}

.cinematic-video-frame__bar--bottom {
  bottom: 0;
  justify-content: center;
}

.cinematic-video-frame__bar--bottom :deep(.cinematic-video-controls__playpause),
.cinematic-video-frame__bar--bottom :deep(.cinematic-video-controls__scrub),
.cinematic-video-frame__bar--bottom :deep(.cinematic-video-controls__sound) {
  pointer-events: auto;
}

.cinematic-video-frame__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0px;
  background: rgba(0, 0, 0, 0.35);
  color: #f7f4ec;
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.2s ease, transform 0.2s ease;
}

.cinematic-video-frame__close:hover,
.cinematic-video-frame__close:focus-visible {
  background: rgba(0, 0, 0, 0.55);
  transform: scale(1.04);
}

.cinematic-video-frame__close svg {
  width: 1.15rem;
  height: 1.15rem;
}

.cinematic-video-frame__darken {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: #000;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform-origin: center center;
}

.cinematic-video-frame.is-open .cinematic-video-frame__darken {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: auto;
}

.cinematic-video-frame.is-open .cinematic-video-frame__stage {
  z-index: 55;
  cursor: pointer;
}

.cinematic-video-frame.is-open .cinematic-video-frame__dialog {
  cursor: pointer;
}

.cinematic-video-frame.is-open .cinematic-video-frame__darken {
  cursor: pointer;
}
</style>
