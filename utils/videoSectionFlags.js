function isLegacyVideoHero(section) {
  return section?.sectionType === 'video' && section.videoHeroMode === true
}

export function videoSectionRemoveHeaderPadding(section) {
  if (section?.sectionType !== 'video') return false
  return section.videoRemoveHeaderPadding === true || isLegacyVideoHero(section)
}

export function videoSectionTransparentHeader(section) {
  if (section?.sectionType !== 'video') return false
  return section.videoTransparentHeader === true || isLegacyVideoHero(section)
}

function isHeroSection(section) {
  return section?.sectionType === 'hero'
}

export function pageHasTransparentVideoHero(page) {
  const firstSection = (page?.sections || []).find(Boolean)
  if (!firstSection) return false
  if (isHeroSection(firstSection)) return true
  return videoSectionTransparentHeader(firstSection)
}

export function pageRemovesHeaderPadding(page) {
  const firstSection = (page?.sections || []).find(Boolean)
  if (!firstSection) return false
  return (
    isHeroSection(firstSection)
    || videoSectionRemoveHeaderPadding(firstSection)
    || videoSectionTransparentHeader(firstSection)
    || firstSection.sectionType === 'videos'
    || firstSection.sectionType === 'watch'
  )
}

export function getCachedPageForRoute(nuxtApp, path) {
  if (!path || path.startsWith('/articles')) return null

  const data = nuxtApp?.payload?.data ?? nuxtApp?.static?.data ?? {}
  if (path === '/') return data['page-home'] ?? null

  const slug = path.replace(/^\//, '')
  if (!slug) return null

  return data[`page-${slug}`] ?? null
}

export function getCachedPageForFooter(nuxtApp, path) {
  if (!path) return null
  if (path === '/shop' || path.startsWith('/shop/')) {
    return getCachedPageForRoute(nuxtApp, '/shop')
  }
  return getCachedPageForRoute(nuxtApp, path)
}

export function pageHasVideosSection(page) {
  return (page?.sections || []).some((section) => section?.sectionType === 'videos')
}

export function pageShowsFooter(page) {
  return page?.showFooter === true
}
