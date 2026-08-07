/**
 * Resolve a Cloudflare Stream ID or direct MP4 URL for native <video> playback.
 * Accepts a Stream video ID or a full https URL (e.g. R2-hosted MP4).
 * @see https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/
 */
export function cloudflareStreamMp4Url(videoIdOrUrl) {
  const value = typeof videoIdOrUrl === 'string' ? videoIdOrUrl.trim() : ''
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://videodelivery.net/${value}/downloads/default.mp4`
}

export function cloudflareStreamId(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parts = new URL(trimmed).pathname.split('/').filter(Boolean)
      return parts[0] || ''
    } catch {
      return ''
    }
  }
  return trimmed
}

export function cloudflareStreamPosterUrl(videoIdOrUrl, { height = 720 } = {}) {
  const id = cloudflareStreamId(videoIdOrUrl)
  if (!id || id.includes('.')) return ''
  return `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg?time=0s&height=${height}`
}

export function cloudflareStreamIframeUrl(videoIdOrUrl) {
  const id = cloudflareStreamId(videoIdOrUrl)
  if (!id || id.includes('.')) return ''

  const params = new URLSearchParams({
    autoplay: 'true',
    muted: 'true',
    loop: 'true',
    controls: 'false',
    preload: 'true',
  })

  return `https://iframe.videodelivery.net/${id}?${params.toString()}`
}

/**
 * Pick the best looping thumbnail URL from Sanity video data.
 * Prefers Cloudflare (1080p on large screens, 720p otherwise) then MP4 upload.
 */
export function resolveLoopingThumbnailUrls(video, { prefer1080 = true } = {}) {
  const empty = { source: null, url720: '', url1080: '', url: '' }
  if (video?.thumbnailType === 'image') return empty

  const cloudflare720 = video?.thumbnailLoopCloudflare720Url
    || cloudflareStreamMp4Url(video?.thumbnailLoopCloudflare720)
  const cloudflare1080 = video?.thumbnailLoopCloudflare1080Url
    || cloudflareStreamMp4Url(video?.thumbnailLoopCloudflare1080)
  const uploadUrl = video?.thumbnailVideoUrl || video?.thumbnailVideo?.asset?.url || ''
  const usesCloudflare = video?.thumbnailVideoSource === 'cloudflare'
    || Boolean(cloudflare720 || cloudflare1080)

  if (usesCloudflare && (cloudflare720 || cloudflare1080)) {
    return {
      source: 'cloudflare',
      url720: cloudflare720 || cloudflare1080,
      url1080: cloudflare1080 || cloudflare720,
      url: prefer1080
        ? (cloudflare1080 || cloudflare720)
        : (cloudflare720 || cloudflare1080),
    }
  }

  return {
    source: uploadUrl ? 'upload' : null,
    url720: uploadUrl,
    url1080: uploadUrl,
    url: uploadUrl,
  }
}
