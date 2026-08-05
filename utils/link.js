export function getWhatsAppLinkUrl(whatsappUrl) {
  return whatsappUrl?.trim() || '#'
}

export function getPageOrUrlLinkUrl(link, whatsappUrl = '') {
  if (!link) return '#'

  if (link.type === 'whatsapp') {
    return getWhatsAppLinkUrl(whatsappUrl)
  }

  if (link.type === 'page') {
    const slug = link.page?.slug?.current
    if (slug === 'home') return '/'
    if (slug) return `/${slug}`
  }

  if (link.url) return link.url

  return '#'
}

export function getPageOrUrlLinkTarget(link) {
  if (link?.type === 'whatsapp') return '_blank'

  if (link?.type === 'url' && link.url) {
    const url = link.url
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return '_blank'
    }
  }
  return undefined
}

export function getPageOrUrlLinkRel(link) {
  return getPageOrUrlLinkTarget(link) === '_blank' ? 'noopener' : undefined
}
