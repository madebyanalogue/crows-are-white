import { scheduleScrollSystemSettle } from '~/composables/useScrollLayoutNotify'

let gsapPromise = null

function getGsap() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!gsapPromise) {
    gsapPromise = import('gsap').then(({ default: gsap }) => gsap)
  }
  return gsapPromise
}

function resolveElement(value) {
  if (!value) return null
  if (value instanceof HTMLElement) return value
  if (value.value instanceof HTMLElement) return value.value
  return null
}

export function useVideoParallax(triggerRef, targetRef, options = {}) {
  const {
    speed = 0.35,
  } = options

  let gsap = null
  let lenisScrollHandler = null
  let resizeHandler = null
  let scrollSystemAttached = false
  let initQueued = false
  let isActive = false

  function getTarget() {
    return resolveElement(unref(targetRef))
  }

  function getMaxTranslate(trigger) {
    return trigger.offsetHeight * speed
  }

  function updateParallax() {
    const trigger = triggerRef.value
    const target = getTarget()
    if (!gsap || !isActive || !trigger || !target) return

    const distance = trigger.offsetHeight || 1
    const progress = Math.min(1, Math.max(0, -trigger.getBoundingClientRect().top / distance))
    gsap.set(target, { y: getMaxTranslate(trigger) * progress })
  }

  function detachLenisScroll() {
    if (!lenisScrollHandler) return

    try {
      useNuxtApp().$lenis?.off('scroll', lenisScrollHandler)
    } catch {
      // Lenis may not be initialized yet.
    }

    lenisScrollHandler = null
  }

  async function init() {
    const trigger = triggerRef.value
    const target = getTarget()
    if (!trigger || !target) return false

    gsap = await getGsap()
    if (!gsap) return false

    cleanup()

    gsap.set(target, {
      y: 0,
      force3D: true,
    })

    isActive = true
    target.dataset.parallaxReady = 'true'

    const nuxtApp = useNuxtApp()
    if (nuxtApp.$lenis) {
      lenisScrollHandler = () => updateParallax()
      nuxtApp.$lenis.on('scroll', lenisScrollHandler)
      updateParallax()
      return true
    }

    isActive = false
    return false
  }

  function cleanup() {
    isActive = false
    detachLenisScroll()

    const target = getTarget()
    if (target) {
      delete target.dataset.parallaxReady
      gsap?.set(target, { clearProps: 'transform' })
    }
  }

  function queueInit() {
    if (initQueued) return
    initQueued = true
    nextTick(() => {
      initQueued = false
      init()
    })
  }

  function handleScrollSystemReady() {
    if (isActive) {
      updateParallax()
      return
    }

    queueInit()
  }

  function handleLenisReady() {
    queueInit()
  }

  function attachScrollSystem() {
    if (scrollSystemAttached) return
    scrollSystemAttached = true

    document.addEventListener('crows:scroll-system-ready', handleScrollSystemReady)
    document.addEventListener('crows:lenis-ready', handleLenisReady)

    resizeHandler = () => updateParallax()
    window.addEventListener('resize', resizeHandler, { passive: true })

    try {
      const nuxtApp = useNuxtApp()
      nuxtApp.$warmupLenisScrollTrigger?.()

      if (nuxtApp.$lenis) {
        requestAnimationFrame(() => handleScrollSystemReady())
        return
      }
    } catch {
      // Lenis may not be initialized yet.
    }

    scheduleScrollSystemSettle()
  }

  watch(
    [triggerRef, () => getTarget()],
    ([trigger, target]) => {
      if (!scrollSystemAttached || !trigger || !target) return
      queueInit()
    },
  )

  onMounted(() => {
    const boot = () => {
      attachScrollSystem()
      queueInit()
    }

    if (document.body.classList.contains('preloader-complete')) {
      boot()
      return
    }

    document.addEventListener('preloader-complete', boot, { once: true })
  })

  onUnmounted(() => {
    document.removeEventListener('crows:scroll-system-ready', handleScrollSystemReady)
    document.removeEventListener('crows:lenis-ready', handleLenisReady)
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }
    cleanup()
  })

  return { init, cleanup, updateParallax }
}
