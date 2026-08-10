import {
  extractHeroChromeColors,
  getHeroMenuChromeVars,
  heroSectionHasMenuChrome,
  HERO_MENU_CSS_VARS,
} from '~/utils/heroChrome'

const HERO_ROOT_MARGIN_BOTTOM_RATIO = 0.4

export function useHeroMenuActive() {
  return useState('crows_heroMenuActive', () => false)
}

export function useHeroMenuFrosted() {
  return useState('crows_heroMenuFrosted', () => false)
}

export function useHeroMenuChrome(section) {
  const sectionRef = ref(null)
  const heroMenuActive = useHeroMenuActive()
  const heroMenuFrosted = useHeroMenuFrosted()
  let observer = null
  let heroVarsApplied = false

  const menuChromeEnabled = computed(() => heroSectionHasMenuChrome(unref(section)))
  const menuChromeVars = computed(() => getHeroMenuChromeVars(unref(section)))
  const menuFrosted = computed(() => extractHeroChromeColors(unref(section)).heroMenuFrosted)

  function applyHeroMenuVars() {
    if (!import.meta.client) return

    const root = document.documentElement
    for (const name of HERO_MENU_CSS_VARS) {
      root.style.removeProperty(name)
    }

    const vars = menuChromeVars.value
    if (!vars) {
      heroVarsApplied = false
      return
    }

    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value)
    }

    heroVarsApplied = true
  }

  function clearHeroMenuVars() {
    if (!import.meta.client || !heroVarsApplied) return

    const root = document.documentElement
    for (const name of HERO_MENU_CSS_VARS) {
      root.style.removeProperty(name)
    }

    heroVarsApplied = false
  }

  function measureHeroIntersection() {
    if (!sectionRef.value) return false

    const rect = sectionRef.value.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return false

    const rootBottom = window.innerHeight * (1 - HERO_ROOT_MARGIN_BOTTOM_RATIO)
    return rect.bottom > 0 && rect.top < rootBottom
  }

  function setHeroActive(active) {
    const wasActive = heroMenuActive.value
    heroMenuActive.value = active
    heroMenuFrosted.value = active && menuFrosted.value

    if (active) {
      applyHeroMenuVars()
      return
    }

    heroMenuFrosted.value = false

    if (wasActive || heroVarsApplied) {
      clearHeroMenuVars()
    }
  }

  function syncHeroMenuState() {
    if (!import.meta.client || !menuChromeEnabled.value) {
      setHeroActive(false)
      return
    }

    setHeroActive(measureHeroIntersection())
  }

  function refreshHeroMenuChrome() {
    syncHeroMenuState()
    if (heroMenuActive.value) {
      applyHeroMenuVars()
    }
  }

  function disconnectObserver() {
    observer?.disconnect()
    observer = null
  }

  function connectObserver() {
    disconnectObserver()

    if (!import.meta.client || !sectionRef.value || !menuChromeEnabled.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        setHeroActive(Boolean(entry?.isIntersecting))
      },
      {
        threshold: 0,
        rootMargin: `0px 0px -${HERO_ROOT_MARGIN_BOTTOM_RATIO * 100}% 0px`,
      },
    )

    observer.observe(sectionRef.value)
    refreshHeroMenuChrome()
  }

  function scheduleRefresh() {
    nextTick(() => {
      requestAnimationFrame(() => {
        refreshHeroMenuChrome()
      })
    })
  }

  watch(sectionRef, (el) => {
    if (el && menuChromeEnabled.value) {
      connectObserver()
    }
  }, { flush: 'post' })

  watch(menuChromeVars, () => {
    if (heroMenuActive.value) {
      applyHeroMenuVars()
    }
  })

  watch(menuChromeEnabled, (enabled) => {
    if (!enabled) {
      disconnectObserver()
      setHeroActive(false)
      return
    }

    scheduleRefresh()
    connectObserver()
  })

  onMounted(() => {
    if (!import.meta.client) return

    connectObserver()
    scheduleRefresh()

    document.addEventListener('page-transition-complete', scheduleRefresh)
    document.addEventListener('crows:page-transition-primary-complete', scheduleRefresh)
    document.addEventListener('crows:page-transition-content-enter', scheduleRefresh)
    document.addEventListener('crows:scroll-system-ready', scheduleRefresh)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('page-transition-complete', scheduleRefresh)
    document.removeEventListener('crows:page-transition-primary-complete', scheduleRefresh)
    document.removeEventListener('crows:page-transition-content-enter', scheduleRefresh)
    document.removeEventListener('crows:scroll-system-ready', scheduleRefresh)

    disconnectObserver()
    setHeroActive(false)
  })

  return {
    sectionRef,
    heroMenuActive,
    heroMenuFrosted,
  }
}
