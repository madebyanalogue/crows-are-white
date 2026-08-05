import {
  CONTENT_REVEAL_DURATION,
  TRANSITION_EASE,
} from '~/composables/usePageTransition'
import { useHeaderTransitionDisplay } from '~/composables/useHeaderTransitionDisplay'

let gsapPromise = null

function getGsap() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!gsapPromise) {
    gsapPromise = import('gsap').then(({ default: gsap }) => gsap)
  }
  return gsapPromise
}

export function useHeaderAnimation(headerRef) {
  const headerCanReveal = useState('crows_headerCanReveal', () => false)
  const pendingRoutePath = useState('dorsia_pendingRoutePath', () => '')
  const {
    beginLeavingDisplay,
    applyDestinationAtWipeCover,
    showDestinationLogo,
    releaseTransition,
  } = useHeaderTransitionDisplay()
  const { shouldSkipTransition } = usePageTransition()
  let activeTween = null
  let gsap = null
  let isVisible = false

  function hideInstant() {
    if (!gsap || !headerRef.value) return
    isVisible = false
    activeTween?.kill()
    gsap.set(headerRef.value, { autoAlpha: 0 })
  }

  function showAnimated() {
    if (!gsap || !headerRef.value) return
    activeTween?.kill()
    isVisible = true
    activeTween = gsap.to(headerRef.value, {
      autoAlpha: 1,
      duration: CONTENT_REVEAL_DURATION,
      ease: TRANSITION_EASE,
      overwrite: 'auto',
    })
  }

  function tryRevealAfterPreloader() {
    if (!headerCanReveal.value || isVisible) return
    showAnimated()
  }

  function onPrimaryWipeComplete() {
    if (shouldSkipTransition()) return
    hideInstant()
    applyDestinationAtWipeCover(pendingRoutePath.value)
  }

  function onTransitionBeforeLeave(event) {
    if (shouldSkipTransition()) return
    beginLeavingDisplay(headerRef.value, event?.detail?.scrollY)
  }

  function onPageTransitionContentEnter() {
    if (shouldSkipTransition()) return
    showDestinationLogo()
    showAnimated()
  }

  function onPageTransitionComplete() {
    if (shouldSkipTransition()) return
    releaseTransition()
    if (!isVisible) showAnimated()
  }

  async function initHeader() {
    gsap = await getGsap()
    if (!gsap || !headerRef.value) return

    gsap.set(headerRef.value, { autoAlpha: 0, y: 0, clearProps: 'transform' })
    tryRevealAfterPreloader()
  }

  watch(headerCanReveal, (canReveal) => {
    if (canReveal) tryRevealAfterPreloader()
  })

  onMounted(() => {
    initHeader()
    document.addEventListener('crows:page-transition-before-leave', onTransitionBeforeLeave)
    document.addEventListener('crows:page-transition-primary-complete', onPrimaryWipeComplete)
    document.addEventListener('crows:page-transition-content-enter', onPageTransitionContentEnter)
    document.addEventListener('page-transition-complete', onPageTransitionComplete)
  })

  onUnmounted(() => {
    document.removeEventListener('crows:page-transition-before-leave', onTransitionBeforeLeave)
    document.removeEventListener('crows:page-transition-primary-complete', onPrimaryWipeComplete)
    document.removeEventListener('crows:page-transition-content-enter', onPageTransitionContentEnter)
    document.removeEventListener('page-transition-complete', onPageTransitionComplete)
    activeTween?.kill()
  })
}
