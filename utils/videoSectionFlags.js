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

export function pageHasTransparentVideoHero(page) {
  const firstSection = (page?.sections || []).find(Boolean)
  if (!firstSection) return false
  return videoSectionTransparentHeader(firstSection)
}

export function pageRemovesHeaderPadding(page) {
  const firstSection = (page?.sections || []).find(Boolean)
  if (!firstSection) return false
  return (
    videoSectionRemoveHeaderPadding(firstSection)
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
