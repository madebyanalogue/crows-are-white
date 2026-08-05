let gsapModulesPromise = null

const FEATURED_POST_SCROLL = 1200

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

function getHeaderOffset() {
  if (typeof window === 'undefined') return 0
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--header-height')
    .trim()
  return Number.parseFloat(value) || 0
}

function resetPinSpacerWidth(trigger) {
  const pin = trigger?.pin
  if (!pin) return

  pin.style.width = '100%'

  const spacer = pin.parentElement
  if (spacer?.classList.contains('pin-spacer')) {
    spacer.style.width = '100%'
  }
}

function resetAnimationState(gsap, figure, main, mediaInner, mediaLink) {
  if (figure) gsap.set(figure, { x: 0, xPercent: 0 })
  if (main) gsap.set(main, { opacity: 1 })
  if (mediaInner) gsap.set(mediaInner, { opacity: 1 })
  if (mediaLink) gsap.set(mediaLink, { opacity: 1 })
}

const FADE_DURATION = 0.5
const LINK_FADE_OFFSET = 0.2
const LINK_FADE_DURATION = 0.35

export function useFeaturedPostScroll({
  sectionRef,
  pinRef,
  figureRef,
  mainRef,
  mediaInnerRef,
  mediaLinkRef,
  enabled,
}) {
  let scrollTrigger = null
  let gsapContext = null
  let gsapInstance = null

  async function init() {
    if (!enabled.value) return

    const modules = await getGsapModules()
    const section = sectionRef.value
    const pin = pinRef.value
    const figure = figureRef.value
    const main = mainRef.value
    const mediaInner = mediaInnerRef.value
    const mediaLink = mediaLinkRef?.value ?? null

    if (!modules || !section || !pin || !figure || !main || !mediaInner) return

    const { gsap, ScrollTrigger } = modules

    cleanup()

    gsapInstance = gsap
    gsap.set(figure, { x: 0, xPercent: 0 })
    gsap.set(main, { opacity: 1 })
    gsap.set(mediaInner, { opacity: 0 })
    if (mediaLink) gsap.set(mediaLink, { opacity: 0 })

    gsapContext = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${getHeaderOffset()}`,
          end: () => `+=${FEATURED_POST_SCROLL}`,
          pin,
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: (self) => resetPinSpacerWidth(self),
          onToggle: (self) => resetPinSpacerWidth(self),
        },
      })

      timeline.to(figure, {
        xPercent: -100,
        ease: 'power3.inOut',
        duration: 1,
      }, 0)

      timeline.to(main, {
        opacity: 0,
        ease: 'none',
        duration: FADE_DURATION,
      }, 0)

      timeline.to(mediaInner, {
        opacity: 1,
        ease: 'none',
        duration: FADE_DURATION,
      }, FADE_DURATION)

      if (mediaLink) {
        timeline.to(mediaLink, {
          opacity: 1,
          ease: 'none',
          duration: LINK_FADE_DURATION,
        }, FADE_DURATION + LINK_FADE_OFFSET)
      }

      scrollTrigger = timeline.scrollTrigger
    }, section)

    ScrollTrigger.refresh()
    resetPinSpacerWidth(scrollTrigger)
    section.classList.add('is--featured-post-ready')
  }

  function refresh() {
    if (!scrollTrigger) return
    scrollTrigger.refresh()
    resetPinSpacerWidth(scrollTrigger)
  }

  function cleanup() {
    const section = sectionRef.value
    section?.classList.remove('is--featured-post-ready')

    const gsap = gsapInstance
    const figure = figureRef.value
    const main = mainRef.value
    const mediaInner = mediaInnerRef.value
    const mediaLink = mediaLinkRef?.value ?? null

    gsapContext?.revert()
    gsapContext = null

    scrollTrigger?.kill()
    scrollTrigger = null
    gsapInstance = null

    if (gsap) {
      resetAnimationState(gsap, figure, main, mediaInner, mediaLink)
    }
  }

  useAfterPageTransition(() => init())

  onMounted(() => {
    if (!import.meta.client) return
    document.addEventListener('crows:scroll-system-ready', refresh)
  })

  onUnmounted(() => {
    document.removeEventListener('crows:scroll-system-ready', refresh)
    cleanup()
  })

  watch(enabled, (value) => {
    if (value) init()
    else cleanup()
  })

  return { init, cleanup, refresh }
}
