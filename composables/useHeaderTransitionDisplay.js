import { computed } from 'vue'
import {
  getCachedPageForRoute,
  pageHasTransparentVideoHero,
} from '~/utils/videoSectionFlags'

export function useHeaderTransitionDisplay() {
  const headerTransitionActive = useState('crows_headerTransitionActive', () => false)
  const headerWipeCovered = useState('crows_headerWipeCovered', () => false)
  const headerTransitionLock = useState('crows_headerTransitionLock', () => false)
  const headerLeavingDisplay = useState('crows_headerLeavingDisplay', () => null)
  const headerLeavingFrozenStyle = useState('crows_headerLeavingFrozenStyle', () => null)
  const headerSnapshot = useState('crows_headerSnapshot', () => null)
  const headerShowDestinationLogo = useState('crows_headerShowDestinationLogo', () => false)
  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const videoHeroActive = useVideoHero()
  const headerScrolled = useState('crows_headerScrolled', () => false)

  function heroFromRoute() {
    const page = getCachedPageForRoute(nuxtApp, route.path)
    if (page) return pageHasTransparentVideoHero(page)
    return videoHeroActive.value
  }

  function beginLeavingDisplay(headerEl, scrollY) {
    headerTransitionActive.value = true
    headerWipeCovered.value = false
    headerTransitionLock.value = false
    headerShowDestinationLogo.value = false
    headerSnapshot.value = null

    let scrolled = headerScrolled.value
    if (headerEl?.classList.contains('is-scrolled')) {
      scrolled = true
    } else if (typeof scrollY === 'number' && Number.isFinite(scrollY) && headerEl) {
      const attr = headerEl.getAttribute('data-scroll-threshold')
      const threshold = attr !== null && attr !== ''
        ? Number(attr)
        : Number(getComputedStyle(headerEl).getPropertyValue('--nav-scroll-threshold')) || 48
      scrolled = scrollY >= threshold
    }

    headerLeavingDisplay.value = {
      hero: videoHeroActive.value,
      scrolled,
    }

    if (headerEl) {
      const computed = getComputedStyle(headerEl)
      headerLeavingFrozenStyle.value = {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      }
    }
  }

  function applyDestinationAtWipeCover(path) {
    const nuxtApp = useNuxtApp()
    let hero = false

    if (path && !path.startsWith('/articles')) {
      const page = getCachedPageForRoute(nuxtApp, path)
      if (page) {
        hero = pageHasTransparentVideoHero(page)
      }
    }

    headerLeavingFrozenStyle.value = null
    headerWipeCovered.value = true
    headerTransitionLock.value = true
    headerSnapshot.value = {
      hero,
      scrolled: false,
    }
  }

  function showDestinationLogo() {
    headerShowDestinationLogo.value = true
  }

  function releaseTransition() {
    headerTransitionActive.value = false
    headerWipeCovered.value = false
    headerTransitionLock.value = false
    headerShowDestinationLogo.value = false
    headerLeavingDisplay.value = null
    headerLeavingFrozenStyle.value = null
    headerSnapshot.value = null
  }

  const displayHero = computed(() => {
    if (headerTransitionActive.value && headerLeavingDisplay.value && !headerShowDestinationLogo.value) {
      return headerLeavingDisplay.value.hero
    }
    if (headerTransitionLock.value && headerSnapshot.value) {
      return headerSnapshot.value.hero
    }
    return heroFromRoute()
  })

  const displayScrolled = computed(() => {
    if (headerTransitionActive.value && headerLeavingDisplay.value && !headerShowDestinationLogo.value) {
      return headerLeavingDisplay.value.scrolled
    }
    if (headerTransitionLock.value && headerSnapshot.value) {
      return headerSnapshot.value.scrolled
    }
    return headerScrolled.value
  })

  const isLeavingFrozen = computed(() => (
    headerTransitionActive.value
    && !headerWipeCovered.value
    && Boolean(headerLeavingFrozenStyle.value)
  ))

  return {
    headerTransitionLock,
    headerLeavingFrozenStyle,
    isLeavingFrozen,
    displayHero,
    displayScrolled,
    beginLeavingDisplay,
    applyDestinationAtWipeCover,
    showDestinationLogo,
    releaseTransition,
  }
}
