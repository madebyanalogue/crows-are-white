<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

const sectionRef = ref(null)
const stageRef = ref(null)
const posterRef = ref(null)
const posterImgRef = ref(null)
const ctaRef = ref(null)
const dialogRef = ref(null)
const darkenRef = ref(null)
const videoShellRef = ref(null)
const videoElRef = ref(null)
const plyrShellRef = ref(null)
const plyrHostRef = ref(null)
const uiPlayRef = ref(null)
const uiProgressRef = ref(null)
const uiSoundRef = ref(null)

const isOpen = ref(false)
const isOpening = ref(false)
const playerReady = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentLabel = ref('0:00')
const totalLabel = ref('0:00')
const progressPct = ref(0)

let player = null
let scaleProxy = { value: 0 }
let scrollTrigger = null
let scrubbing = false
let openToken = 0

const api = {
  open: () => openModal(),
  close: () => closeModal(),
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function setDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return
  totalLabel.value = formatTime(seconds)
}

function syncProgress(current, duration) {
  currentLabel.value = formatTime(current)
  if (Number.isFinite(duration) && duration > 0) {
    progressPct.value = (current / duration) * 100
  }
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
  const el = stageRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const target =
    window.scrollY + rect.top - (window.innerHeight / 2 - rect.height / 2)

  if ($lenis?.scrollTo) {
    $lenis.scrollTo(target, { duration: 0.8 })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
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

function mediaFadeTarget() {
  return useNativeVideo.value ? videoShellRef.value : plyrShellRef.value
}

async function initPlayer() {
  destroyPlayer()
  if (!import.meta.client) return

  if (useNativeVideo.value) {
    const video = videoElRef.value
    const shell = videoShellRef.value
    if (!video || !shell) return
    gsap.set(shell, { autoAlpha: 1 })
    video.controls = false
    video.playsInline = true
    const onMeta = () => setDuration(video.duration)
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) onMeta()
    video.addEventListener('timeupdate', () => {
      if (!scrubbing) syncProgress(video.currentTime, video.duration)
    })
    video.addEventListener('play', () => {
      isPlaying.value = true
    })
    video.addEventListener('pause', () => {
      isPlaying.value = false
    })
    video.addEventListener('volumechange', () => {
      isMuted.value = video.muted || video.volume === 0
    })
    return
  }

  const shell = plyrShellRef.value
  const host = plyrHostRef.value
  if (!shell || !host || !trailerId.value) return
  gsap.set(shell, { autoAlpha: 1 })

  const { default: Plyr } = await import('plyr')
  const origin = window.location.origin
  const iframe = host.querySelector('iframe')
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${trailerId.value}?autoplay=1&origin=${encodeURIComponent(origin)}&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0&enablejsapi=1`
  }

  player = new Plyr(host, {
    autoplay: true,
    clickToPlay: false,
    hideControls: true,
    resetOnEnd: false,
    controls: [],
    youtube: {
      noCookie: true,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1,
    },
  })

  player.on('ready', () => {
    setDuration(player.duration)
    player.play()?.catch?.(() => {})
  })
  player.on('loadedmetadata', () => setDuration(player.duration))
  player.on('timeupdate', () => {
    if (!scrubbing) syncProgress(player.currentTime, player.duration)
  })
  player.on('play', () => {
    isPlaying.value = true
  })
  player.on('pause', () => {
    isPlaying.value = false
  })
  player.on('volumechange', () => {
    isMuted.value = Boolean(player.muted)
  })
}

function togglePlay(event) {
  event?.stopPropagation?.()
  if (useNativeVideo.value) {
    const video = videoElRef.value
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
    return
  }
  if (!player) return
  if (player.paused) player.play()
  else player.pause()
}

function toggleSound(event) {
  event?.stopPropagation?.()
  if (useNativeVideo.value) {
    const video = videoElRef.value
    if (!video) return
    video.muted = !video.muted
    isMuted.value = video.muted
    return
  }
  if (!player) return
  player.muted = !player.muted
  isMuted.value = Boolean(player.muted)
}

function seekFromEvent(event) {
  const scrub = event.currentTarget
  const rect = scrub.getBoundingClientRect()
  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)

  if (useNativeVideo.value) {
    const video = videoElRef.value
    if (!video || !Number.isFinite(video.duration)) return
    video.currentTime = ratio * video.duration
    syncProgress(video.currentTime, video.duration)
    return
  }

  if (!player || !Number.isFinite(player.duration)) return
  player.currentTime = ratio * player.duration
  syncProgress(player.currentTime, player.duration)
}

function onScrubDown(event) {
  event.stopPropagation()
  scrubbing = true
  seekFromEvent(event)

  const onMove = (e) => {
    if (!scrubbing) return
    seekFromEvent({ currentTarget: event.currentTarget, clientX: e.clientX })
  }
  const onUp = () => {
    scrubbing = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function applyScale() {
  const poster = posterRef.value
  const img = posterImgRef.value
  if (!poster || !img) return

  const openScale = scaleProxy.value
  const mobile = window.matchMedia('(max-width: 767px)').matches
  // Match Siena: scroll shrinks frame; opening drives scale → 1
  const track = mobile ? 0.05 : 0.2
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

async function openModal() {
  if (isOpen.value || isOpening.value) return
  const token = ++openToken
  isOpening.value = true
  isOpen.value = true

  scrollStageIntoView()
  setTimeout(() => stopLenis(), 500)

  playerReady.value = true
  await nextTick()
  if (token !== openToken) return

  await initPlayer()
  if (token !== openToken) return

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      if (token === openToken) isOpening.value = false
    },
  })

  gsap.set(darkenRef.value, { scale: 1 })

  // Show video at full opacity immediately (black stage underneath),
  // then fade the poster out so we don't get a washed translucent blend.
  gsap.set(mediaFadeTarget(), { autoAlpha: 1 })

  tl.to(ctaRef.value, { autoAlpha: 0, duration: 0.2 }, 0)
    .to(dialogRef.value, { autoAlpha: 1, duration: 0.35 }, 0)
    .to(scaleProxy, { value: 1, duration: 0.7, onUpdate: applyScale }, 0)
    .to(darkenRef.value, { autoAlpha: 0.9, scale: 4, duration: 0.55 }, 0.2)
    .to(posterRef.value, { autoAlpha: 0, duration: 0.35 }, 0.25)
    .to(
      [uiPlayRef.value, uiProgressRef.value, uiSoundRef.value],
      { autoAlpha: 1, yPercent: 0, stagger: 0.12, duration: 0.5 },
      0.4,
    )

  if (useNativeVideo.value) {
    videoElRef.value?.play?.()?.catch?.(() => {})
    isPlaying.value = true
  } else {
    player?.play?.()
  }
}

async function closeModal() {
  if (!isOpen.value || isOpening.value) return
  openToken += 1
  isOpening.value = true
  startLenis()

  if (useNativeVideo.value) videoElRef.value?.pause?.()
  else player?.pause?.()
  isPlaying.value = false

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      isOpen.value = false
      isOpening.value = false
      playerReady.value = false
      destroyPlayer()
      progressPct.value = 0
      currentLabel.value = '0:00'
      gsap.set(ctaRef.value, { clearProps: 'opacity,visibility' })
      gsap.set(posterRef.value, { clearProps: 'opacity,visibility' })
    },
  })

  tl.to(
    [uiPlayRef.value, uiProgressRef.value, uiSoundRef.value],
    { autoAlpha: 0, yPercent: 150, duration: 0.4 },
    0,
  )
    .to(scaleProxy, { value: 0, duration: 0.55, onUpdate: applyScale }, 0)
    .to(darkenRef.value, { autoAlpha: 0, scale: 1, duration: 0.25 }, 0)
    .to(mediaFadeTarget(), { autoAlpha: 0, duration: 0.2 }, 0)
    .to(posterRef.value, { autoAlpha: 1, duration: 0.25 }, 0.1)
    .to(dialogRef.value, { autoAlpha: 0, duration: 0.15 }, 0.05)
    .to(ctaRef.value, { autoAlpha: 1, duration: 0.3 }, 0.15)
}

function onKeydown(event) {
  if (event.key === 'Escape' && isOpen.value) closeModal()
}

function onDarkenClick() {
  closeModal()
}

onMounted(() => {
  register(api)
  gsap.set(dialogRef.value, { autoAlpha: 0 })
  gsap.set(darkenRef.value, { autoAlpha: 0 })
  gsap.set([uiPlayRef.value, uiProgressRef.value, uiSoundRef.value], {
    autoAlpha: 0,
    yPercent: 150,
  })
  if (videoShellRef.value) gsap.set(videoShellRef.value, { autoAlpha: 0 })
  if (plyrShellRef.value) gsap.set(plyrShellRef.value, { autoAlpha: 0 })
  if (posterRef.value) gsap.set(posterRef.value, { autoAlpha: 1 })
  setupScrollScale()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', applyScale)
})

onBeforeUnmount(() => {
  unregister(api)
  openToken += 1
  destroyPlayer()
  scrollTrigger?.kill()
  scrollTrigger = null
  startLenis()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', applyScale)
})

defineExpose(api)
</script>

<template>
  <section
    id="trailer"
    ref="sectionRef"
    class="trailer-section"
    data-trailer-section
  >
    <div
      ref="stageRef"
      class="trailer-section__stage"
      :class="{ 'is-open': isOpen }"
    >
      <button
        ref="ctaRef"
        type="button"
        class="trailer-section__cta"
        :tabindex="isOpen ? -1 : 0"
        :aria-hidden="isOpen ? 'true' : undefined"
        aria-label="Watch trailer"
        @click="openModal"
      >
        <span class="trailer-section__play-icon" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              d="M80.593 43.765c4.543 3.072 4.543 9.762 0 12.834L28.219 92.021c-5.145 3.48-12.087-.206-12.087-6.417V14.76c0-6.21 6.942-9.897 12.087-6.417l52.374 35.422Z"
            />
          </svg>
        </span>
        <span class="trailer-section__cta-copy">
          <span class="trailer-section__cta-eyebrow">Play</span>
          <span class="trailer-section__cta-label serif">{{ label }}</span>
        </span>
      </button>

      <div
        ref="dialogRef"
        class="trailer-section__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Trailer player"
        @click="togglePlay"
      >
        <div class="trailer-section__bar trailer-section__bar--top">
          <button
            type="button"
            class="trailer-section__close"
            aria-label="Close trailer"
            @click.stop="closeModal"
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

        <div class="trailer-section__bar trailer-section__bar--bottom">
          <div class="trailer-section__controls">
            <button
              ref="uiPlayRef"
              type="button"
              class="trailer-section__playpause"
              :class="{ 'is-playing': isPlaying }"
              :aria-label="isPlaying ? 'Pause' : 'Play'"
              @click="togglePlay"
            >
              <span class="trailer-section__pause" aria-hidden="true">
                <span />
                <span />
              </span>
              <span class="trailer-section__play" aria-hidden="true">
                <svg viewBox="0 0 100 100" fill="none">
                  <path
                    fill="currentColor"
                    d="M83.285 43.015c4.953 3.344 4.953 10.626 0 13.97L26.18 95.538C20.57 99.325 13 95.314 13 88.554V11.446c0-6.76 7.57-10.771 13.18-6.984l57.105 38.553Z"
                  />
                </svg>
              </span>
            </button>

            <div
              ref="uiProgressRef"
              class="trailer-section__progress"
            >
              <span class="trailer-section__time">{{ currentLabel }}</span>
              <div
                class="trailer-section__scrub"
                role="slider"
                aria-label="Seek"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="Math.round(progressPct)"
                @mousedown="onScrubDown"
                @click.stop="seekFromEvent"
              >
                <div class="trailer-section__scrub-track">
                  <div
                    class="trailer-section__scrub-fill"
                    :style="{ width: `${progressPct}%` }"
                  >
                    <span class="trailer-section__scrub-dot" />
                  </div>
                </div>
              </div>
              <span class="trailer-section__time">{{ totalLabel }}</span>
            </div>

            <button
              ref="uiSoundRef"
              type="button"
              class="trailer-section__sound"
              :class="{ 'is-muted': isMuted }"
              @click="toggleSound"
            >
              {{ isMuted ? 'Sound Off' : 'Sound On' }}
            </button>
          </div>
        </div>

        <div class="trailer-section__media">
          <div
            ref="videoShellRef"
            class="trailer-section__video-shell"
          >
            <video
              v-if="playerReady && useNativeVideo"
              ref="videoElRef"
              class="trailer-section__video"
              :src="trailerSrc"
              playsinline
              preload="auto"
            />
          </div>
          <div
            v-show="playerReady && !useNativeVideo && trailerId"
            ref="plyrShellRef"
            class="trailer-section__plyr-shell"
          >
            <div
              ref="plyrHostRef"
              class="trailer-section__plyr plyr__video-embed trailer-player"
            >
              <iframe
                title="Crows Are White — Official Trailer"
                allowfullscreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        ref="posterRef"
        class="trailer-section__poster"
      >
        <div class="trailer-section__poster-inner">
          <img
            v-if="posterUrl"
            ref="posterImgRef"
            class="trailer-section__poster-img"
            :src="posterUrl"
            alt=""
            draggable="false"
          >
          <div
            v-else
            ref="posterImgRef"
            class="trailer-section__poster-fallback"
            aria-hidden="true"
          />
          <div class="trailer-section__poster-tint" aria-hidden="true" />
        </div>
      </div>
    </div>

    <div
      ref="darkenRef"
      class="trailer-section__darken"
      aria-hidden="true"
      @click="onDarkenClick"
    />
  </section>
</template>

<style scoped>
.trailer-section {
  --trailer-accent: #ff555f;
  --trailer-ui: #f7f4ec;
  --trailer-ink: #0a0a0a;
  --trailer-stage-max: min(92vw, 1480px);
  --trailer-bar-pad-x: clamp(1rem, 3vw, 3rem);
  --trailer-bar-pad-y: clamp(0.75rem, 1.5vw, 1.25rem);

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

.trailer-section:has(.trailer-section__stage.is-open) {
  /* Above site header (z-index: 400) while open */
  z-index: 450;
}

.trailer-section__stage {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--trailer-stage-max);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
}

.trailer-section__stage.is-open {
  z-index: 40;
}

.trailer-section__cta {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--trailer-accent);
  cursor: pointer;
}

.trailer-section__play-icon {
  display: block;
  width: clamp(3.25rem, 6vw, 5rem);
  height: clamp(3.25rem, 6vw, 5rem);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.trailer-section__play-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}

.trailer-section__cta:hover .trailer-section__play-icon,
.trailer-section__cta:focus-visible .trailer-section__play-icon {
  transform: scale(1.08);
}

.trailer-section__cta-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-align: center;
}

.trailer-section__cta-eyebrow {
  font-family: var(--sans);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.trailer-section__cta-label {
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.trailer-section__poster {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  will-change: transform;
  pointer-events: none;
}

.trailer-section__poster-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.trailer-section__poster-img,
.trailer-section__poster-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center;
  will-change: transform;
}

.trailer-section__poster-fallback {
  background: linear-gradient(145deg, #1a1a1a, #0a0a0a 55%, #2a1818);
}

.trailer-section__poster-tint {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  pointer-events: none;
}

.trailer-section__dialog {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
}

.trailer-section__bar {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  padding: var(--trailer-bar-pad-y) var(--trailer-bar-pad-x);
  pointer-events: none;
}

.trailer-section__bar--top {
  top: 0;
  justify-content: flex-end;
}

.trailer-section__bar--bottom {
  bottom: 0;
  justify-content: center;
}

.trailer-section__close,
.trailer-section__playpause,
.trailer-section__sound,
.trailer-section__scrub {
  pointer-events: auto;
}

.trailer-section__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: var(--trailer-ui);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.trailer-section__close:hover,
.trailer-section__close:focus-visible {
  background: rgba(0, 0, 0, 0.55);
  transform: scale(1.04);
}

.trailer-section__close svg {
  width: 1.15rem;
  height: 1.15rem;
}

.trailer-section__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.75rem, 2vw, 2rem);
  width: min(100%, 1100px);
  color: var(--trailer-ui);
}

.trailer-section__playpause {
  position: relative;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.trailer-section__play,
.trailer-section__pause {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trailer-section__play svg {
  width: 1.35rem;
  height: 1.35rem;
}

.trailer-section__pause {
  gap: 0.3rem;
  opacity: 0;
}

.trailer-section__pause span {
  display: block;
  width: 0.28rem;
  height: 1.15rem;
  border-radius: 1px;
  background: currentColor;
}

.trailer-section__playpause.is-playing .trailer-section__play {
  opacity: 0;
}

.trailer-section__playpause.is-playing .trailer-section__pause {
  opacity: 1;
}

.trailer-section__progress {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: clamp(0.65rem, 1.5vw, 1.5rem);
  min-width: 0;
}

.trailer-section__time {
  flex: 0 0 auto;
  font-family: var(--sans);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.trailer-section__scrub {
  flex: 1 1 auto;
  min-width: 0;
  height: 2.75rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.trailer-section__scrub-track {
  position: relative;
  width: 100%;
  height: 1px;
  background: rgba(247, 244, 236, 0.35);
}

.trailer-section__scrub-fill {
  position: relative;
  height: 100%;
  width: 0;
  background: var(--trailer-ui);
}

.trailer-section__scrub-dot {
  position: absolute;
  top: 50%;
  right: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--trailer-ui);
  transform: translate(50%, -50%);
}

.trailer-section__sound {
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: var(--sans);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
}

.trailer-section__sound:hover,
.trailer-section__sound:focus-visible {
  opacity: 0.75;
}

.trailer-section__media {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #000;
  pointer-events: none;
}

.trailer-section__video,
.trailer-section__plyr {
  width: 100%;
  height: 100%;
  background: #000;
}

.trailer-section__video {
  object-fit: cover;
  display: block;
}

.trailer-section__plyr :deep(.plyr),
.trailer-section__plyr :deep(.plyr__video-wrapper),
.trailer-section__plyr :deep(.plyr__video-embed),
.trailer-section__plyr :deep(iframe),
.trailer-section__plyr :deep(video) {
  width: 100%;
  height: 100%;
}

/* Keep YouTube chrome inert — custom UI owns all interaction */
.trailer-section__plyr-shell,
.trailer-section__plyr :deep(.plyr),
.trailer-section__plyr :deep(iframe) {
  pointer-events: none;
}

.trailer-section__plyr :deep(.plyr__controls),
.trailer-section__plyr :deep(.plyr__control--overlaid),
.trailer-section__plyr :deep(.plyr__poster) {
  display: none !important;
  opacity: 0 !important;
}

.trailer-section__video-shell,
.trailer-section__plyr-shell {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0;
  visibility: hidden;
}

.trailer-section__darken {
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

.trailer-section:has(.trailer-section__stage.is-open) .trailer-section__darken {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: auto;
}

.trailer-section:has(.trailer-section__stage.is-open) .trailer-section__stage {
  z-index: 55;
}

@media (max-width: 767px) {
  .trailer-section {
    padding-inline: 0.75rem;
  }

  .trailer-section__controls {
    gap: 0.55rem;
  }

  .trailer-section__sound {
    font-size: 0.72rem;
  }

  .trailer-section__time {
    font-size: 0.72rem;
  }
}
</style>
