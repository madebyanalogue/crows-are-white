import {
  buildLineElements,
  prepareSplitText,
  restoreSplitElement,
} from '~/utils/splitTextLines'

let gsapModulesPromise = null

function getGsapModules() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!gsapModulesPromise) {
    gsapModulesPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)
      return { gsap, ScrollTrigger }
    })
  }
  return gsapModulesPromise
}

function waitForRevealGate() {
  if (typeof document === 'undefined') {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const finish = () => {
      nextTick(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve)
        })
      })
    }

    if (
      document.body.classList.contains('preloader-ready')
      || document.body.classList.contains('preloader-complete')
    ) {
      finish()
      return
    }

    document.addEventListener('preloader-complete', finish, { once: true })
  })
}

export function useSplitTextAnimation(titleRef, options = {}) {
  const {
    enabled = true,
    start = 'top 85%',
    stagger = 0.12,
    duration = 0.9,
    ease = 'power3.out',
    delay = 0,
    trigger = 'scroll',
    lineBreaks = 'visual',
    onComplete,
    onLastLineStart,
  } = options

  let scrollTrigger = null
  let tween = null
  let splitLines = []
  let preloaderListener = null

  async function playReveal(gsap) {
    const revealDelay = unref(delay)

    if (onLastLineStart && splitLines.length) {
      gsap.delayedCall(
        revealDelay + Math.max(0, splitLines.length - 1) * stagger,
        onLastLineStart,
      )
    }

    tween = gsap.to(splitLines, {
      yPercent: 0,
      opacity: 1,
      duration,
      ease,
      delay: unref(delay),
      stagger,
      onComplete,
    })
  }

  async function init() {
    if (unref(enabled) === false) return

    const modules = await getGsapModules()
    const element = titleRef.value
    if (!modules || !element) return

    const { gsap } = modules
    const { label, lines, words } = prepareSplitText(element, { lineBreaks })
    if (!words.length) return

    element.classList.add('line-reveal', 'line-reveal--ready')
    splitLines = buildLineElements(element, lines, label)
    gsap.set(splitLines, { yPercent: 110, opacity: 0 })

    if (trigger === 'preloader') {
      const reveal = async () => {
        await waitForRevealGate()
        await playReveal(gsap)
      }

      if (document.body.classList.contains('preloader-complete')) {
        reveal()
        return
      }

      preloaderListener = () => {
        reveal()
      }
      document.addEventListener('preloader-complete', preloaderListener, { once: true })
      return
    }

    const { ScrollTrigger } = modules
    const revealDelay = unref(delay)

    if (onLastLineStart && splitLines.length) {
      gsap.delayedCall(
        revealDelay + Math.max(0, splitLines.length - 1) * stagger,
        onLastLineStart,
      )
    }

    tween = gsap.to(splitLines, {
      yPercent: 0,
      opacity: 1,
      duration,
      ease,
      stagger,
      onComplete,
      scrollTrigger: {
        trigger: element,
        start,
        once: true,
        onEnter: () => {
          scrollTrigger = tween.scrollTrigger
        },
      },
    })
  }

  function cleanup() {
    tween?.kill()
    scrollTrigger?.kill()
    if (preloaderListener) {
      document.removeEventListener('preloader-complete', preloaderListener)
      preloaderListener = null
    }
    tween = null
    scrollTrigger = null
    splitLines = []

    const element = titleRef.value
    if (!element) return

    restoreSplitElement(element)
    element.classList.remove('line-reveal', 'line-reveal--ready', 'line-reveal--revealed')
  }

  onMounted(() => {
    nextTick(() => init())
  })

  onUnmounted(() => {
    cleanup()
  })

  return { cleanup, init }
}
