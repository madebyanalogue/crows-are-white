<template>
  <div
    v-show="showPreloader"
    ref="preloaderEl"
    class="preloader"
    :style="preloaderStyle"
    data-loading-container
  >
    <div ref="clipperLeftEl" class="preloader__clipper preloader__clipper--left">
      <div ref="logotypeEl" class="preloader__logo-wrap" style="opacity: 0">
        <span class="preloader__wordmark">{{ siteTitle }}</span>
      </div>
      <div ref="mobileLogoLeftEl" class="preloader__mobile-logo preloader__mobile-logo--left" style="opacity: 0">
        <span class="preloader__mobile-wordmark">{{ siteTitle }}</span>
      </div>
    </div>

    <div ref="clipperRightEl" class="preloader__clipper preloader__clipper--right">
      <div ref="iconEl" class="preloader__logo-wrap" style="opacity: 0">
        <CrowsIcon class="preloader__icon" aria-hidden="true" />
      </div>
      <div ref="mobileLogoRightEl" class="preloader__mobile-logo preloader__mobile-logo--right" style="opacity: 0">
        <span class="preloader__mobile-wordmark">{{ siteTitle }}</span>
      </div>
    </div>

    <div ref="loaderEl" class="preloader__loader">
      <div class="preloader__loader-track" aria-hidden="true" />
      <div ref="loaderBarEl" class="preloader__loader-bar" />
    </div>
  </div>
</template>

<script setup>
import {
  CONTENT_REVEAL_DURATION,
  TRANSITION_EASE,
} from '~/composables/usePageTransition'
import { toCssColor, DEFAULT_MENU_BACKGROUND_COLOR } from '~/utils/pageColors'

const PRELOADER_FADE_DURATION = CONTENT_REVEAL_DURATION

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['preloader-complete', 'preloader-ready'])
const { preloaderBackgroundColor, preloaderForegroundColor, siteTitle } = useSiteSettings()

const showPreloader = ref(props.enabled)
const preloaderEl = ref(null)
const clipperLeftEl = ref(null)
const clipperRightEl = ref(null)
const loaderEl = ref(null)
const loaderBarEl = ref(null)
const logotypeEl = ref(null)
const iconEl = ref(null)
const mobileLogoLeftEl = ref(null)
const mobileLogoRightEl = ref(null)

let animationTimeline = null
let loaderHidden = false

const preloaderStyle = computed(() => ({
  '--preloader-bg': toCssColor(preloaderBackgroundColor.value, DEFAULT_MENU_BACKGROUND_COLOR),
  '--preloader-fg': toCssColor(preloaderForegroundColor.value, 'obsidian'),
}))

function applyClipPaths(leftAmount, rightAmount) {
  if (clipperLeftEl.value) {
    clipperLeftEl.value.style.clipPath = `inset(0 ${leftAmount}% 0 0)`
  }
  if (clipperRightEl.value) {
    clipperRightEl.value.style.clipPath = `inset(0 0 0 ${rightAmount}%)`
  }
}

function hideLoaderIfClipStarted(leftAmount, rightAmount) {
  if (loaderHidden || !loaderEl.value) return

  const leftClippedPx = (leftAmount / 100) * (clipperLeftEl.value?.offsetWidth || 0)
  const rightClippedPx = (rightAmount / 100) * (clipperRightEl.value?.offsetWidth || 0)

  if (leftClippedPx > 1 || rightClippedPx > 1) {
    loaderHidden = true
    window.gsap?.to(loaderEl.value, {
      autoAlpha: 0,
      duration: 0.1,
      overwrite: true,
    })
  }
}

function resetScrollToTop() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

function unlockScroll() {
  const htmlEl = document.documentElement
  const bodyEl = document.body

  if (htmlEl && bodyEl) {
    bodyEl.style.position = ''
    bodyEl.style.top = ''
    bodyEl.style.left = ''
    bodyEl.style.right = ''
    bodyEl.style.width = ''
    htmlEl.style.overflow = ''
    bodyEl.style.overflow = ''
  }

  resetScrollToTop()
}

function lockScroll() {
  const htmlEl = document.documentElement
  const bodyEl = document.body

  if (!htmlEl || !bodyEl) return

  resetScrollToTop()

  bodyEl.style.position = 'fixed'
  bodyEl.style.top = '0'
  bodyEl.style.left = '0'
  bodyEl.style.right = '0'
  bodyEl.style.width = '100%'
  htmlEl.style.overflow = 'hidden'
  bodyEl.style.overflow = 'hidden'
}

let preloaderCompleteSignaled = false

function signalPreloaderComplete() {
  if (preloaderCompleteSignaled) return
  preloaderCompleteSignaled = true

  unlockScroll()
  document.body.classList.add('preloader-complete')
  document.dispatchEvent(new CustomEvent('preloader-complete'))
  emit('preloader-complete')
}

function finishPreloader() {
  showPreloader.value = false
}

function skipPreloader() {
  showPreloader.value = false
  unlockScroll()
  document.body.classList.add('preloader-ready')
  emit('preloader-ready')
  signalPreloaderComplete()
}

function markPreloaderReady() {
  emit('preloader-ready')
  document.body.classList.add('preloader-ready')
}

async function initPreloaderAnimation() {
  const gsap = window.gsap
  if (!gsap || !preloaderEl.value) return

  loaderHidden = false
  lockScroll()
  markPreloaderReady()

  const isMobile = window.matchMedia('(max-width: 999px)').matches

  if (isMobile) {
    initMobileAnimation(gsap)
    return
  }

  const barFillDuration = 1
  const barFillStart = 0.15
  const barFillEnd = barFillStart + barFillDuration
  const revealDuration = 2
  const revealDelay = barFillEnd + 0.4
  const fadeStart = revealDelay + revealDuration

  gsap.set(loaderBarEl.value, {
    scaleY: 0,
    transformOrigin: '50% 100%',
  })
  applyClipPaths(0, 0)

  const clipAmounts = { left: 0, right: 0 }

  animationTimeline = gsap.timeline({
    onComplete: finishPreloader,
  })

  animationTimeline.to([logotypeEl.value, iconEl.value], {
    opacity: 1,
    duration: 1,
    ease: 'none',
  })

  animationTimeline.to(loaderBarEl.value, {
    scaleY: 1,
    duration: barFillDuration,
    ease: 'power3.in',
  }, barFillStart)

  animationTimeline.to(clipAmounts, {
    left: 100,
    right: 100,
    duration: revealDuration,
    ease: 'power4.inOut',
    onUpdate: () => {
      applyClipPaths(clipAmounts.left, clipAmounts.right)
      hideLoaderIfClipStarted(clipAmounts.left, clipAmounts.right)
    },
  }, revealDelay)

  animationTimeline.to(preloaderEl.value, {
    autoAlpha: 0,
    duration: PRELOADER_FADE_DURATION,
    ease: TRANSITION_EASE,
    pointerEvents: 'none',
    onStart: signalPreloaderComplete,
  }, fadeStart)
}

function initMobileAnimation(gsap) {
  const logoFadeDuration = 1.2
  const logoHold = 0.4
  const revealDuration = 2
  const revealDelay = logoFadeDuration + logoHold
  const fadeStart = revealDelay + revealDuration

  applyClipPaths(0, 0)

  const clipAmounts = { left: 0, right: 0 }

  animationTimeline = gsap.timeline({
    onComplete: finishPreloader,
  })

  animationTimeline.to([mobileLogoLeftEl.value, mobileLogoRightEl.value], {
    opacity: 1,
    duration: logoFadeDuration,
    ease: 'power2.out',
  })

  animationTimeline.to(clipAmounts, {
    left: 100,
    right: 100,
    duration: revealDuration,
    ease: 'power4.inOut',
    onUpdate: () => {
      applyClipPaths(clipAmounts.left, clipAmounts.right)
    },
  }, revealDelay)

  animationTimeline.to(preloaderEl.value, {
    autoAlpha: 0,
    duration: PRELOADER_FADE_DURATION,
    ease: TRANSITION_EASE,
    pointerEvents: 'none',
    onStart: signalPreloaderComplete,
  }, fadeStart)
}

onMounted(() => {
  if (!props.enabled) {
    skipPreloader()
    return
  }

  lockScroll()

  nextTick(() => {
    setTimeout(initPreloaderAnimation, 100)
  })
})

onUnmounted(() => {
  animationTimeline?.kill()
  animationTimeline = null
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  overflow: hidden;
  background: transparent;
}

.preloader__clipper {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  background: var(--preloader-bg, var(--crema));
  color: var(--preloader-fg, var(--obsidian));
  overflow: clip;
  z-index: 2;
  will-change: clip-path;
  clip-path: inset(0 0 0 0);
}

.preloader__clipper--left {
  left: 0;
  width: 50%;
  justify-content: flex-end;
  padding: var(--wrapper-padding);
}

.preloader__clipper--right {
  right: 0;
  width: 50%;
  justify-content: flex-start;
  padding: var(--wrapper-padding);
}

.preloader__wordmark {
  display: block;
  font-family: var(--serif);
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
  white-space: nowrap;
}

.preloader__icon {
  width: min(28vw, 9rem);
  height: auto;
}

.preloader__mobile-wordmark {
  display: block;
  width: max-content;
  font-family: var(--serif);
  font-size: clamp(1.5rem, 8vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
  white-space: nowrap;
}

.preloader__loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 2px;
  height: 140px;
  pointer-events: none;
}

.preloader__loader-track {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--preloader-fg, var(--obsidian)) 20%, transparent);
  border-radius: 2px;
}

.preloader__loader-bar {
  position: absolute;
  inset: 0;
  background: var(--preloader-fg, var(--obsidian));
  border-radius: 2px;
  transform: scaleY(0);
  transform-origin: 50% 100%;
  will-change: transform;
}

.preloader__mobile-logo {
  position: absolute;
  top: 50%;
  z-index: 4;
  display: none;
  width: min(60vw, 20rem);
  color: var(--preloader-fg, var(--obsidian));
  pointer-events: none;
}

/* Each half is centred on the screen's vertical centre line so that,
   together, they form one centred logotype. Each clipper masks its half. */
.preloader__mobile-logo--left {
  left: 100%;
  transform: translate(-50%, -50%);
}

.preloader__mobile-logo--right {
  left: 0;
  transform: translate(-50%, -50%);
}

@media (max-width: 999px) {
  .preloader__logo-wrap {
    visibility: hidden;
  }

  .preloader__loader {
    display: none;
  }

  .preloader__mobile-logo {
    display: block;
  }
}
</style>
