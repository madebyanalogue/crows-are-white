const MENU_PANEL_EASE = 'power3.inOut'
const MENU_ITEM_EASE = 'power3.out'
export const MOBILE_MENU_OPEN_DURATION = 0.6
export const MOBILE_MENU_CLOSE_DURATION = 0.45
const OPEN_DURATION = MOBILE_MENU_OPEN_DURATION
const CLOSE_DURATION = MOBILE_MENU_CLOSE_DURATION
const ITEM_STAGGER = 0.065
const ITEM_OPEN_DURATION = 0.5
const ITEM_OPEN_START = OPEN_DURATION - 0.1
const ITEM_CLOSE_DURATION = 0.2
const CLOSE_PANEL_START = 0.08
// Panel edge reaches the left toggle once ~22% through the slide (400px drawer).
const TOGGLE_COVER_PROGRESS = 0.22
const TOGGLE_UNCOVER_PROGRESS = 0.88

let gsapPromise = null

function getGsap() {
  if (!import.meta.client) return Promise.resolve(null)
  if (!gsapPromise) {
    gsapPromise = import('gsap').then(({ default: gsap }) => gsap)
  }
  return gsapPromise
}

function prefersReducedMotion() {
  return import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isDismissibleMobileMenuViewport() {
  return import.meta.client
    && window.matchMedia('(min-width: 1000px) and (max-width: 1399px)').matches
}

export function useMobileMenuAnimation(isOpen, {
  shellRef,
  panelRef,
  toolbarClipRef,
  backdropRef,
  toggleOverPanelRef,
}) {
  let timeline = null
  let isReady = false

  const TOOLBAR_CLIP_CLOSED = 'inset(0 100% 0 0)'
  const TOOLBAR_CLIP_OPEN = 'inset(0 0% 0 0)'

  function setToolbarClipClosed(gsap) {
    if (!toolbarClipRef?.value) return
    gsap.set(toolbarClipRef.value, {
      clipPath: TOOLBAR_CLIP_CLOSED,
      clearProps: 'transform,x,xPercent',
    })
  }

  function setToolbarClipOpen(gsap) {
    if (!toolbarClipRef?.value) return
    gsap.set(toolbarClipRef.value, {
      clipPath: TOOLBAR_CLIP_OPEN,
      clearProps: 'transform,x,xPercent',
    })
  }

  function setToggleOverPanel(covered) {
    if (toggleOverPanelRef) {
      toggleOverPanelRef.value = covered
    }
  }

  function scheduleToggleCoverOnOpen(tl) {
    if (!isDismissibleMobileMenuViewport()) return

    tl.call(
      () => setToggleOverPanel(true),
      [],
      OPEN_DURATION * TOGGLE_COVER_PROGRESS,
    )
  }

  function scheduleToggleUncoverOnClose(tl) {
    if (!isDismissibleMobileMenuViewport()) return
    tl.call(
      () => setToggleOverPanel(false),
      [],
      CLOSE_PANEL_START + CLOSE_DURATION * TOGGLE_UNCOVER_PROGRESS,
    )
  }

function setBackdropInteractivity(gsap, interactive) {
  if (!backdropRef.value) return
  gsap.set(backdropRef.value, {
    pointerEvents: interactive ? 'auto' : 'none',
  })
}

  function getLinks() {
    return panelRef.value?.querySelectorAll('.header__mobile-item .menu-link') ?? []
  }

  function getDividers() {
    return panelRef.value?.querySelectorAll('.header__mobile-item .menu-item__divider') ?? []
  }

  function getAnimatedElements() {
    return [...getLinks(), ...getDividers()]
  }

  function setItemsHidden(gsap) {
    const links = getLinks()
    const dividers = getDividers()

    if (links.length) {
      gsap.set(links, { opacity: 0, x: -24, clearProps: 'transition' })
    }

    if (dividers.length) {
      gsap.set(dividers, { opacity: 0 })
    }
  }

  function setItemsVisible(gsap) {
    const links = getLinks()
    const dividers = getDividers()

    if (links.length) {
      gsap.set(links, { opacity: 1, x: 0 })
    }

    if (dividers.length) {
      gsap.set(dividers, { opacity: 1 })
    }
  }

  async function setClosedInstant() {
    const gsap = await getGsap()
    if (!gsap || !shellRef.value || !panelRef.value) return

    const animatedElements = getAnimatedElements()

    timeline?.kill()
    gsap.killTweensOf([
      shellRef.value,
      panelRef.value,
      toolbarClipRef?.value,
      backdropRef.value,
      ...animatedElements,
    ])

    gsap.set(shellRef.value, {
      visibility: 'hidden',
      pointerEvents: 'none',
    })

    gsap.set(panelRef.value, {
      xPercent: -100,
      clearProps: 'yPercent,clipPath',
    })
    setToolbarClipClosed(gsap)

    if (backdropRef.value) {
      gsap.set(backdropRef.value, {
        opacity: 0,
        visibility: 'hidden',
      })
      setBackdropInteractivity(gsap, false)
    }

    setItemsHidden(gsap)
    setToggleOverPanel(false)
  }

  async function animateOpen() {
    const gsap = await getGsap()
    if (!gsap || !shellRef.value || !panelRef.value) return

    timeline?.kill()
    setToggleOverPanel(false)
    await nextTick()

    const links = getLinks()
    const dividers = getDividers()

    if (prefersReducedMotion()) {
      gsap.set(shellRef.value, { visibility: 'visible', pointerEvents: 'none' })
      gsap.set(panelRef.value, { xPercent: 0 })
      setToolbarClipOpen(gsap)
      if (backdropRef.value) {
        gsap.set(backdropRef.value, { opacity: 1, visibility: 'visible' })
        setBackdropInteractivity(gsap, true)
      }
      setItemsVisible(gsap)
      setToggleOverPanel(true)
      return
    }

    gsap.set(shellRef.value, { visibility: 'visible', pointerEvents: 'none' })
    gsap.set(panelRef.value, { xPercent: -100 })
    setToolbarClipClosed(gsap)

    if (!isDismissibleMobileMenuViewport()) {
      setToggleOverPanel(true)
    }

    if (backdropRef.value) {
      gsap.set(backdropRef.value, {
        opacity: 0,
        visibility: 'visible',
      })
      setBackdropInteractivity(gsap, true)
    }

    setItemsHidden(gsap)

    timeline = gsap.timeline()

    timeline
      .to(
        panelRef.value,
        {
          xPercent: 0,
          duration: OPEN_DURATION,
          ease: MENU_PANEL_EASE,
          force3D: true,
        },
        0,
      )
      .to(
        backdropRef.value,
        { opacity: 1, duration: OPEN_DURATION * 0.75, ease: MENU_ITEM_EASE },
        0,
      )

    if (toolbarClipRef?.value) {
      timeline.to(
        toolbarClipRef.value,
        {
          clipPath: TOOLBAR_CLIP_OPEN,
          duration: OPEN_DURATION,
          ease: MENU_PANEL_EASE,
        },
        0,
      )
    }

    if (links.length) {
      timeline.to(
        links,
        {
          opacity: 1,
          x: 0,
          duration: ITEM_OPEN_DURATION,
          stagger: ITEM_STAGGER,
          ease: MENU_ITEM_EASE,
        },
        ITEM_OPEN_START,
      )
    }

    if (dividers.length) {
      timeline.to(
        dividers,
        {
          opacity: 1,
          duration: ITEM_OPEN_DURATION,
          ease: MENU_ITEM_EASE,
        },
        ITEM_OPEN_START,
      )
    }

    scheduleToggleCoverOnOpen(timeline)
  }

  async function animateClose() {
    const gsap = await getGsap()
    if (!gsap || !shellRef.value || !panelRef.value) return

    timeline?.kill()

    const animatedElements = getAnimatedElements()

    if (prefersReducedMotion()) {
      setToggleOverPanel(false)
      await setClosedInstant()
      return
    }

    timeline = gsap.timeline({
      onComplete: () => {
        setToggleOverPanel(false)
        setClosedInstant()
      },
    })

    timeline
      .to(
        animatedElements,
        { opacity: 0, duration: ITEM_CLOSE_DURATION, ease: 'power2.in' },
        0,
      )
      .to(
        panelRef.value,
        {
          xPercent: -100,
          duration: CLOSE_DURATION,
          ease: MENU_PANEL_EASE,
          force3D: true,
        },
        0.08,
      )
      .to(
        backdropRef.value,
        { opacity: 0, duration: CLOSE_DURATION * 0.7, ease: 'power2.in' },
        0.12,
      )

    if (toolbarClipRef?.value) {
      timeline.to(
        toolbarClipRef.value,
        {
          clipPath: TOOLBAR_CLIP_CLOSED,
          duration: CLOSE_DURATION,
          ease: MENU_PANEL_EASE,
        },
        0.08,
      )
    }

    scheduleToggleUncoverOnClose(timeline)
  }

  watch(isOpen, async (open) => {
    if (!import.meta.client || !isReady) return
    await nextTick()
    if (open) {
      await animateOpen()
    } else {
      await animateClose()
    }
  })

  onMounted(async () => {
    await nextTick()
    await setClosedInstant()
    isReady = true
    if (isOpen.value) {
      await nextTick()
      await animateOpen()
    }
  })

  onUnmounted(() => {
    timeline?.kill()
  })
}
