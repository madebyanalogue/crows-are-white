import { isScrollSystemLocked } from '~/composables/useScrollLayoutNotify'

let lockCount = 0
let lockedScrollY = 0

function getScrollY() {
  try {
    const lenis = useNuxtApp().$lenis
    if (lenis && typeof lenis.scroll === 'number') return lenis.scroll
  } catch {
    // Lenis may not be initialized yet.
  }

  return window.scrollY ?? document.documentElement.scrollTop ?? 0
}

export function lockOverlayScroll() {
  if (!import.meta.client) return

  if (lockCount === 0) {
    lockedScrollY = getScrollY()

    try {
      const nuxtApp = useNuxtApp()
      const lenis = nuxtApp.$lenis
      lenis?.scrollTo?.(lockedScrollY, { immediate: true })
      lenis?.stop?.()
    } catch {
      // Lenis may not be initialized yet.
    }

    window.scrollTo(0, lockedScrollY)

    document.documentElement.classList.add('is-overlay-scroll-locked')
    document.documentElement.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${lockedScrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  }

  lockCount += 1
}

export function unlockOverlayScroll() {
  if (!import.meta.client || lockCount === 0) return

  lockCount -= 1
  if (lockCount > 0) return

  document.documentElement.classList.remove('is-overlay-scroll-locked')
  document.documentElement.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''

  try {
    const nuxtApp = useNuxtApp()
    nuxtApp.$lenis?.scrollTo?.(lockedScrollY, { immediate: true })
    if (!isScrollSystemLocked()) {
      nuxtApp.$lenis?.start?.()
    }
  } catch {
    // Lenis may not be initialized yet.
  }

  window.scrollTo(0, lockedScrollY)
}

export function resetOverlayScrollLock() {
  if (!import.meta.client || lockCount === 0) return
  lockCount = 1
  unlockOverlayScroll()
}
