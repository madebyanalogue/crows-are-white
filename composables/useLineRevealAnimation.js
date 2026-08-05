import {
  buildLineElements,
  prepareSplitPortableText,
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

function waitForPreloaderComplete() {
  if (typeof document === 'undefined') {
    return Promise.resolve()
  }

  if (document.body.classList.contains('preloader-complete')) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    document.addEventListener('preloader-complete', resolve, { once: true })
  })
}

function waitForFonts() {
  if (typeof document === 'undefined' || !document.fonts?.ready) {
    return Promise.resolve()
  }

  return document.fonts.ready.catch(() => {})
}

function debounce(fn, delay = 150) {
  let timeoutId = null
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

function resolveTargets(container, selector) {
  if (!container) return []
  if (container.matches?.(selector)) return [container]
  return Array.from(container.querySelectorAll(selector))
}

function splitElement(element, lineBreaks, richTextBlocks) {
  const { label, lines, words } = Array.isArray(richTextBlocks) && richTextBlocks.length
    ? prepareSplitPortableText(element, richTextBlocks, { lineBreaks })
    : prepareSplitText(element, { lineBreaks })
  if (!words.length) {
    element.classList.add('line-reveal', 'line-reveal--ready')
    return []
  }

  const lineInners = buildLineElements(element, lines, label)
  element.classList.add('line-reveal', 'line-reveal--ready')
  return lineInners
}

function restoreElement(element) {
  restoreSplitElement(element)
  element.classList.remove('line-reveal', 'line-reveal--ready', 'line-reveal--revealed')
}

export function useLineRevealAnimation(containerRef, options = {}) {
  const {
    selector = '.line-reveal',
    enabled = true,
    trigger = 'scroll',
    start = 'top 85%',
    lineStagger = 0.1,
    elementGap = 0.08,
    duration = 0.9,
    ease = 'power3.out',
    lineBreaks = 'visual',
    richTextBlocksForElement,
    maskOffset = 110,
    fade = true,
    resize = true,
    onComplete,
  } = options

  let gsap = null
  let ScrollTrigger = null
  let tween = null
  let scrollTrigger = null
  let resizeObserver = null
  let preloaderListener = null
  let splitState = []
  let hasRevealed = false
  let isInitialized = false

  function getTargets() {
    return resolveTargets(containerRef.value, selector)
  }

  function cleanupSplit() {
    splitState.forEach(({ element }) => restoreElement(element))
    splitState = []
  }

  function cleanupAnimation() {
    tween?.kill()
    scrollTrigger?.kill()
    tween = null
    scrollTrigger = null

    if (preloaderListener) {
      document.removeEventListener('preloader-complete', preloaderListener)
      preloaderListener = null
    }
  }

  function cleanupResize() {
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  function cleanup() {
    cleanupAnimation()
    cleanupResize()
    cleanupSplit()
    hasRevealed = false
    isInitialized = false
  }

  function setHiddenState() {
    if (!gsap) return

    splitState.forEach(({ lineInners }) => {
      gsap.set(lineInners, {
        yPercent: maskOffset,
        opacity: fade ? 0 : 1,
      })
    })
  }

  function setRevealedState() {
    if (!gsap) return

    splitState.forEach(({ element, lineInners }) => {
      gsap.set(lineInners, { yPercent: 0, opacity: 1 })
      element.classList.add('line-reveal--revealed')
    })
  }

  function prepareSplit() {
    cleanupSplit()

    splitState = getTargets().map((element) => ({
      element,
      lineInners: splitElement(
        element,
        lineBreaks,
        richTextBlocksForElement?.(element),
      ),
    })).filter(({ lineInners }) => lineInners.length)

    return splitState.length > 0
  }

  function playReveal() {
    if (!gsap || !splitState.length) return

    cleanupAnimation()
    setHiddenState()

    const timeline = gsap.timeline({
      onComplete: () => {
        hasRevealed = true
        splitState.forEach(({ element }) => element.classList.add('line-reveal--revealed'))
        onComplete?.()
      },
    })

    let position = 0

    splitState.forEach(({ lineInners }, elementIndex) => {
      lineInners.forEach((inner, lineIndex) => {
        const at = position + lineIndex * lineStagger
        const tweenVars = {
          yPercent: 0,
          duration,
          ease,
        }

        if (fade) tweenVars.opacity = 1

        timeline.to(inner, tweenVars, at)
      })

      if (elementIndex < splitState.length - 1) {
        position += lineInners.length * lineStagger + elementGap
      }
    })

    tween = timeline
  }

  function bindScrollTrigger() {
    const container = containerRef.value
    if (!container || !ScrollTrigger) return

    scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start,
      once: true,
      onEnter: () => playReveal(),
    })
  }

  function bindPreloaderTrigger() {
    const reveal = () => nextTick(() => playReveal())

    if (document.body.classList.contains('preloader-complete')) {
      reveal()
      return
    }

    preloaderListener = reveal
    document.addEventListener('preloader-complete', preloaderListener, { once: true })
  }

  function bindTrigger() {
    if (hasRevealed) return

    if (trigger === 'immediate') {
      playReveal()
      return
    }

    if (trigger === 'preloader') {
      bindPreloaderTrigger()
      return
    }

    bindScrollTrigger()
  }

  async function layout() {
    if (unref(enabled) === false) return false

    const modules = await getGsapModules()
    const container = containerRef.value
    if (!modules || !container) return false

    gsap = modules.gsap
    ScrollTrigger = modules.ScrollTrigger

    await waitForFonts()

    const hasLines = prepareSplit()
    if (!hasLines) return false

    if (hasRevealed) {
      setRevealedState()
      ScrollTrigger?.refresh()
      return true
    }

    setHiddenState()
    bindTrigger()
    ScrollTrigger?.refresh()
    return true
  }

  async function init() {
    if (unref(enabled) === false) return

    const ready = await layout()
    if (!ready || isInitialized) return

    isInitialized = true

    if (!resize || typeof ResizeObserver === 'undefined') return

    const debouncedLayout = debounce(async () => {
      const wasRevealed = hasRevealed
      cleanupAnimation()

      const hasLines = await layout()
      if (!hasLines) return

      if (wasRevealed) {
        hasRevealed = true
        setRevealedState()
      }
    })

    resizeObserver = new ResizeObserver(() => {
      debouncedLayout()
    })
    resizeObserver.observe(containerRef.value)
  }

  onMounted(() => {
    nextTick(() => init())
  })

  watch(
    () => unref(enabled),
    (value) => {
      if (value) {
        nextTick(() => init())
      } else {
        cleanup()
      }
    },
  )

  onUnmounted(() => {
    cleanup()
  })

  return {
    cleanup,
    init,
    replay: async () => {
      hasRevealed = false
      splitState.forEach(({ element }) => element.classList.remove('line-reveal--revealed'))
      cleanupAnimation()
      await layout()
      playReveal()
    },
  }
}
