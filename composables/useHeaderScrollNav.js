const DEFAULT_THRESHOLD = 48

function getScrollY() {
  try {
    const lenis = useNuxtApp().$lenis
    if (lenis && typeof lenis.scroll === 'number') return lenis.scroll
  } catch {
    // Lenis may not be initialised yet.
  }
  return window.scrollY ?? document.documentElement.scrollTop ?? 0
}

function getThreshold(headerEl) {
  if (!headerEl) return DEFAULT_THRESHOLD

  const attr = headerEl.getAttribute('data-scroll-threshold')
  if (attr !== null && attr !== '') {
    const value = Number(attr)
    if (Number.isFinite(value)) return value
  }

  const cssValue = Number(getComputedStyle(headerEl).getPropertyValue('--nav-scroll-threshold'))
  if (Number.isFinite(cssValue) && cssValue > 0) return cssValue

  return DEFAULT_THRESHOLD
}

export function useHeaderScrollNav(headerRef) {
  const headerScrolled = useState('crows_headerScrolled', () => false)
  const headerTransitionActive = useState('crows_headerTransitionActive', () => false)
  let removeScrollListener = null

  function sync() {
    if (headerTransitionActive.value) return
    const header = headerRef.value
    if (!header) return
    headerScrolled.value = getScrollY() >= getThreshold(header)
  }

  function scheduleSync() {
    nextTick(() => {
      sync()
      requestAnimationFrame(sync)
    })
  }

  function attachScrollListener() {
    removeScrollListener?.()
    removeScrollListener = null

    try {
      const lenis = useNuxtApp().$lenis
      if (lenis) {
        lenis.on('scroll', sync)
        removeScrollListener = () => lenis.off('scroll', sync)
        sync()
        return
      }
    } catch {
      // Lenis not available.
    }

    window.addEventListener('scroll', sync, { passive: true })
    removeScrollListener = () => window.removeEventListener('scroll', sync)
    sync()
  }

  onMounted(() => {
    attachScrollListener()
    document.addEventListener('crows:lenis-ready', attachScrollListener)
    document.addEventListener('crows:page-transition-content-enter', scheduleSync)
    document.addEventListener('page-transition-complete', scheduleSync)
    document.addEventListener('crows:scroll-system-ready', sync)
    window.addEventListener('popstate', scheduleSync)
  })

  onUnmounted(() => {
    removeScrollListener?.()
    document.removeEventListener('crows:lenis-ready', attachScrollListener)
    document.removeEventListener('crows:page-transition-content-enter', scheduleSync)
    document.removeEventListener('page-transition-complete', scheduleSync)
    document.removeEventListener('crows:scroll-system-ready', sync)
    window.removeEventListener('popstate', scheduleSync)
  })

  return { headerScrolled }
}
