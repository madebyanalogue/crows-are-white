import { cloudflareStreamMp4Url } from '~/utils/cloudflareStream'
import { getSanityClient } from '~/utils/sanity'
import { parseVimeoData } from '~/utils/videoRuntime'

const fileProjection = `{
  asset-> {
    _id,
    url,
    mimeType
  }
}`

const imageProjection = `{
  asset-> {
    _id,
    url,
    metadata {
      dimensions,
      lqip
    }
  },
  alt,
  hotspot,
  crop
}`

function parseVimeoId(input) {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split('/').filter(Boolean)
    const videoIndex = parts.indexOf('video')
    if (videoIndex >= 0 && parts[videoIndex + 1] && /^\d+$/.test(parts[videoIndex + 1])) {
      return parts[videoIndex + 1]
    }
    const id = parts.find((segment) => /^\d+$/.test(segment))
    return id || null
  } catch {
    const match = trimmed.match(/(?:vimeo\.com\/|video\/)(\d+)/)
    return match?.[1] || null
  }
}

async function fetchVimeoRuntimeSeconds(vimeoUrl) {
  if (!vimeoUrl) return null
  try {
    const endpoint = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}`
    const data = await $fetch(endpoint, { timeout: 8000 })
    const duration = Number(data?.duration)
    return Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null
  } catch {
    return null
  }
}

export default defineEventHandler(async () => {
  try {
    const client = getSanityClient(useRuntimeConfig())
    const query = `*[_type == "video"] | order(orderRank asc) {
      _id,
      title,
      sourceType,
      vimeoUrl,
      runtimeSeconds,
      thumbnailType,
      thumbnailVideoSource,
      thumbnailLoopCloudflare720,
      thumbnailLoopCloudflare1080,
      thumbnailImage ${imageProjection},
      videoFile ${fileProjection},
      thumbnailVideo ${fileProjection}
    }`

    const videos = await client.fetch(query)

    const enriched = await Promise.all(
      (videos || []).map(async (video) => {
        const vimeoData = video.sourceType === 'vimeo' ? parseVimeoData(video.vimeoUrl) : null
        const vimeoId = vimeoData?.id || null
        const vimeoHash = vimeoData?.hash || null
        let runtimeSeconds = typeof video.runtimeSeconds === 'number'
          ? video.runtimeSeconds
          : null

        if (runtimeSeconds == null && video.sourceType === 'vimeo' && video.vimeoUrl) {
          runtimeSeconds = await fetchVimeoRuntimeSeconds(video.vimeoUrl)
        }

        const thumbnailVideoUrl = video.thumbnailVideo?.asset?.url || null
        const thumbnailLoopCloudflare720Url = cloudflareStreamMp4Url(video.thumbnailLoopCloudflare720)
        const thumbnailLoopCloudflare1080Url = cloudflareStreamMp4Url(video.thumbnailLoopCloudflare1080)
        const usesCloudflareLoop = video.thumbnailVideoSource === 'cloudflare'
          && Boolean(thumbnailLoopCloudflare720Url || thumbnailLoopCloudflare1080Url)

        return {
          ...video,
          vimeoId,
          vimeoHash,
          runtimeSeconds,
          videoUrl: video.sourceType === 'upload'
            ? (video.videoFile?.asset?.url || null)
            : null,
          thumbnailVideoUrl: usesCloudflareLoop
            ? (thumbnailLoopCloudflare1080Url || thumbnailLoopCloudflare720Url)
            : thumbnailVideoUrl,
          thumbnailLoopCloudflare720Url,
          thumbnailLoopCloudflare1080Url,
          thumbnailImageUrl: video.thumbnailImage?.asset?.url || null,
        }
      }),
    )

    return enriched
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch videos',
      data: error,
    })
  }
})
