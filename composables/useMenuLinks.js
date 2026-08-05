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

function normalizePath(path) {
  if (!path || path === '#') return ''
  const withoutHash = path.split('#')[0]
  if (withoutHash === '/') return '/'
  return withoutHash.replace(/\/$/, '') || '/'
}

export const CONTACT_FORM_HASH = '#contact-form'

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

export function scrollToHash(hash, { smooth = true } = {}) {
  if (!import.meta.client || !hash) return

  const id = hash.startsWith('#') ? hash.slice(1) : hash
  const element = document.getElementById(id)
  if (!element) return

  const headerHeight = Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10,
  ) || 80

  try {
    const lenis = useNuxtApp().$lenis
    if (lenis) {
      lenis.scrollTo(element, { offset: -headerHeight, immediate: !smooth })
      return
    }
  } catch {
    // Lenis may not be initialised yet.
  }

  const top = element.getBoundingClientRect().top + window.scrollY - headerHeight
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
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

    return normalizePath(href) === normalizePath(route.path)
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
    scrollToTop,
    scrollToHash,
    CONTACT_FORM_HASH,
  }
}
