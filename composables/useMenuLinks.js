import {
  waitForScrollLayoutPaint,
} from '~/composables/useScrollLayoutNotify'

export function isMenuDivider(item) {
  return item?.itemType === 'divider'
}

export function isMenuSpacer(item) {
  return item?.itemType === 'spacer'
}

export function isExternalUrl(url) {
  if (!url) return false
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return true
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return false
  return !url.startsWith('/') && !url.startsWith('#')
}

function splitInternalHref(href) {
  if (!href || href === '#') {
    return { path: '', query: {}, hash: '' }
  }

  const hash = getUrlHash(href)
  const withoutHash = hash ? href.slice(0, href.indexOf(hash)) : href
  const [pathPart, queryString = ''] = withoutHash.split('?')
  const path = normalizePath(pathPart)
  const query = {}

  if (queryString) {
    for (const part of queryString.split('&')) {
      if (!part) continue
      const [key, value = ''] = part.split('=')
      if (!key) continue
      query[decodeURIComponent(key)] = decodeURIComponent(value)
    }
  }

  return { path, query, hash }
}

function queriesMatch(left = {}, right = {}) {
  const leftKeys = Object.keys(left).filter((key) => left[key] != null && left[key] !== '')
  const rightKeys = Object.keys(right).filter((key) => right[key] != null && right[key] !== '')

  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every((key) => String(left[key]) === String(right[key]))
}

function isShopFilterHref(href) {
  const { path, query } = splitInternalHref(href)
  return path === '/shop' && Boolean(query.filter)
}

export const CONTACT_FORM_HASH = '#contact-form'

function normalizePath(path) {
  if (!path || path === '#') return ''
  const withoutHash = path.split('#')[0]
  if (withoutHash === '/') return '/'
  return withoutHash.replace(/\/$/, '') || '/'
}

export function scrollToTop({ smooth = true } = {}) {
  if (!import.meta.client) return

  try {
    const lenis = useNuxtApp().$lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: !smooth })
      return
    }
  } catch {
    // Lenis may not be initialised yet.
  }

  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
}

export function getUrlHash(url) {
  if (!url) return ''
  const hashIndex = url.indexOf('#')
  return hashIndex >= 0 ? url.slice(hashIndex) : ''
}

function getHeaderHeight() {
  if (!import.meta.client) return 80

  return Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10,
  ) || 80
}

export function scrollElementIntoView(element, { smooth = true, align = 'start' } = {}) {
  if (!import.meta.client || !element) return

  const rect = element.getBoundingClientRect()
  let target

  if (align === 'center') {
    target = window.scrollY + rect.top - (window.innerHeight / 2 - rect.height / 2)
  } else {
    target = window.scrollY + rect.top - getHeaderHeight()
  }

  target = Math.max(0, target)

  try {
    const lenis = useNuxtApp().$lenis
    if (lenis) {
      lenis.start?.()
      if (align === 'center') {
        lenis.scrollTo(target, { duration: smooth ? 0.8 : 0 })
      } else {
        lenis.scrollTo(element, { offset: -getHeaderHeight(), immediate: !smooth })
      }
      return
    }
  } catch {
    // Lenis may not be initialised yet.
  }

  window.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' })
}

export function scrollToHash(hash, { smooth = true, retries = 0, maxRetries = 24, align } = {}) {
  if (!import.meta.client || !hash) return

  const id = hash.startsWith('#') ? hash.slice(1) : hash
  const element = document.getElementById(id)
  if (!element) {
    if (retries < maxRetries) {
      requestAnimationFrame(() => scrollToHash(hash, { smooth, retries: retries + 1, maxRetries, align }))
    }
    return
  }

  const resolvedAlign = align || (id === 'trailer' ? 'center' : 'start')
  scrollElementIntoView(element, { smooth, align: resolvedAlign })
}

function waitForEvent(eventName, { timeoutMs = 0 } = {}) {
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    document.addEventListener(eventName, finish, { once: true })

    if (timeoutMs > 0) {
      setTimeout(finish, timeoutMs)
    }
  })
}

function isPageTransitionActive() {
  try {
    const isTransitioning = useState('pageTransitioning', () => false)
    return isTransitioning.value
      || document.documentElement.classList.contains('is-page-transitioning')
  } catch {
    return document.documentElement.classList.contains('is-page-transitioning')
  }
}

async function waitForPageTransitionComplete() {
  if (!isPageTransitionActive()) return

  await new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    document.addEventListener('page-transition-complete', finish, { once: true })
    setTimeout(finish, 5000)

    const poll = () => {
      if (!isPageTransitionActive()) {
        finish()
        return
      }
      requestAnimationFrame(poll)
    }
    poll()
  })

  await waitForScrollLayoutPaint()
}

async function waitForScrollSystemUnlocked() {
  // Other page:finish hooks (Lenis) may lock scroll on the next frame.
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve))
    if (document.documentElement.classList.contains('is-scroll-system-locked')) break
  }

  if (!document.documentElement.classList.contains('is-scroll-system-locked')) return

  await waitForEvent('crows:scroll-system-ready', { timeoutMs: 800 })

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (!document.documentElement.classList.contains('is-scroll-system-locked')) {
      await waitForScrollLayoutPaint()
      return
    }
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }
}

async function waitForHashTarget(hash, { timeoutMs = 10000 } = {}) {
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  if (!id) return null

  const started = performance.now()

  while (performance.now() - started < timeoutMs) {
    const element = document.getElementById(id)
    if (element) return element
    await waitForScrollLayoutPaint()
  }

  return null
}

export async function scrollRouteHashWhenReady(hash, { smooth = true, afterPageTransition = false } = {}) {
  if (!import.meta.client || !hash) return

  const transitionPromise = !afterPageTransition && isPageTransitionActive()
    ? waitForPageTransitionComplete()
    : Promise.resolve()

  await nextTick()
  await transitionPromise
  await waitForScrollSystemUnlocked()
  await waitForScrollLayoutPaint()

  const element = await waitForHashTarget(hash)
  if (!element) return

  try {
    const nuxtApp = useNuxtApp()
    nuxtApp.$lenis?.start?.()
    nuxtApp.$lenis?.resize?.()
    nuxtApp.$warmupLenisScrollTrigger?.()
  } catch {
    // Lenis may not be initialised yet.
  }

  await waitForScrollLayoutPaint()

  const id = hash.startsWith('#') ? hash.slice(1) : hash
  const align = id === 'trailer' ? 'center' : 'start'
  scrollElementIntoView(element, { smooth, align })
}

export function useMenuLinks() {
  const route = useRoute()
  const { whatsappLinkUrl } = useSiteSettings()

  function getMenuItemUrl(item) {
    if (isMenuDivider(item) || isMenuSpacer(item)) return '#'
    if (!item?.link) return '#'

    if (item.link.type === 'whatsapp') {
      return whatsappLinkUrl.value || '#'
    }

    if (item.link.type === 'page') {
      const slug = item.link.page?.slug?.current
      if (slug === 'home') return '/'
      if (slug) return `/${slug}`
    }

    if (item.link.type === 'article') {
      const slug = item.link.article?.slug?.current
      if (slug) return `/articles/${slug}`
    }

    if (item.link.type === 'contactForm') {
      return CONTACT_FORM_HASH
    }

    if (item.link.url) return item.link.url

    return '#'
  }

  function getMenuItemTarget(item) {
    if (item?.openInNewTab) return '_blank'
    if (item?.link?.type === 'whatsapp') return '_blank'
    if (item?.link?.type === 'url' && isExternalUrl(item.link.url)) return '_blank'
    return undefined
  }

  function getMenuItemRel(item) {
    return getMenuItemTarget(item) === '_blank' ? 'noopener' : undefined
  }

  function isCurrentPage(item) {
    const url = getMenuItemUrl(item)
    if (url === '#') return false
    if (url === '/') return route.path === '/'
    return route.path === url || route.path.startsWith(`${url}/`)
  }

  function isSamePageLink(item) {
    const url = getMenuItemUrl(item)
    if (!url || url === '#') return false
    if (getMenuItemTarget(item) === '_blank') return false
    if (item?.link?.type === 'whatsapp') return false
    if (item?.link?.type === 'url' && isExternalUrl(item.link.url)) return false

    return isSamePageHref(url)
  }

  function isSamePageHref(href) {
    if (!href || href === '#') return false
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false
    if (isExternalUrl(href)) return false

    const target = splitInternalHref(href)
    const currentPath = normalizePath(route.path)

    if (target.path !== currentPath) return false

    return queriesMatch(target.query, route.query)
  }

  function navigateInternalHref(href, { replace = false } = {}) {
    if (!import.meta.client) return Promise.resolve()

    const skipNextPageTransition = useState('crows_skipNextPageTransition', () => false)
    skipNextPageTransition.value = true

    const { path, query, hash } = splitInternalHref(href)
    const router = useRouter()
    const location = {
      path,
      query,
      hash: hash || undefined,
    }

    return replace ? router.replace(location) : router.push(location)
  }

  return {
    isMenuDivider,
    isMenuSpacer,
    getMenuItemUrl,
    isExternalUrl,
    getMenuItemTarget,
    getMenuItemRel,
    isCurrentPage,
    isSamePageLink,
    isSamePageHref,
    isShopFilterHref,
    navigateInternalHref,
    getUrlHash,
    scrollElementIntoView,
    scrollToTop,
    scrollToHash,
    scrollRouteHashWhenReady,
    CONTACT_FORM_HASH,
  }
}
