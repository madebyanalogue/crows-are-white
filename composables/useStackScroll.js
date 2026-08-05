import { waitForScrollLayoutPaint } from '~/composables/useScrollLayoutNotify'

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

function clearPinSpacerStyles(pin) {
  if (!pin) return

  pin.style.removeProperty('width')
  pin.style.removeProperty('transform')
  pin.style.removeProperty('top')
  pin.style.removeProperty('left')

  const spacer = pin.parentElement
  if (!spacer?.classList.contains('pin-spacer')) return

  spacer.style.removeProperty('width')
  spacer.style.removeProperty('height')
  spacer.style.removeProperty('padding')
  spacer.style.removeProperty('margin')
  spacer.style.removeProperty('transform')
}

const STACK_EXIT_SCROLL = 500
const STACK_COVER_PRE_SCROLL = 1200
const STACK_COVER_REVEAL_SCROLL = 1400
const STACK_COVER_PERSPECTIVE = 1800
const STACK_COVER_SCROLL = 1000
const STACK_EXIT_TRANSLATE_PERCENT = -50
const STACK_COVER_START_PERCENT = 145
const STACK_COVER_REVEAL_ANGLE = 180
const COVER_PRIMARY_ORIGIN = '0% 50%'
const COVER_DUPLICATE_ORIGIN = '100% 50%'
const STACK_SCROLL_REVERSED = true
/** @type {'default' | 'svg' | 'three'} */
const STACK_TEAR_STRIP_MODE = 'three'
const STACK_ANIMATED_TEAR_STRIP = STACK_TEAR_STRIP_MODE === 'svg'
const STACK_COVER_STRIP_PERSPECTIVE = 800
const TEAR_SEGMENT_ORIGIN_X = 94.7
const TEAR_SEGMENT_STAGGER = 0.65
const TEAR_LINK_ROTATION_Z = 7

export { STACK_SCROLL_REVERSED, STACK_ANIMATED_TEAR_STRIP, STACK_TEAR_STRIP_MODE }

function getAnimatedTearSegments(cover) {
  return cover?.querySelectorAll('.section-stack__cover-tear-layer .tear-segment') ?? []
}

function getAnimatedTearLayer(cover) {
  return cover?.querySelector('.section-stack__cover-tear-layer') ?? null
}

function getTearSegmentTransformOrigin() {
  return `${TEAR_SEGMENT_ORIGIN_X}px 0px`
}

function getTearSegmentMotionProgress(clipCompletion, index, total) {
  if (clipCompletion <= 0 || total <= 0) return 0

  const segmentStart = total <= 1 ? 0 : (index / (total - 1)) * TEAR_SEGMENT_STAGGER
  const local = Math.max(0, Math.min(1, (clipCompletion - segmentStart) / (1 - TEAR_SEGMENT_STAGGER)))
  return local * local
}

function setAnimatedTearLayerVisible(gsap, cover, visible) {
  const layer = getAnimatedTearLayer(cover)
  if (!layer) return
  gsap.set(layer, { autoAlpha: visible ? 1 : 0 })
}

function resetAnimatedTearStrip(gsap, cover) {
  const layer = getAnimatedTearLayer(cover)
  const segments = getAnimatedTearSegments(cover)

  if (layer) {
    gsap.set(layer, { transformPerspective: STACK_COVER_STRIP_PERSPECTIVE })
    layer.classList.remove('is--strip-spiral')
  }

  if (!segments.length) return

  segments.forEach((segment) => {
    gsap.set(segment, {
      autoAlpha: 1,
      opacity: 1,
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      skewX: 0,
      skewY: 0,
      transformOrigin: getTearSegmentTransformOrigin(),
      transformPerspective: STACK_COVER_STRIP_PERSPECTIVE,
      force3D: true,
    })
  })
}

function applyAnimatedTearStripPeel(gsap, segments, coverClipProgress, cover) {
  const total = segments.length
  if (!total) return

  const layer = getAnimatedTearLayer(cover)
  const progress = Math.max(0, Math.min(1, coverClipProgress))
  const clipCompletion = 1 - progress

  layer?.classList.toggle('is--strip-spiral', clipCompletion > 0)

  segments.forEach((segment, index) => {
    const eased = getTearSegmentMotionProgress(clipCompletion, index, total)

    gsap.set(segment, {
      transformOrigin: getTearSegmentTransformOrigin(),
      transformPerspective: STACK_COVER_STRIP_PERSPECTIVE,
      force3D: true,
      autoAlpha: eased < 0.995 ? 1 : 0,
      opacity: Math.max(0.15, 1 - (eased * 0.85)),
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: TEAR_LINK_ROTATION_Z * eased,
      skewX: 0,
      skewY: 0,
    })
  })
}

function resetThreeTearStrip(tearStripThreeRef) {
  tearStripThreeRef?.value?.reset?.()
}

function applyThreeTearStripPeel(tearStripThreeRef, coverClipProgress) {
  const progress = Math.max(0, Math.min(1, coverClipProgress))
  tearStripThreeRef?.value?.setPeelProgress?.(1 - progress)
}

function applyThreeTearStripFall(tearStripThreeRef, fallProgress) {
  tearStripThreeRef?.value?.setFallProgress?.(Math.max(0, Math.min(1, fallProgress)))
}

function getThreeTearFallProgress(coverRevealProgress, coverTranslateProgress) {
  if (coverTranslateProgress > 0) return 1
  if (coverRevealProgress <= 0) return 0

  const progress = Math.max(0, Math.min(1, coverRevealProgress))
  return STACK_SCROLL_REVERSED ? 1 - progress : progress
}

function applyCoverPeel(gsap, cover, coverClipProgress, {
  tearStripMode = 'default',
  tearStripThreeRef,
  persistThreeTear = false,
} = {}) {
  const coverSegments = getCoverSegments(cover)
  const usesAlternatePeel = tearStripMode === 'svg' || tearStripMode === 'three'

  if (usesAlternatePeel && coverClipProgress > 0) {
    gsap.set(coverSegments, { autoAlpha: 0 })
  } else if (!persistThreeTear || tearStripMode !== 'three') {
    gsap.set(coverSegments, { autoAlpha: 1 })
  }

  if (tearStripMode === 'three') {
    if (coverClipProgress > 0) {
      setAnimatedTearLayerVisible(gsap, cover, true)
      applyThreeTearStripPeel(tearStripThreeRef, coverClipProgress)
    } else if (persistThreeTear) {
      gsap.set(coverSegments, { autoAlpha: 0 })
      setAnimatedTearLayerVisible(gsap, cover, true)
      tearStripThreeRef?.value?.setPeelProgress?.(1)
    } else {
      setAnimatedTearLayerVisible(gsap, cover, false)
      resetThreeTearStrip(tearStripThreeRef)
    }
    return
  }

  if (tearStripMode === 'svg') {
    if (coverClipProgress > 0) {
      setAnimatedTearLayerVisible(gsap, cover, true)
      applyAnimatedTearStripPeel(gsap, getAnimatedTearSegments(cover), coverClipProgress, cover)
    } else {
      setAnimatedTearLayerVisible(gsap, cover, false)
      resetAnimatedTearStrip(gsap, cover)
    }
    return
  }

  applyCoverSegmentPeel(gsap, coverSegments, coverClipProgress)
}

function getCoverSegments(cover) {
  return cover?.querySelectorAll('.section-stack__cover-svg--strip .section-stack__cover-segment') ?? []
}

function getCoverStripLayer(cover) {
  return cover?.querySelector('.section-stack__cover-strip-layer') ?? null
}

function setCoverStripLayerVisible(gsap, cover, visible) {
  const layer = getCoverStripLayer(cover)
  if (!layer) return
  gsap.set(layer, { autoAlpha: visible ? 1 : 0 })
}

function applyCoverSegmentPeel(gsap, segments, coverClipProgress) {
  if (!segments.length) return

  // coverClipProgress 1 = all segments visible (reversed scroll entry / forward clip end)
  // coverClipProgress 0 = fully peeled; segments hide top → bottom as progress falls
  const progress = Math.max(0, Math.min(1, coverClipProgress))
  const peeledCount = Math.min(
    segments.length,
    Math.floor((1 - progress) * segments.length + 0.0001),
  )

  segments.forEach((segment, index) => {
    gsap.set(segment, { autoAlpha: index < peeledCount ? 0 : 1 })
  })
}

function resetCoverSegments(gsap, cover) {
  const segments = getCoverSegments(cover)
  if (!segments.length) return
  gsap.set(segments, { autoAlpha: 1 })
}

function getEffectiveProgress(progress) {
  return STACK_SCROLL_REVERSED ? 1 - progress : progress
}

function resetCenterTransform(gsap, center) {
  if (!center) return
  gsap.set(center, { x: 0, xPercent: 0 })
}

function getCoverRevealLayers(cover) {
  return {
    primary: cover?.querySelector('.section-stack__cover-panel--primary') ?? null,
    duplicate: cover?.querySelector('.section-stack__cover-panel--duplicate') ?? null,
  }
}

function getCoverRevealVisualProgress(coverRevealProgress) {
  const progress = Math.max(0, Math.min(1, coverRevealProgress))
  return STACK_SCROLL_REVERSED ? 1 - progress : progress
}

function applyCoverReveal(gsap, cover, coverRevealProgress) {
  const { primary, duplicate } = getCoverRevealLayers(cover)
  if (!primary || !duplicate) return

  const visualProgress = getCoverRevealVisualProgress(coverRevealProgress)
  const angle = STACK_COVER_REVEAL_ANGLE * visualProgress

  cover.classList.add('is--cover-reveal')

  gsap.set(primary, {
    rotationY: -angle,
    transformOrigin: COVER_PRIMARY_ORIGIN,
    transformPerspective: STACK_COVER_PERSPECTIVE,
    force3D: true,
  })

  gsap.set(duplicate, {
    autoAlpha: 1,
    rotationY: angle,
    transformOrigin: COVER_DUPLICATE_ORIGIN,
    transformPerspective: STACK_COVER_PERSPECTIVE,
    force3D: true,
  })
}

function applyCoverRevealOpen(gsap, cover) {
  const { primary, duplicate } = getCoverRevealLayers(cover)
  if (!primary || !duplicate) return

  cover.classList.add('is--cover-reveal')

  gsap.set(primary, {
    rotationY: -STACK_COVER_REVEAL_ANGLE,
    transformOrigin: COVER_PRIMARY_ORIGIN,
    transformPerspective: STACK_COVER_PERSPECTIVE,
    force3D: true,
  })

  gsap.set(duplicate, {
    autoAlpha: 1,
    rotationY: STACK_COVER_REVEAL_ANGLE,
    transformOrigin: COVER_DUPLICATE_ORIGIN,
    transformPerspective: STACK_COVER_PERSPECTIVE,
    force3D: true,
  })
}

function resetCoverReveal(gsap, cover) {
  const { primary, duplicate } = getCoverRevealLayers(cover)

  cover?.classList.remove('is--cover-reveal')

  if (primary) {
    gsap.set(primary, {
      rotationY: 0,
      transformOrigin: COVER_PRIMARY_ORIGIN,
      force3D: true,
    })
  }

  if (duplicate) {
    gsap.set(duplicate, {
      autoAlpha: 0,
      rotationY: 0,
      transformOrigin: COVER_DUPLICATE_ORIGIN,
      force3D: true,
    })
  }
}

function setCoverMotion(gsap, cover, coverBackdrop, motion) {
  const targets = [cover, coverBackdrop].filter(Boolean)
  if (!targets.length) return
  gsap.set(targets, motion)
}

function resetCoverTransform(gsap, cover, coverBackdrop, { tearStripMode = 'default', tearStripThreeRef } = {}) {
  setCoverMotion(gsap, cover, coverBackdrop, {
    x: 0,
    y: 0,
    xPercent: 0,
    yPercent: STACK_COVER_START_PERCENT,
  })
  resetCoverSegments(gsap, cover)
  if (tearStripMode === 'svg') {
    resetAnimatedTearStrip(gsap, cover)
    setAnimatedTearLayerVisible(gsap, cover, false)
  }
  if (tearStripMode === 'three') {
    resetThreeTearStrip(tearStripThreeRef)
    setAnimatedTearLayerVisible(gsap, cover, false)
  }
  resetCoverReveal(gsap, cover)
  setCoverStripLayerVisible(gsap, cover, false)
}

function resetCardTransforms(gsap, cards) {
  gsap.set(cards, { x: 0, y: 0 })
}

function resetTransforms(gsap, cards, center, cover, coverBackdrop, options = {}) {
  resetCardTransforms(gsap, cards)
  resetCenterTransform(gsap, center)
  resetCoverTransform(gsap, cover, coverBackdrop, options)
}

function measureCardOffsets(cards) {
  return Array.from(cards).map((card) => card.offsetLeft)
}

function getPinLineOffset(track, pinLine) {
  if (!track || !pinLine) return 0
  return pinLine.offsetLeft - track.offsetLeft
}

function getMaxScrollOffset(cardOffsets, pinLineOffset = 0) {
  if (!cardOffsets.length) return 0
  const lastOffset = cardOffsets[cardOffsets.length - 1]
  return Math.max(0, lastOffset - pinLineOffset)
}

function getActiveIndex(scrollOffset, cardOffsets, pinLineOffset = 0, centerWidth = 0) {
  if (!cardOffsets.length) return 0

  let active = 0
  cardOffsets.forEach((offset, index) => {
    const breachThreshold = Math.max(0, offset - pinLineOffset - centerWidth)
    if (scrollOffset + 0.001 >= breachThreshold) {
      active = index
    }
  })

  return active
}

function getCopyOpacity(activeIndex, progress, itemCount, mainPhaseEnd) {
  if (itemCount <= 1) return 1
  if (activeIndex < itemCount - 1) return 1
  if (mainPhaseEnd <= 0 || progress >= mainPhaseEnd) return 0

  const mainProgress = progress / mainPhaseEnd
  const fadeStart = 0.88
  if (mainProgress <= fadeStart) return 1

  return Math.max(0, 1 - (mainProgress - fadeStart) / (1 - fadeStart))
}

function getScrollPhases(progress, maxScroll) {
  const exitEnd = maxScroll + STACK_EXIT_SCROLL
  const coverTranslateEnd = exitEnd + STACK_COVER_SCROLL
  const coverRevealEnd = coverTranslateEnd + STACK_COVER_REVEAL_SCROLL
  const totalScroll = coverRevealEnd + STACK_COVER_PRE_SCROLL
  const mainPhaseEnd = totalScroll > 0 ? maxScroll / totalScroll : 1
  const exitPhaseEnd = totalScroll > 0 ? exitEnd / totalScroll : 1
  const coverTranslatePhaseEnd = totalScroll > 0 ? coverTranslateEnd / totalScroll : 1
  const coverRevealPhaseEnd = totalScroll > 0 ? coverRevealEnd / totalScroll : 1
  const scrollDistance = progress * totalScroll

  let scrollOffset = 0
  let exitProgress = 0
  let coverClipProgress = 0
  let coverRevealProgress = 0
  let coverTranslateProgress = 0

  if (progress <= mainPhaseEnd) {
    scrollOffset = Math.min(maxScroll, scrollDistance)
  } else if (progress <= exitPhaseEnd) {
    scrollOffset = maxScroll
    exitProgress = (progress - mainPhaseEnd) / (exitPhaseEnd - mainPhaseEnd)
  } else if (progress <= coverTranslatePhaseEnd) {
    scrollOffset = maxScroll
    exitProgress = 1
    coverTranslateProgress = (progress - exitPhaseEnd) / (coverTranslatePhaseEnd - exitPhaseEnd)
  } else if (progress <= coverRevealPhaseEnd) {
    scrollOffset = maxScroll
    exitProgress = 1
    coverTranslateProgress = 1
    coverRevealProgress = (progress - coverTranslatePhaseEnd) / (coverRevealPhaseEnd - coverTranslatePhaseEnd)
  } else {
    scrollOffset = maxScroll
    exitProgress = 1
    coverTranslateProgress = 1
    coverRevealProgress = 1
    coverClipProgress = (progress - coverRevealPhaseEnd) / (1 - coverRevealPhaseEnd)
  }

  return {
    scrollOffset,
    exitProgress,
    coverClipProgress,
    coverRevealProgress,
    coverTranslateProgress,
    mainPhaseEnd,
    exitPhaseEnd,
    coverTranslatePhaseEnd,
    coverRevealPhaseEnd,
    totalScroll,
  }
}

function updateCardPositions({
  gsap,
  cards,
  cardOffsets,
  pinLineOffset,
  scrollOffset,
  itemCount,
}) {
  if (itemCount <= 1) {
    resetCardTransforms(gsap, cards)
    return
  }

  cards.forEach((card, index) => {
    const naturalLeft = cardOffsets[index] ?? card.offsetLeft
    const pinAt = naturalLeft - pinLineOffset
    const x = scrollOffset >= pinAt ? -pinAt : -scrollOffset

    gsap.set(card, { x, y: 0, force3D: true })
  })
}

function shouldHidePin(itemCount, enabled) {
  return enabled.value && itemCount.value > 1
}

export function useStackScroll({
  sectionRef,
  pinRef,
  centerRef,
  coverRef,
  coverBackdropRef,
  pinLineRef,
  trackRef,
  tearStripThreeRef,
  itemCount,
  onActiveChange,
  enabled,
  tearStripMode = STACK_TEAR_STRIP_MODE,
}) {
  let scrollTrigger = null
  let gsapContext = null
  let gsapInstance = null
  let ScrollTriggerInstance = null
  let resizeObserver = null
  let cardOffsets = []
  let initPromise = null
  let isSuspended = false
  const stackReady = ref(false)
  const headerStackPinned = useHeaderStackPinned()
  const isTransitioning = useState('pageTransitioning', () => false)

  function hidePin() {
    if (!shouldHidePin(itemCount, enabled)) return
    pinRef.value?.style.setProperty('visibility', 'hidden')
  }

  function showPin() {
    pinRef.value?.style.removeProperty('visibility')
  }

  async function markStackReady(section) {
    await waitForScrollLayoutPaint()
    if (!sectionRef.value || sectionRef.value !== section) return
    section.classList.add('is--stack-ready')
    showPin()
    stackReady.value = true
  }

  function getCards() {
    return trackRef.value?.querySelectorAll('.section-stack__card') ?? []
  }

  function measureLayout(gsap) {
    const track = trackRef.value
    const cards = getCards()
    if (!track || !cards.length) {
      return { cardOffsets: [], pinLineOffset: 0, centerWidth: 0, maxScroll: 0 }
    }

    resetCardTransforms(gsap, cards)
    resetCenterTransform(gsap, centerRef.value)
    resetCoverTransform(gsap, coverRef.value, coverBackdropRef.value, { tearStripMode, tearStripThreeRef })
    cardOffsets = measureCardOffsets(cards)
    const pinLineOffset = getPinLineOffset(track, pinLineRef.value)
    const centerWidth = centerRef.value?.offsetWidth ?? 0

    return {
      cardOffsets,
      pinLineOffset,
      centerWidth,
      maxScroll: getMaxScrollOffset(cardOffsets, pinLineOffset),
    }
  }

  async function init() {
    if (!enabled.value) return
    if (initPromise) return initPromise

    initPromise = initStack()
    try {
      await initPromise
    } finally {
      initPromise = null
    }
  }

  async function initStack() {
    if (!enabled.value) return

    const modules = await getGsapModules()
    const section = sectionRef.value
    const pin = pinRef.value
    const track = trackRef.value
    const center = centerRef.value
    const cover = coverRef.value
    const coverBackdrop = coverBackdropRef.value

    if (!modules || !section || !pin || !track || !center || !cover || !coverBackdrop) return

    const { gsap, ScrollTrigger } = modules
    gsapInstance = gsap
    ScrollTriggerInstance = ScrollTrigger
    const count = itemCount.value
    const cards = getCards()

    stackReady.value = false
    section.classList.remove('is--stack-ready')
    detachScrollAnimation({ resetVisualState: true })

    if (!cards.length) return

    try {
      resetTransforms(gsap, cards, center, cover, coverBackdrop, { tearStripMode, tearStripThreeRef })

      if (count <= 1) {
        onActiveChange?.({ index: 0, copyOpacity: 1 })
        await markStackReady(section)
        return
      }

      const layout = measureLayout(gsap)

    function applyProgress(progress) {
      const effectiveProgress = getEffectiveProgress(progress)
      const {
        scrollOffset,
        exitProgress,
        coverClipProgress,
        coverRevealProgress,
        coverTranslateProgress,
        mainPhaseEnd,
      } = getScrollPhases(effectiveProgress, layout.maxScroll)

      updateCardPositions({
        gsap,
        cards,
        cardOffsets: layout.cardOffsets,
        pinLineOffset: layout.pinLineOffset,
        scrollOffset,
        itemCount: count,
      })

      gsap.set(center, {
        xPercent: STACK_EXIT_TRANSLATE_PERCENT * exitProgress,
        force3D: true,
      })

      const lastCard = cards[cards.length - 1]
      const lastCardOffset = layout.cardOffsets[cards.length - 1] ?? 0
      const lastCardX = lastCard ? Number(gsap.getProperty(lastCard, 'x') || 0) : 0
      const coverX = lastCardOffset + lastCardX
      const peelOptions = { tearStripMode, tearStripThreeRef }
      const tearFallProgress = tearStripMode === 'three'
        ? getThreeTearFallProgress(coverRevealProgress, coverTranslateProgress)
        : 0

      if (coverClipProgress > 0) {
        setCoverStripLayerVisible(gsap, cover, true)
        applyCoverPeel(gsap, cover, coverClipProgress, peelOptions)
        if (tearStripMode === 'three') {
          applyThreeTearStripFall(tearStripThreeRef, 0)
        }
        resetCoverReveal(gsap, cover)

        setCoverMotion(gsap, cover, coverBackdrop, {
          x: coverX,
          yPercent: 0,
          force3D: true,
        })
      } else if (coverRevealProgress > 0) {
        setCoverStripLayerVisible(gsap, cover, false)
        applyCoverPeel(gsap, cover, 0, {
          ...peelOptions,
          persistThreeTear: tearStripMode === 'three',
        })
        if (tearStripMode === 'three') {
          applyThreeTearStripFall(tearStripThreeRef, tearFallProgress)
        }
        applyCoverReveal(gsap, cover, coverRevealProgress)

        setCoverMotion(gsap, cover, coverBackdrop, {
          x: coverX,
          yPercent: 0,
          force3D: true,
        })
      } else if (coverTranslateProgress > 0) {
        setCoverStripLayerVisible(gsap, cover, false)
        applyCoverPeel(gsap, cover, 0, {
          ...peelOptions,
          persistThreeTear: tearStripMode === 'three',
        })
        if (tearStripMode === 'three') {
          applyThreeTearStripFall(tearStripThreeRef, tearFallProgress)
        }
        applyCoverRevealOpen(gsap, cover)

        setCoverMotion(gsap, cover, coverBackdrop, {
          x: coverX,
          yPercent: STACK_COVER_START_PERCENT * (1 - coverTranslateProgress),
          force3D: true,
        })
      } else {
        setCoverStripLayerVisible(gsap, cover, false)
        applyCoverPeel(gsap, cover, 1, peelOptions)
        if (tearStripMode === 'three') {
          applyThreeTearStripFall(tearStripThreeRef, 0)
        }
        resetCoverReveal(gsap, cover)

        setCoverMotion(gsap, cover, coverBackdrop, {
          x: coverX,
          yPercent: STACK_COVER_START_PERCENT,
          force3D: true,
        })
      }

      const index = getActiveIndex(
        scrollOffset,
        layout.cardOffsets,
        layout.pinLineOffset,
        layout.centerWidth,
      )

      onActiveChange?.({
        index,
        copyOpacity: getCopyOpacity(index, effectiveProgress, count, mainPhaseEnd),
      })
    }

    gsapContext = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${getHeaderOffset()}`,
          end: () => `+=${layout.maxScroll + STACK_EXIT_SCROLL + STACK_COVER_SCROLL + STACK_COVER_REVEAL_SCROLL + STACK_COVER_PRE_SCROLL}`,
          pin,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyProgress(self.progress),
          onRefresh: (self) => {
            Object.assign(layout, measureLayout(gsap))
            applyProgress(self.progress)
            if (tearStripMode === 'three') {
              tearStripThreeRef?.value?.resize?.()
            }
            resetPinSpacerWidth(self)
          },
          onToggle: (self) => {
            headerStackPinned.value = self.isActive
            resetPinSpacerWidth(self)
          },
        },
      })

      timeline.to({}, { duration: 1 })
      scrollTrigger = timeline.scrollTrigger
    }, section)

    ScrollTrigger.refresh()
    resetPinSpacerWidth(scrollTrigger)
    applyProgress(scrollTrigger?.progress ?? 0)
    headerStackPinned.value = scrollTrigger?.isActive ?? false
    await markStackReady(section)

    section.querySelectorAll('img').forEach((image) => {
      if (image.complete) return
      image.addEventListener('load', refresh, { once: true })
    })
    } catch {
      await markStackReady(section)
    }
  }

  function refresh() {
    if (isSuspended || !scrollTrigger) return
    scrollTrigger.refresh()
    resetPinSpacerWidth(scrollTrigger)
  }

  function detachScrollAnimation({ resetVisualState = true } = {}) {
    const section = sectionRef.value
    const cards = getCards()
    const center = centerRef.value
    const cover = coverRef.value
    const coverBackdrop = coverBackdropRef.value

    isSuspended = false
    section?.classList.remove('is--stack-suspended')

    if (resetVisualState && gsapInstance && cards.length) {
      resetTransforms(gsapInstance, cards, center, cover, coverBackdrop, { tearStripMode, tearStripThreeRef })
    }

    if (scrollTrigger) {
      scrollTrigger.enable()
      scrollTrigger.kill(true)
    }
    scrollTrigger = null

    gsapContext?.revert()
    gsapContext = null

    headerStackPinned.value = false
    cardOffsets = []

    clearPinSpacerStyles(pinRef.value)
    ScrollTriggerInstance?.refresh()
  }

  function freezePinPosition() {
    const pin = pinRef.value
    if (!gsapInstance || !pin || !isSuspended) return

    const rect = pin.getBoundingClientRect()
    gsapInstance.set(pin, {
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      margin: 0,
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      zIndex: 20,
    })
  }

  function suspendForNavigation() {
    if (!scrollTrigger || isSuspended) return

    isSuspended = true
    scrollTrigger.disable(false)
    headerStackPinned.value = false
    freezePinPosition()

    const section = sectionRef.value
    section?.classList.add('is--stack-suspended', 'is--stack-ready')
    showPin()
  }

  function suspendForPageLeave(event) {
    const section = sectionRef.value
    const leavingRoot = event?.detail?.leavingRoot
    if (!section || !leavingRoot?.contains(section)) return
    suspendForNavigation()
    requestAnimationFrame(() => freezePinPosition())
  }

  function handleScrollSystemReady() {
    if (!stackReady.value) return
    refresh()
  }

  function onPageTransitionComplete() {
    if (enabled.value && !stackReady.value) {
      init()
    }
  }

  function cleanup() {
    sectionRef.value?.classList.remove('is--stack-ready')
    stackReady.value = false
    hidePin()

    resizeObserver?.disconnect()
    resizeObserver = null

    detachScrollAnimation({ resetVisualState: true })

    gsapInstance = null
    ScrollTriggerInstance = null
  }

  useAfterPageTransition(() => init())

  onBeforeRouteLeave(() => {
    suspendForNavigation()
  })

  watch(
    [pinRef, enabled, itemCount],
    () => {
      if (stackReady.value) return
      hidePin()
    },
    { flush: 'sync', immediate: true },
  )

  onMounted(() => {
    if (!import.meta.client) return

    hidePin()
    document.addEventListener('crows:page-transition-before-leave', suspendForPageLeave)
    document.addEventListener('crows:scroll-system-ready', handleScrollSystemReady)
    document.addEventListener('page-transition-complete', onPageTransitionComplete)

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => refresh())
      if (centerRef.value) resizeObserver.observe(centerRef.value)
      if (trackRef.value) resizeObserver.observe(trackRef.value)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('crows:page-transition-before-leave', suspendForPageLeave)
    document.removeEventListener('crows:scroll-system-ready', handleScrollSystemReady)
    document.removeEventListener('page-transition-complete', onPageTransitionComplete)
    cleanup()
  })

  watch(enabled, (value) => {
    if (value) {
      hidePin()
      if (!isTransitioning.value) init()
    } else {
      cleanup()
    }
  })

  return { init, cleanup, refresh, stackReady }
}
