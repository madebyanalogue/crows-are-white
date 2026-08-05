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

export function useArticlesIndexPin(headerRef) {
  let fadeTrigger = null

  async function init() {
    const modules = await getGsapModules()
    const header = headerRef.value
    if (!modules || !header) return

    const { gsap, ScrollTrigger } = modules

    const setHeaderOpacity = (progress) => {
      gsap.set(header, { autoAlpha: Math.max(0, 1 - progress) })
    }

    const getFadeDistance = () => (header.offsetHeight || 0) * 0.35

    gsap.set(header, { autoAlpha: 1 })

    fadeTrigger = ScrollTrigger.create({
      trigger: header,
      start: () => `top top+=${getHeaderOffset()}`,
      end: () => `+=${getFadeDistance()}`,
      scrub: true,
      pin: header,
      pinSpacing: false,
      invalidateOnRefresh: true,
      onUpdate: (self) => setHeaderOpacity(self.progress),
      onRefresh: (self) => {
        setHeaderOpacity(self.progress)
        resetPinSpacerWidth(self)
      },
      onToggle: (self) => resetPinSpacerWidth(self),
    })

    ScrollTrigger.refresh()
    setHeaderOpacity(fadeTrigger.progress)
    resetPinSpacerWidth(fadeTrigger)
    header.closest('.section-articles-index')?.classList.add('is--pin-ready')
  }

  function refresh() {
    if (!fadeTrigger) return
    fadeTrigger.refresh()
    resetPinSpacerWidth(fadeTrigger)
  }

  function cleanup() {
    const header = headerRef.value
    header?.closest('.section-articles-index')?.classList.remove('is--pin-ready')

    if (header) {
      header.style.removeProperty('opacity')
      header.style.removeProperty('visibility')
      header.style.removeProperty('position')
      header.style.removeProperty('top')
      header.style.removeProperty('left')
      header.style.removeProperty('width')
      header.style.removeProperty('transform')
    }

    fadeTrigger?.kill()
    fadeTrigger = null
  }

  useAfterPageTransition(() => init())

  onMounted(() => {
    document.addEventListener('crows:scroll-system-ready', refresh)
  })

  onUnmounted(() => {
    document.removeEventListener('crows:scroll-system-ready', refresh)
    cleanup()
  })

  return { init, cleanup, refresh }
}
