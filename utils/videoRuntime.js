export function formatRuntime(seconds) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return ''
  const total = Math.round(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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
