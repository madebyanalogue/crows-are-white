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
  if (!loop || loop.kind === 'youtube') return []

  const links = []
  const origin = getLoopVideoPreconnectOrigin(loop)

  if (origin) {
    links.push({
      key: `loop-video-preconnect-${loop.kind || 'mp4'}`,
      rel: 'preconnect',
      href: origin,
      crossorigin: 'anonymous',
    })
  }

  const href = getLoopVideoPreloadUrl(loop)
  if (!href) return links

  links.push({
    key: 'loop-video-preload',
    rel: 'preload',
    as: 'fetch',
    href,
    type: 'video/mp4',
    crossorigin: 'anonymous',
  })

  if (loop.posterUrl) {
    links.push({
      key: 'loop-video-poster-preload',
      rel: 'preload',
      as: 'image',
      href: loop.posterUrl,
    })
  }

  return links
}
