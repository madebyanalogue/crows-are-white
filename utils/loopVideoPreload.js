export function getLoopVideoPreloadUrl(loop) {
  if (!loop || loop.kind === 'youtube') return ''
  return loop.url720 || loop.url || ''
}

export function getLoopVideoPreconnectOrigin(loop) {
  const href = getLoopVideoPreloadUrl(loop)
  if (!href) return ''

  try {
    return new URL(href).origin
  } catch {
    return ''
  }
}

export function getLoopVideoHeadLinks(loop) {
  const href = getLoopVideoPreloadUrl(loop)
  if (!href) return []

  const links = []
  const origin = getLoopVideoPreconnectOrigin(loop)

  if (origin) {
    links.push({
      key: 'hero-video-preconnect',
      rel: 'preconnect',
      href: origin,
      crossorigin: 'anonymous',
    })
  }

  links.push({
    key: 'hero-video-preload',
    rel: 'preload',
    as: 'video',
    href,
    type: 'video/mp4',
  })

  return links
}
