import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

function getSanityConfig(config) {
  return {
    projectId: config?.public?.sanity?.projectId || '11cdscj2',
    dataset: config?.public?.sanity?.dataset || 'production',
    apiVersion: config?.public?.sanity?.apiVersion || '2024-03-19',
  }
}

export function getSanityClient(config, options = {}) {
  const { projectId, dataset, apiVersion } = getSanityConfig(config)
  const useCdn = options.useCdn ?? (
    import.meta.server
      ? config?.sanityUseCdn === true
      : config?.public?.sanity?.useCdn !== false
  )

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
  })
}

export function getImageUrlBuilder(config) {
  return createImageUrlBuilder(getSanityConfig(config))
}

export function urlFor(source, config) {
  return getImageUrlBuilder(config).image(source)
}

export function resolveSanityAssetUrl(asset) {
  if (!asset) return null
  if (asset.url) return asset.url

  const ref = asset._ref || asset._id
  if (typeof ref !== 'string') return null

  const imageMatch = ref.match(/image-([^-]+)-(\d+)x(\d+)-(\w+)/)
  if (imageMatch) {
    const [, assetId, width, height, ext] = imageMatch
    return `https://cdn.sanity.io/images/11cdscj2/production/${assetId}-${width}x${height}.${ext}`
  }

  const fileMatch = ref.match(/file-([^-]+)-(\w+)/)
  if (fileMatch) {
    const [, assetId, ext] = fileMatch
    return `https://cdn.sanity.io/files/11cdscj2/production/${assetId}.${ext}`
  }

  return null
}
