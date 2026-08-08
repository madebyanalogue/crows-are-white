<template>
  <div
    v-show="showPreloader"
    ref="preloaderEl"
    class="preloader"
    data-loading-container
  >
    <div
      ref="backgroundEl"
      class="preloader__background"
    >
      <div
        v-if="hasPreloaderText"
        ref="textBoxEl"
        class="preloader__text-box"
      >
        <p class="preloader__text">
          <span
            v-if="preloaderText"
            class="preloader__text-line"
          >{{ preloaderText }}</span>
          <span
            v-if="preloaderText && preloaderTextJa"
            class="preloader__text-separator"
            aria-hidden="true"
          />
          <span
            v-if="preloaderTextJa"
            class="preloader__text-line preloader__text-line--ja"
          >{{ preloaderTextJa }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['preloader-complete', 'preloader-ready'])

const { preloaderText, preloaderTextJa, preloaderHoldSeconds } = useSiteSettings()

const hasPreloaderText = computed(() =>
  Boolean(preloaderText.value || preloaderTextJa.value),
)

const showPreloader = ref(props.enabled)
const preloaderEl = ref(null)
const backgroundEl = ref(null)
const textBoxEl = ref(null)

let animationTimeline = null

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

function clearPreloaderShell() {
  document.documentElement.classList.remove('is-preloader-active')
  document.documentElement.style.backgroundColor = ''
}

function signalPreloaderComplete() {
  if (preloaderCompleteSignaled) return
  preloaderCompleteSignaled = true

  clearPreloaderShell()
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
  clearPreloaderShell()
  unlockScroll()
  document.body.classList.add('preloader-ready')
  emit('preloader-ready')
  signalPreloaderComplete()
}

function markPreloaderReady() {
  emit('preloader-ready')
  document.body.classList.add('preloader-ready')
}

function initPreloaderAnimation(gsap) {
  const textFadeInDuration = 1.8
  const textHoldDuration = preloaderHoldSeconds.value
  const textFadeOutDuration = 0.45
  const wipeDuration = 0.4

  gsap.set(preloaderEl.value, {
    scaleY: 1,
    scaleX: 1,
    transformOrigin: 'top center',
  })

  gsap.set(backgroundEl.value, { opacity: 1 })

  if (textBoxEl.value) {
    gsap.set(textBoxEl.value, { opacity: 0 })
  }

  animationTimeline = gsap.timeline({
    onComplete: finishPreloader,
  })

  let cursor = 0

  if (textBoxEl.value) {
    animationTimeline.to(textBoxEl.value, {
      opacity: 1,
      duration: textFadeInDuration,
      ease: 'power2.out',
      onStart: markPreloaderReady,
    }, cursor)

    cursor += textFadeInDuration + textHoldDuration

    animationTimeline.to(textBoxEl.value, {
      opacity: 0,
      duration: textFadeOutDuration,
      ease: 'power2.inOut',
    }, cursor)

    cursor += textFadeOutDuration
  } else {
    markPreloaderReady()
    cursor += textHoldDuration
  }

  animationTimeline.to(preloaderEl.value, {
    scaleY: 0,
    scaleX: 1,
    transformOrigin: 'top center',
    duration: wipeDuration,
    ease: 'none',
    onStart: () => {
      if (preloaderEl.value) {
        preloaderEl.value.style.pointerEvents = 'none'
      }
      signalPreloaderComplete()
    },
  }, cursor)
}

async function waitForGsap() {
  if (window.gsap) return window.gsap

  return new Promise((resolve) => {
    const check = () => {
      if (window.gsap) {
        resolve(window.gsap)
        return
      }
      requestAnimationFrame(check)
    }
    check()
  })
}

async function initPreloader() {
  const gsap = await waitForGsap()
  if (!gsap || !preloaderEl.value || !backgroundEl.value) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    skipPreloader()
    return
  }

  initPreloaderAnimation(gsap)
}

onMounted(async () => {
  if (!props.enabled) {
    skipPreloader()
    return
  }

  lockScroll()
  document.documentElement.classList.add('is-preloader-active')

  await nextTick()
  initPreloader()
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
  pointer-events: auto;
  transform-origin: top center;
  will-change: transform;
  background: #f0f0ed;
}

.preloader__background {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--wrapper-padding);
  background: #f0f0ed;
  opacity: 1;
}

.preloader__text-box {
  opacity: 0;
  position: relative;
  padding: 1rem 1.35rem;
  border: 1px solid color-mix(in srgb, var(--obsidian) 28%, transparent);
  outline: 1px solid color-mix(in srgb, var(--obsidian) 28%, transparent);
  outline-offset: 5px;
  color: var(--obsidian);
  text-align: center;
}

.preloader__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  margin: 0;
  font-family: var(--serif-body);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0.01em;
}

.preloader__text-line {
  display: block;
}

.preloader__text-separator {
  display: none;
}

@media (min-width: 700px) {
  .preloader__text {
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    gap: 0;
    white-space: nowrap;
  }

  .preloader__text-line {
    display: inline;
  }

  .preloader__text-separator {
    display: inline-block;
    width: 1px;
    height: 0.95em;
    margin: 0 1rem;
    background: color-mix(in srgb, var(--obsidian) 24%, transparent);
    vertical-align: middle;
  }
}
</style>
