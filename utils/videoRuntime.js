export function formatRuntime(seconds) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return ''
  const total = Math.round(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Params for cinematic full-screen Vimeo embeds (custom controls, minimal chrome). */
export const VIMEO_CINEMATIC_PARAMS = {
  autoplay: 1,
  byline: 0,
  portrait: 0,
  title: 0,
  dnt: 1,
  controls: 0,
  transparent: 0,
}

export function buildVimeoPlayerUrl(videoData, extraParams = {}) {
  if (!videoData?.id) return null

  const params = new URLSearchParams()
  if (videoData.hash) params.set('h', videoData.hash)
  Object.entries(extraParams).forEach(([key, value]) => {
    params.set(key, String(value))
  })

  const query = params.toString()
  return query
    ? `https://player.vimeo.com/video/${videoData.id}?${query}`
    : `https://player.vimeo.com/video/${videoData.id}`
}

export function resolveCinematicProvider(config = {}) {
  if (config.provider) return config.provider
  if (config.videoSrc) return 'native'
  if (config.youtubeId) return 'youtube'
  if (config.vimeoId || config.vimeoUrl) return 'vimeo'
  return null
}

export function parseYoutubeId(input) {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id || null
    }
    const fromQuery = url.searchParams.get('v')
    if (fromQuery) return fromQuery
    const parts = url.pathname.split('/').filter(Boolean)
    const embedIndex = parts.indexOf('embed')
    if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1]
    const shortsIndex = parts.indexOf('shorts')
    if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1]
  } catch {
    const match = trimmed.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
    return match?.[1] || null
  }

  return null
}

export function parseVimeoData(input) {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return { id: trimmed, hash: null }

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split('/').filter(Boolean)
    let id = null
    let hash = url.searchParams.get('h') || null

    const videoIndex = parts.indexOf('video')
    if (videoIndex >= 0 && parts[videoIndex + 1] && /^\d+$/.test(parts[videoIndex + 1])) {
      id = parts[videoIndex + 1]
      if (!hash && parts[videoIndex + 2]) hash = parts[videoIndex + 2]
    } else {
      const idIndex = parts.findIndex((segment) => /^\d+$/.test(segment))
      if (idIndex >= 0) {
        id = parts[idIndex]
        if (!hash && parts[idIndex + 1]) hash = parts[idIndex + 1]
      }
    }

    if (!id) return null
    return { id, hash }
  } catch {
    const match = trimmed.match(/(?:vimeo\.com\/|video\/)(\d+)(?:\/([A-Za-z0-9]+))?/)
    if (!match) return null
    return {
      id: match[1],
      hash: match[2] || null,
    }
  }
}
