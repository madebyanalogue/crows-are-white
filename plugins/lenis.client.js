import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  lockScrollSystem,
  scheduleScrollSystemSettle,
} from '~/composables/useScrollLayoutNotify'

function warmupLenisScrollTrigger(lenis, { withRefresh = true } = {}) {
  if (!lenis) return

  const tick = (now) => {
    lenis.raf(now)
    if (withRefresh) {
      lenis.resize()
      ScrollTrigger.refresh(true)
      lenis.raf(now)
    }
    ScrollTrigger.update()
  }

  tick(performance.now())
  requestAnimationFrame(tick)
}

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const isTransitioning = useState('pageTransitioning', () => false)
  let lenisInstance = null
  let lastSyncedScroll = -1

  const initLenis = () => {
    if (lenisInstance) return

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisInstance.stop()
    lockScrollSystem(0)

    gsap.registerPlugin(ScrollTrigger)

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && lenisInstance) {
          lenisInstance.scrollTo(value, { immediate: true })
        }
        return lenisInstance ? lenisInstance.scroll : window.scrollY ?? document.documentElement.scrollTop
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })

    ScrollTrigger.defaults({ scroller: document.body })

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000)
      const scroll = lenisInstance.scroll
      if (scroll !== lastSyncedScroll) {
        lastSyncedScroll = scroll
        ScrollTrigger.update()
      }
    })
    gsap.ticker.lagSmoothing(0)

    nuxtApp.provide('lenis', lenisInstance)
    nuxtApp.provide('warmupLenisScrollTrigger', () => warmupLenisScrollTrigger(lenisInstance))

    document.dispatchEvent(new CustomEvent('crows:lenis-ready'))

    requestAnimationFrame(() => {
      lenisInstance.raf(performance.now())
      ScrollTrigger.update()
    })

    scheduleScrollSystemSettle()

    document.addEventListener('page-transition-complete', () => {
      lastSyncedScroll = -1
    })

    nuxtApp.hook('page:finish', () => {
      lastSyncedScroll = -1

      if (!isTransitioning.value) {
        lockScrollSystem(0)
        scheduleScrollSystemSettle()
      }
    })
  }

  const tryInit = () => {
    if (document.body.classList.contains('preloader-complete')) {
      initLenis()
    }
  }

  if (document.body.classList.contains('preloader-complete')) {
    tryInit()
  } else {
    document.addEventListener('preloader-complete', tryInit, { once: true })
  }
})
