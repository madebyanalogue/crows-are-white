import {
  lockScrollSystem,
  scheduleScrollSystemSettle,
  waitForScrollLayoutPaint,
} from '~/composables/useScrollLayoutNotify'
import { scrollRouteHashWhenReady } from '~/composables/useMenuLinks'
import { applyPendingPageColors } from '~/composables/usePageColor'
import {
  DEFAULT_PAGE_TRANSITION_WIPE_COLOR,
  resolvePageColorCssValue,
} from '~/utils/pageColors'

export const LEAVE_PAGE_DURATION = 0.7
export const WIPE_COVER_DURATION = 0.7
export const WIPE_PAUSE_DURATION = 0.15
export const ENTER_DURATION = 0.7
export const WIPE_REVEAL_DURATION = ENTER_DURATION
export const CONTENT_REVEAL_DURATION = ENTER_DURATION
export const TRANSITION_EASE = 'power2.out'
export const PAGE_TRANSITION_EASE = 'Pagtrans'
export const PAGE_IN_EASE = 'pagein'
export const DEFAULT_PAGE_TRANSITION_BACKGROUND = 'var(--aintree)'

const PAGE_OFFSET = 150
const LEAVE_PAGE_OFFSET = -PAGE_OFFSET
const ENTER_PAGE_OFFSET = PAGE_OFFSET

const Z_PAGE = 1
const Z_OVERLAY = 10000
const WIPE_FILL_ORIGIN = 'bottom center'
const WIPE_REVEAL_ORIGIN = 'top center'

let gsapPromise = null
let leavePreparePromise = null
let enterPreparePromise = null
let lockedScrollY = 0

function logWipe(phase, primary, extra = {}) {
  if (typeof window === 'undefined') return
  const wrap = primary?.closest?.('[data-transition-wrap]') ?? null
  const styles = primary ? getComputedStyle(primary) : null
  const wrapStyles = wrap ? getComputedStyle(wrap) : null
  console.log('[page-transition]', phase, {
    hasPrimary: Boolean(primary),
    hasWrap: Boolean(wrap),
    wrapParent: wrap?.parentElement?.tagName?.toLowerCase() ?? null,
    wrapVisibility: wrapStyles?.visibility ?? null,
    wrapZIndex: wrapStyles?.zIndex ?? null,
    transform: styles?.transform ?? null,
    transformOrigin: styles?.transformOrigin ?? null,
    opacity: styles?.opacity ?? null,
    visibility: styles?.visibility ?? null,
    ...extra,
  })
}

function getGsap() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!gsapPromise) {
    gsapPromise = Promise.all([
      import('gsap'),
      import('gsap/CustomEase'),
    ]).then(([{ default: gsap }, { CustomEase }]) => {
      gsap.registerPlugin(CustomEase)
      if (!CustomEase.get('Pagtrans')) {
        CustomEase.create('Pagtrans', '.645,.045,.355,1')
      }
      if (!CustomEase.get('pagein')) {
        CustomEase.create('pagein', '0.22, 1, 0.36, 1')
      }
      return gsap
    })
  }
  return gsapPromise
}

function setTransitionLock(active) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('is-page-transitioning', active)
  document.body.classList.toggle('is-page-transitioning', active)
}

function getGlobalOverlay() {
  if (typeof document === 'undefined') {
    return { wrap: null, primary: null }
  }
  const wrap = document.querySelector('[data-transition-wrap]')
  return {
    wrap,
    primary: wrap?.querySelector('[data-transition-primary]') ?? null,
  }
}

function showOverlayWrap(gsap, wrap) {
  if (!wrap) return
  if (wrap.parentElement !== document.body) {
    document.body.appendChild(wrap)
  }
  gsap.set(wrap, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: Z_OVERLAY,
    visibility: 'visible',
    pointerEvents: 'none',
    overflow: 'hidden',
  })
}

function getWipeColor(wipeColorToken = DEFAULT_PAGE_TRANSITION_WIPE_COLOR) {
  return resolvePageColorCssValue(wipeColorToken)
    || resolvePageColorCssValue(DEFAULT_PAGE_TRANSITION_WIPE_COLOR)
    || '#061c11'
}

function prepareWipeCover(gsap, primary, wipeColor) {
  if (!primary) {
    logWipe('prepareWipeCover:missing-primary')
    return
  }
  gsap.killTweensOf(primary)
  gsap.set(primary, {
    position: 'absolute',
    top: 'auto',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    scaleX: 1,
    scaleY: 0,
    transformOrigin: WIPE_FILL_ORIGIN,
    autoAlpha: 1,
    backgroundColor: wipeColor,
  })
  logWipe('prepareWipeCover', primary, { scaleY: 0, origin: WIPE_FILL_ORIGIN })
}

function prepareWipeReveal(gsap, primary, wipeColor) {
  if (!primary) {
    logWipe('prepareWipeReveal:missing-primary')
    return
  }
  gsap.killTweensOf(primary)
  gsap.set(primary, {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 'auto',
    width: '100%',
    height: '100%',
    scaleX: 1,
    scaleY: 1,
    transformOrigin: WIPE_REVEAL_ORIGIN,
    autoAlpha: 1,
    backgroundColor: wipeColor,
  })
  logWipe('prepareWipeReveal', primary, { scaleY: 1, origin: WIPE_REVEAL_ORIGIN })
}

function resetOverlay(gsap, wrap, primary) {
  logWipe('resetOverlay:before', primary)
  if (primary) {
    gsap.killTweensOf(primary)
    gsap.set(primary, {
      clearProps: 'all',
    })
  }
  if (wrap) {
    gsap.set(wrap, {
      clearProps: 'all',
    })
  }
  logWipe('resetOverlay:after', primary)
}

function getFrameEl(el) {
  return el?.querySelector?.('.page-transition-inner') ?? el
}

function getContentEl(el) {
  return el?.querySelector?.('.page-transition-content') ?? getFrameEl(el)
}

function pinTransitionFrame(gsap, frameEl) {
  gsap.set(frameEl, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
    zIndex: Z_PAGE,
  })
}

let pageTransitionNuxtApp = null

function getLenisInstance() {
  try {
    return pageTransitionNuxtApp?.$lenis ?? null
  } catch {
    return null
  }
}

function getScrollY() {
  if (typeof window === 'undefined') return 0
  const lenis = getLenisInstance()
  if (lenis && typeof lenis.scroll === 'number') return lenis.scroll
  return window.scrollY ?? document.documentElement.scrollTop ?? 0
}

function captureScrollY() {
  lockedScrollY = getScrollY()
  return lockedScrollY
}

function getLeaveContentY() {
  return -lockedScrollY
}

function getLeaveContentEndY() {
  return -lockedScrollY + LEAVE_PAGE_OFFSET
}

function lockDocumentScroll(scrollY) {
  if (typeof document === 'undefined') return
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
}

function unlockDocumentScroll(targetY = 0) {
  if (typeof document === 'undefined') return
  const lenis = getLenisInstance()
  if (lenis) {
    lenis.scrollTo(targetY, { immediate: true })
  }
  window.scrollTo(0, targetY)
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
}

function setContentPosition(gsap, contentEl, y = 0) {
  gsap.set(contentEl, {
    y,
    opacity: 1,
  })
}

function restoreOverlayToApp(gsap, wrap) {
  if (!wrap) return
  const host = document.querySelector('#app')
  if (host && wrap.parentElement !== host) {
    host.appendChild(wrap)
  }
  if (gsap) {
    gsap.set(wrap, {
      clearProps: 'position,top,left,right,bottom,zIndex,visibility,pointerEvents,overflow',
    })
  }
}

function resetStaleTransitionState(gsap, { unlockScroll = true, releaseLock = unlockScroll } = {}) {
  if (typeof document === 'undefined') return

  const { wrap, primary } = getGlobalOverlay()

  document.querySelectorAll('.page-transition-inner.is--transition-fixed').forEach((frameEl) => {
    frameEl.classList.remove('is--transition-fixed')
    if (gsap) {
      gsap.set(frameEl, { clearProps: 'position,top,left,right,bottom,zIndex,overflow,width,display' })
    }
  })

  document.querySelectorAll('.page-transition-content.is--awaiting-content').forEach((contentEl) => {
    contentEl.classList.remove('is--awaiting-content')
    if (gsap) {
      gsap.set(contentEl, { clearProps: 'y,transform,opacity,display' })
    }
  })

  if (gsap) {
    resetOverlay(gsap, wrap, primary)
    restoreOverlayToApp(gsap, wrap)
  } else if (wrap) {
    wrap.style.visibility = 'hidden'
    wrap.style.pointerEvents = 'none'
    if (primary) {
      primary.style.opacity = '0'
      primary.style.visibility = 'hidden'
      primary.style.transform = 'scaleY(0)'
    }
  }

  if (releaseLock) {
    setTransitionLock(false)
  }

  if (unlockScroll) {
    unlockDocumentScroll(0)
    lockedScrollY = 0
  }
}

export function usePageTransition() {
  const nuxtApp = useNuxtApp()
  pageTransitionNuxtApp = nuxtApp
  const route = useRoute()
  const isTransitioning = useState('pageTransitioning', () => false)
  const isInitialPageLoad = useState('dorsia_isInitialPageLoad', () => true)
  const { pageTransitionWipeColor } = useSiteSettings()
  const wipeColor = computed(() => getWipeColor(pageTransitionWipeColor.value))

  function applyPendingColors() {
    nuxtApp.runWithContext(() => applyPendingPageColors())
  }

  function getReducedMotion() {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function shouldSkipTransition() {
    return getReducedMotion()
  }

  function stopLenis() {
    if (typeof window === 'undefined') return
    getLenisInstance()?.stop?.()
  }

  function resetScrollToTop() {
    if (typeof window === 'undefined') return
    const lenis = getLenisInstance()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
      return
    }
    window.scrollTo(0, 0)
  }

  async function resetPage(el) {
    if (typeof window === 'undefined') return
    const gsap = await getGsap()
    if (!gsap) return

    const frameEl = getFrameEl(el)
    const contentEl = getContentEl(el)
    const { wrap, primary } = getGlobalOverlay()

    if (contentEl) {
      contentEl.classList.remove('is--awaiting-content')
      gsap.set(contentEl, { clearProps: 'y,transform,opacity,display' })
    }
    if (frameEl) {
      frameEl.classList.remove('is--transition-fixed')
      gsap.set(frameEl, { clearProps: 'position,top,left,right,bottom,zIndex,overflow,width,display' })
    }
    if (el) {
      gsap.set(el, { clearProps: 'overflow' })
    }

    resetOverlay(gsap, wrap, primary)
    restoreOverlayToApp(gsap, wrap)
    setTransitionLock(false)
    unlockDocumentScroll(0)
    lockedScrollY = 0

    await nextTick()
    await waitForScrollLayoutPaint()
    lockScrollSystem(0)
  }

  async function completePageTransition(el) {
    await resetPage(el)
    document.dispatchEvent(new CustomEvent('page-transition-complete'))
    scheduleScrollSystemSettle()

    if (route.hash) {
      scrollRouteHashWhenReady(route.hash, { afterPageTransition: true })
    }
  }

  const transitionHandlers = {
      async beforeEnter(el) {
        if (typeof window === 'undefined') return

        console.log('[page-transition] beforeEnter:sync', { path: route.fullPath })

        if (!shouldSkipTransition()) {
          getContentEl(el)?.classList.add('is--awaiting-content')
        }

        enterPreparePromise = (async () => {
          if (shouldSkipTransition()) {
            console.log('[page-transition] beforeEnter:skipped')
            applyPendingColors()
            return
          }

          const gsap = await getGsap()
          if (!gsap) {
            console.log('[page-transition] beforeEnter:no-gsap')
            return
          }

          const frameEl = getFrameEl(el)
          const contentEl = getContentEl(el)
          if (!frameEl || !contentEl) {
            console.warn('[page-transition] beforeEnter:missing-frame', {
              hasFrame: Boolean(frameEl),
              hasContent: Boolean(contentEl),
            })
            applyPendingColors()
            return
          }

          const { wrap, primary } = getGlobalOverlay()

          console.log('[page-transition] beforeEnter', {
            path: route.fullPath,
            hasWrap: Boolean(wrap),
            hasPrimary: Boolean(primary),
          })

          gsap.set(el, { overflow: 'hidden' })
          frameEl.classList.add('is--transition-fixed')
          contentEl.classList.add('is--awaiting-content')
          pinTransitionFrame(gsap, frameEl)
          setContentPosition(gsap, contentEl, ENTER_PAGE_OFFSET)

          if (primary) {
            showOverlayWrap(gsap, wrap)
            prepareWipeReveal(gsap, primary, wipeColor.value)
          }

          const oldEl = el.previousElementSibling
          if (oldEl) {
            document.dispatchEvent(new CustomEvent('crows:page-transition-prepare', {
              detail: { leavingRoot: oldEl },
            }))
          }
          document.dispatchEvent(new CustomEvent('crows:page-transition-swap', {
            detail: { enteringRoot: el },
          }))
        })()

        await enterPreparePromise
      },

      enter(el, done) {
        const finish = () => {
          isTransitioning.value = false
          done()
        }
        if (typeof window === 'undefined') {
          finish()
          return
        }

        Promise.resolve(enterPreparePromise)
          .then(() => getGsap())
          .then(async (gsap) => {
            if (!gsap) {
              finish()
              return
            }
            if (shouldSkipTransition()) {
              console.log('[page-transition] enter:skipped')
              setTransitionLock(false)
              await completePageTransition(el)
              document.dispatchEvent(new CustomEvent('crows:page-transition-content-enter', {
                detail: { enteringRoot: el },
              }))
              finish()
              return
            }

            const contentEl = getContentEl(el)
            const { wrap, primary } = getGlobalOverlay()

            console.log('[page-transition] enter:start', {
              path: route.fullPath,
              hasWrap: Boolean(wrap),
              hasPrimary: Boolean(primary),
              pause: WIPE_PAUSE_DURATION,
              duration: WIPE_REVEAL_DURATION,
            })
            logWipe('enter:before-reveal-tween', primary)

            let contentRevealStarted = false
            const startContentReveal = () => {
              if (contentRevealStarted) return
              contentRevealStarted = true
              contentEl.classList.remove('is--awaiting-content')
              console.log('[page-transition] enter:content-reveal-start')
              document.dispatchEvent(new CustomEvent('crows:page-transition-content-enter', {
                detail: { enteringRoot: el },
              }))
            }

            const tl = gsap.timeline({
              onComplete: () => {
                console.log('[page-transition] enter:timeline-complete')
                logWipe('enter:timeline-complete', primary)
                completePageTransition(el).then(finish)
              },
              onInterrupt: () => {
                console.log('[page-transition] enter:timeline-interrupted')
                logWipe('enter:timeline-interrupted', primary)
                completePageTransition(el).then(finish)
              },
            })

            const revealAt = WIPE_PAUSE_DURATION

            tl.call(startContentReveal, [], revealAt)

            if (primary) {
              tl.fromTo(primary, {
                scaleY: 1,
                scaleX: 1,
                transformOrigin: WIPE_REVEAL_ORIGIN,
              }, {
                scaleY: 0,
                scaleX: 1,
                transformOrigin: WIPE_REVEAL_ORIGIN,
                duration: WIPE_REVEAL_DURATION,
                ease: PAGE_TRANSITION_EASE,
                immediateRender: true,
                onStart: () => {
                  console.log('[page-transition] reveal:onStart')
                  logWipe('reveal:onStart', primary)
                },
                onUpdate: function onRevealUpdate() {
                  if (this.progress() === 0 || this.progress() >= 0.99) {
                    console.log('[page-transition] reveal:onUpdate', {
                      progress: this.progress().toFixed(2),
                    })
                    logWipe('reveal:onUpdate', primary, { progress: this.progress() })
                  }
                },
                onComplete: () => {
                  console.log('[page-transition] reveal:onComplete')
                  logWipe('reveal:onComplete', primary)
                },
              }, revealAt)
            } else {
              console.warn('[page-transition] enter:no-primary — reveal tween skipped')
            }

            tl.to(contentEl, {
              y: 0,
              duration: ENTER_DURATION,
              ease: PAGE_IN_EASE,
            }, revealAt)
          })
          .catch((err) => {
            console.error('[page-transition] enter:error', err)
            completePageTransition(el).then(finish)
          })
      },

      async beforeLeave(el) {
        if (typeof window === 'undefined') return

        if (!shouldSkipTransition()) {
          captureScrollY()
          document.dispatchEvent(new CustomEvent('crows:page-transition-before-leave', {
            detail: { leavingRoot: el, scrollY: lockedScrollY },
          }))
          setTransitionLock(true)
          lockDocumentScroll(lockedScrollY)
          console.log('[page-transition] beforeLeave:scroll-locked', { lockedScrollY })
        }

        stopLenis()

        leavePreparePromise = (async () => {
          if (shouldSkipTransition()) {
            console.log('[page-transition] beforeLeave:skipped')
            return
          }

          const gsap = await getGsap()
          if (!gsap) {
            console.log('[page-transition] beforeLeave:no-gsap')
            return
          }

          const frameEl = getFrameEl(el)
          const contentEl = getContentEl(el)
          const { wrap, primary } = getGlobalOverlay()

          console.log('[page-transition] beforeLeave', {
            path: route.fullPath,
            hasWrap: Boolean(wrap),
            hasPrimary: Boolean(primary),
          })

          frameEl.classList.add('is--transition-fixed')
          gsap.set(el, { overflow: 'hidden' })
          pinTransitionFrame(gsap, frameEl)
          setContentPosition(gsap, contentEl, getLeaveContentY())

          if (primary) {
            showOverlayWrap(gsap, wrap)
            prepareWipeCover(gsap, primary, wipeColor.value)
          }
        })()

        await leavePreparePromise
      },

      leave(el, done) {
        if (typeof window === 'undefined') {
          done()
          return
        }

        Promise.resolve(leavePreparePromise)
          .then(() => getGsap())
          .then((gsap) => {
            if (!gsap || shouldSkipTransition()) {
              console.log('[page-transition] leave:skipped', { hasGsap: Boolean(gsap) })
              done()
              return
            }

            const frameEl = getFrameEl(el)
            const contentEl = getContentEl(el)
            const { primary } = getGlobalOverlay()

            console.log('[page-transition] leave:start', {
              path: route.fullPath,
              hasPrimary: Boolean(primary),
            })
            logWipe('leave:before-cover-tween', primary)

            const pageTween = gsap.to(contentEl, {
              y: getLeaveContentEndY(),
              duration: LEAVE_PAGE_DURATION,
              ease: PAGE_TRANSITION_EASE,
            })

            const animations = [pageTween]

            if (primary) {
              animations.push(
                gsap.to(primary, {
                  scaleY: 1,
                  scaleX: 1,
                  transformOrigin: WIPE_FILL_ORIGIN,
                  duration: WIPE_COVER_DURATION,
                  ease: PAGE_TRANSITION_EASE,
                  onStart: () => {
                    console.log('[page-transition] cover:onStart')
                    logWipe('cover:onStart', primary)
                  },
                  onComplete: () => {
                    console.log('[page-transition] cover:onComplete')
                    logWipe('cover:onComplete', primary)
                  },
                }),
              )
            } else {
              console.warn('[page-transition] leave:no-primary — cover tween skipped')
            }

            Promise.all(animations).then(() => {
              console.log('[page-transition] leave:animations-complete')
              logWipe('leave:animations-complete', primary)
              gsap.delayedCall(WIPE_PAUSE_DURATION, () => {
                document.dispatchEvent(new CustomEvent('crows:page-transition-primary-complete'))
                gsap.set(frameEl, { display: 'none' })
                console.log('[page-transition] leave:done-called')
                done()
              })
            })
          })
          .catch((err) => {
            console.error('[page-transition] leave:error', err)
            done()
          })
      },

      async afterLeave() {
        // Scroll stays locked until completePageTransition resets to top.
      },
  }

  const nuxtPageTransition = computed(() => {
    if (import.meta.server) return false

    if (isInitialPageLoad.value) {
      return false
    }

    const skipped = shouldSkipTransition()
    if (skipped) {
      console.log('[page-transition] disabled', {
        reducedMotion: getReducedMotion(),
      })
      return false
    }

    return {
      name: 'crows-page',
      mode: 'out-in',
      css: false,
      onBeforeEnter: transitionHandlers.beforeEnter,
      onEnter: transitionHandlers.enter,
      onBeforeLeave: transitionHandlers.beforeLeave,
      onLeave: transitionHandlers.leave,
      onAfterLeave: transitionHandlers.afterLeave,
    }
  })

  return {
    route,
    isTransitioning,
    shouldSkipTransition,
    transitionHandlers,
    nuxtPageTransition,
    pageTransitionWipeColor,
    wipeColor,
  }
}
