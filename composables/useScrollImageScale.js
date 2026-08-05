import { useAfterPageTransition } from '~/composables/useAfterPageTransition'
import { waitForScrollLayoutPaint } from '~/composables/useScrollLayoutNotify'
import { getAppImagePatternTransformOrigin, isAppImagePattern } from '~/utils/appImagePatterns'

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

export function useScrollImageScale(imageRef, options = {}) {
  const {
    from = 1.1,
    to = 1,
    start = 'top bottom',
    end = 'bottom top',
    overlay = null,
    overlayRef = null,
    wipeRef = null,
    wipeFrom = 1,
    wipeTo = 0,
    wipeStart = 'top 85%',
    wipeDuration = 0.8,
    wipeEase = 'power2.out',
    patternFrom = 0,
    patternTo = 1,
    patternStart = 'top 92%',
    patternEnd = 'center center',
  } = options

  const overlayMode = overlay ?? (wipeRef ? 'wipe' : null)

  let scaleTween = null
  let overlayTween = null
  let scaleScrollTrigger = null
  let imageLoadHandler = null

  function getOverlayElement() {
    const target = unref(overlayRef ?? wipeRef)
    return target?.el ?? target
  }

  function syncScaleProgress(progress = scaleScrollTrigger?.progress) {
    if (!scaleTween || progress === undefined) return
    scaleTween.progress(progress)
  }

  function syncOverlayProgress() {
    const overlayProgress = overlayTween?.scrollTrigger?.progress
    if (!overlayTween || overlayProgress === undefined) return
    overlayTween.progress(overlayProgress)
  }

  async function markScaleReady(image, overlayEl) {
    syncScaleProgress()
    syncOverlayProgress()
    await waitForScrollLayoutPaint()
    if (!image) return
    image.dataset.scaleReady = 'true'
    if (overlayEl && isAppImagePattern(overlayMode)) {
      overlayEl.dataset.patternReady = 'true'
    }
  }

  function refreshScrollTriggers() {
    scaleScrollTrigger?.refresh()
    syncScaleProgress()
    overlayTween?.scrollTrigger?.refresh()
    syncOverlayProgress()
  }

  async function init() {
    const modules = await getGsapModules()
    const image = imageRef.value
    const overlayEl = getOverlayElement()
    if (!modules || !image) return
    if (overlayMode && !overlayEl) return

    const { gsap } = modules
    const trigger = image.parentElement
    if (!trigger) return

    cleanup()

    scaleTween = gsap.fromTo(
      image,
      { scale: from, transformOrigin: 'center center' },
      {
        scale: to,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub: true,
          onRefresh: (self) => syncScaleProgress(self.progress),
        },
      },
    )
    scaleScrollTrigger = scaleTween.scrollTrigger

    if (overlayMode === 'wipe' && overlayEl) {
      gsap.set(overlayEl, { scaleY: wipeFrom, transformOrigin: 'bottom center' })

      overlayTween = gsap.to(overlayEl, {
        scaleY: wipeTo,
        duration: wipeDuration,
        ease: wipeEase,
        scrollTrigger: {
          trigger,
          start: wipeStart,
          once: true,
        },
      })
    } else if (isAppImagePattern(overlayMode) && overlayEl) {
      const patternTransformOrigin = getAppImagePatternTransformOrigin(overlayMode)
      gsap.set(overlayEl, { scaleY: patternFrom, transformOrigin: patternTransformOrigin })

      overlayTween = gsap.fromTo(
        overlayEl,
        { scaleY: patternFrom },
        {
          scaleY: patternTo,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger,
            start: patternStart,
            end: patternEnd,
            scrub: true,
          },
        },
      )
    }

    await markScaleReady(image, overlayEl)

    imageLoadHandler = () => refreshScrollTriggers()
    image.addEventListener('load', imageLoadHandler)
    if (image.complete) {
      refreshScrollTriggers()
    }
  }

  function cleanup() {
    scaleScrollTrigger?.kill()
    scaleScrollTrigger = null
    scaleTween?.kill()
    scaleTween = null

    overlayTween?.scrollTrigger?.kill()
    overlayTween?.kill()
    overlayTween = null

    const image = imageRef.value
    if (image) {
      if (imageLoadHandler) {
        image.removeEventListener('load', imageLoadHandler)
        imageLoadHandler = null
      }
      delete image.dataset.scaleReady
      image.style.removeProperty('transform')
      image.style.removeProperty('transform-origin')
    }

    const overlayEl = getOverlayElement()
    if (overlayEl) {
      delete overlayEl.dataset.patternReady
      overlayEl.style.removeProperty('transform')
      overlayEl.style.removeProperty('transform-origin')
    }
  }

  function handleScrollSystemReady() {
    if (!scaleTween) return
    refreshScrollTriggers()
  }

  useAfterPageTransition(() => nextTick(() => init()))

  onMounted(() => {
    document.addEventListener('crows:scroll-system-ready', handleScrollSystemReady)
  })

  onUnmounted(() => {
    document.removeEventListener('crows:scroll-system-ready', handleScrollSystemReady)
    cleanup()
  })

  return { init, cleanup }
}
