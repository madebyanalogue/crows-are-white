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

function getMaxScroll(pin, track) {
  if (!pin || !track) return 0
  return Math.max(0, track.scrollWidth - pin.clientWidth)
}

const HORIZONTAL_GALLERY_TITLE_INTRO_SCROLL = 600

function getTotalScroll({ maxScroll, hasTitleIntro }) {
  return (hasTitleIntro ? HORIZONTAL_GALLERY_TITLE_INTRO_SCROLL : 0) + maxScroll
}

function getTitleIntroPortion({ maxScroll, hasTitleIntro }) {
  const total = getTotalScroll({ maxScroll, hasTitleIntro })
  if (!hasTitleIntro || total <= 0) return 0
  return HORIZONTAL_GALLERY_TITLE_INTRO_SCROLL / total
}

function getTrackProgress(clampedProgress, titleIntroPortion, hasTitleIntro) {
  if (!hasTitleIntro || titleIntroPortion >= 1) return clampedProgress
  return Math.max(0, Math.min(1, (clampedProgress - titleIntroPortion) / (1 - titleIntroPortion)))
}

export function useHorizontalGalleryScroll({
  sectionRef,
  pinRef,
  trackRef,
  titleRef,
  itemsRef,
  hasTitle,
  enabled,
}) {
  let scrollTrigger = null
  let gsapContext = null
  let gsapInstance = null
  let resizeObserver = null

  function measureLayout() {
    const pin = pinRef.value
    const track = trackRef.value
    const title = titleRef?.value ?? null
    const items = itemsRef?.value ?? null
    const maxScroll = getMaxScroll(pin, track)
    const hasTitleIntro = Boolean(hasTitle?.value && title)
    const itemsOffset = items?.offsetLeft ?? 0

    return {
      maxScroll,
      hasTitleIntro,
      totalScroll: getTotalScroll({ maxScroll, hasTitleIntro }),
      titleIntroPortion: getTitleIntroPortion({ maxScroll, hasTitleIntro }),
      itemsOffset,
    }
  }

  function resetAnimationState(gsap, track, title) {
    if (track) gsap.set(track, { x: 0, xPercent: 0 })
    if (title) gsap.set(title, { opacity: 1 })
  }

  function getTitleOpacity(layout, clampedProgress) {
    if (!layout.hasTitleIntro) return 1

    if (clampedProgress < layout.titleIntroPortion) {
      const fadeIn = layout.titleIntroPortion > 0
        ? clampedProgress / layout.titleIntroPortion
        : 1
      return 1 - (1 - fadeIn) ** 2
    }

    const trackProgress = getTrackProgress(
      clampedProgress,
      layout.titleIntroPortion,
      layout.hasTitleIntro,
    )
    const trackX = layout.maxScroll * trackProgress

    return trackX < layout.itemsOffset ? 1 : 0
  }

  function applyProgress(gsap, progress) {
    const layout = measureLayout()
    const title = titleRef?.value ?? null
    const track = trackRef.value
    const clampedProgress = Math.max(0, Math.min(1, progress))

    if (layout.hasTitleIntro && title) {
      gsap.set(title, { opacity: getTitleOpacity(layout, clampedProgress) })
    }

    if (layout.maxScroll > 0 && track) {
      const trackProgress = getTrackProgress(
        clampedProgress,
        layout.titleIntroPortion,
        layout.hasTitleIntro,
      )

      gsap.set(track, { x: -layout.maxScroll * trackProgress })
    }
  }

  async function init() {
    if (!enabled.value) return

    const modules = await getGsapModules()
    const section = sectionRef.value
    const pin = pinRef.value
    const track = trackRef.value
    const title = titleRef?.value ?? null

    if (!modules || !section || !pin || !track) return

    const { gsap, ScrollTrigger } = modules

    cleanup()

    gsapInstance = gsap

    const layout = measureLayout()

    if (layout.totalScroll <= 0) {
      resetAnimationState(gsap, track, title)
      section.classList.add('is--horizontal-gallery-ready')
      return
    }

    gsap.set(track, { x: 0, xPercent: 0 })
    if (layout.hasTitleIntro) {
      gsap.set(title, { opacity: 0 })
    }

    gsapContext = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${getHeaderOffset()}`,
          end: () => `+=${measureLayout().totalScroll}`,
          pin,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyProgress(gsap, self.progress),
          onRefresh: (self) => {
            Object.assign(layout, measureLayout())
            applyProgress(gsap, self.progress)
            resetPinSpacerWidth(self)
          },
          onToggle: (self) => resetPinSpacerWidth(self),
        },
      })

      timeline.to({}, { duration: 1 })

      scrollTrigger = timeline.scrollTrigger
    }, section)

    ScrollTrigger.refresh()
    resetPinSpacerWidth(scrollTrigger)
    applyProgress(gsap, scrollTrigger?.progress ?? 0)
    section.classList.add('is--horizontal-gallery-ready')

    section.querySelectorAll('img').forEach((image) => {
      if (image.complete) return
      image.addEventListener('load', refresh, { once: true })
    })
  }

  function refresh() {
    if (!scrollTrigger) return
    scrollTrigger.refresh()
    resetPinSpacerWidth(scrollTrigger)
    if (gsapInstance) {
      applyProgress(gsapInstance, scrollTrigger.progress ?? 0)
    }
  }

  function cleanup() {
    const section = sectionRef.value
    const track = trackRef.value
    const title = titleRef?.value ?? null
    const gsap = gsapInstance

    section?.classList.remove('is--horizontal-gallery-ready')

    resizeObserver?.disconnect()
    resizeObserver = null

    gsapContext?.revert()
    gsapContext = null

    scrollTrigger?.kill()
    scrollTrigger = null
    gsapInstance = null

    if (gsap) {
      resetAnimationState(gsap, track, title)
    }
  }

  useAfterPageTransition(() => init())

  onMounted(() => {
    if (!import.meta.client) return

    document.addEventListener('crows:scroll-system-ready', refresh)

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(refresh)
      if (trackRef.value) resizeObserver.observe(trackRef.value)
      if (pinRef.value) resizeObserver.observe(pinRef.value)
      if (titleRef?.value) resizeObserver.observe(titleRef.value)
      if (itemsRef?.value) resizeObserver.observe(itemsRef.value)
    }
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
