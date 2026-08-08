import { createClient } from '@sanity/client'

function getSanityConfig(config) {
  return {
    projectId: config?.public?.sanity?.projectId || '11cdscj2',
    dataset: config?.public?.sanity?.dataset || 'production',
    apiVersion: config?.public?.sanity?.apiVersion || '2025-01-01',
  }
}

export function getSanityWriteClient(config) {
  const token = config?.sanityWriteToken
  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'UGC submissions are not configured.',
    })
  }

  const { projectId, dataset, apiVersion } = getSanityConfig(config)

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })
}
