import { lockScrollSystem } from '~/composables/useScrollLayoutNotify'

let footerNavLockActive = false
let pendingFooterNavScrollY = null
let lifecycleInitialized = false

function isTouchMobile() {
  if (!import.meta.client) return false
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
}

function shouldPrepareFooterNav() {
  if (!import.meta.client) return false
  if (!isTouchMobile()) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (document.documentElement.classList.contains('is-overlay-scroll-locked')) return false
  if (document.documentElement.classList.contains('is-scroll-system-locked')) return false
  if (document.documentElement.classList.contains('is-page-transitioning')) return false

  try {
    const skipNextPageTransition = useState('crows_skipNextPageTransition', () => false)
    if (skipNextPageTransition.value === true) return false
  } catch {
    // useState may be unavailable outside Nuxt context.
  }

  return true
}

function getScrollY() {
  try {
    const lenis = useNuxtApp().$lenis
    if (lenis && typeof lenis.scroll === 'number') return lenis.scroll
  } catch {
    // Lenis may not be initialized yet.
  }

  return window.scrollY ?? document.documentElement.scrollTop ?? 0
}

function getFooterLinkFromEvent(event) {
  const link = event?.target?.closest?.('a')
  if (!(link instanceof HTMLAnchorElement)) return null
  if (!link.closest('.footer')) return null
  if (link.closest('.footer__social-link, .logo-wide__link')) return null
  return link
}

function isInternalPageLink(link) {
  const href = link.getAttribute('href')?.trim()
  if (!href || href === '#') return false
  if (link.target === '_blank') return false
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
    return false
  }

  return href.startsWith('/')
}

function prepareFooterMobileNav() {
  if (!shouldPrepareFooterNav()) return false

  const scrollY = getScrollY()
  pendingFooterNavScrollY = scrollY
  lockScrollSystem(scrollY)
  footerNavLockActive = true

  document.dispatchEvent(new CustomEvent('crows:page-transition-before-leave', {
    detail: {
      leavingRoot: document.querySelector('.page-transition-outer'),
      scrollY,
    },
  }))

  return true
}

function releaseFooterMobileNavLock() {
  footerNavLockActive = false
  pendingFooterNavScrollY = null
}

export function consumeFooterNavScrollY() {
  const scrollY = pendingFooterNavScrollY
  pendingFooterNavScrollY = null
  return scrollY
}

export function initFooterMobileNavLifecycle() {
  if (!import.meta.client || lifecycleInitialized) return

  lifecycleInitialized = true

  const router = useRouter()

  document.addEventListener('page-transition-complete', releaseFooterMobileNavLock)

  router.afterEach(() => {
    if (!footerNavLockActive) return

    nextTick(() => {
      const isTransitioning = useState('pageTransitioning', () => false)
      if (
        isTransitioning.value
        || document.documentElement.classList.contains('is-page-transitioning')
      ) {
        return
      }

      releaseFooterMobileNavLock()
    })
  })
}

export function useFooterMobileNav() {
  if (import.meta.client) {
    initFooterMobileNavLifecycle()
  }

  function onFooterNavigate(event) {
    const link = getFooterLinkFromEvent(event)
    if (!link || !isInternalPageLink(link)) return

    const href = link.getAttribute('href')?.trim() ?? ''
    const { isSamePageHref } = useMenuLinks()

    if (href.startsWith('#') || isSamePageHref(href)) return

    prepareFooterMobileNav()
  }

  return {
    onFooterNavigate,
  }
}
