import {
  cloudflareStreamId,
  cloudflareStreamMp4Url,
  cloudflareStreamPosterUrl,
} from '~/utils/cloudflareStream'
import { resolveSanityAssetUrl } from '~/utils/sanity'

function pickCloudflarePoster(section, prefix) {
  const id720 = section[`${prefix}LoopCloudflare720`]
  const id1080 = section[`${prefix}LoopCloudflare1080`]
  return cloudflareStreamPosterUrl(id1080 || id720)
    || cloudflareStreamPosterUrl(id720)
    || ''
}

/**
 * Resolve a looping background/preview video from Sanity section fields.
 * @param {Record<string, unknown>} section
 * @param {string} prefix e.g. newsletter, hero, watch
 */
export function resolveSectionLoopVideo(section, prefix) {
  if (!section) return null

  const source = section[`${prefix}VideoSource`] || section[`${prefix}LoopSource`] || null
  const mediaType = section[`${prefix}MediaType`]

  const cloudflare720 = cloudflareStreamMp4Url(section[`${prefix}LoopCloudflare720`])
  const cloudflare1080 = cloudflareStreamMp4Url(section[`${prefix}LoopCloudflare1080`])
  const uploadUrl =
    resolveSanityAssetUrl(section[`${prefix}VideoFile`]?.asset)
    || resolveSanityAssetUrl(section[`${prefix}Video`]?.asset)
    || section[`${prefix}VideoSrc`]
    || ''
  const youtubeId = section[`${prefix}YoutubeId`] || section[`${prefix}VideoId`] || ''

  const usesCloudflare =
    source === 'cloudflare'
    || (mediaType === 'video' && section[`${prefix}VideoSource`] === 'cloudflare')
    || Boolean(cloudflare720 || cloudflare1080)

  if (usesCloudflare && (cloudflare720 || cloudflare1080)) {
    const streamId = cloudflareStreamId(section[`${prefix}LoopCloudflare1080`])
      || cloudflareStreamId(section[`${prefix}LoopCloudflare720`])

    return {
      kind: 'cloudflare',
      streamId,
      url720: cloudflare720 || cloudflare1080,
      url1080: cloudflare1080 || cloudflare720,
      url: cloudflare1080 || cloudflare720,
      posterUrl: pickCloudflarePoster(section, prefix),
    }
  }

  if (uploadUrl) {
    const dimensions = section[`${prefix}Video`]?.asset?.metadata?.dimensions
    return {
      kind: 'mp4',
      url: uploadUrl,
      url720: uploadUrl,
      url1080: uploadUrl,
      posterUrl: '',
      width: dimensions?.width,
      height: dimensions?.height,
    }
  }

  if (youtubeId) {
    return {
      kind: 'youtube',
      youtubeId: String(youtubeId),
    }
  }

  return null
}
