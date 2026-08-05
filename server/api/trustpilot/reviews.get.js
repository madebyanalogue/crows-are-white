import { getSanityClient } from '~/utils/sanity'
import {
  extractDomainFromTrustpilotUrl,
  getTrustpilotReviews,
  MAX_TRUSTPILOT_REVIEWS,
} from '~/server/utils/trustpilot'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const perPage = Math.min(Math.max(Number(query.perPage) || 5, 1), MAX_TRUSTPILOT_REVIEWS)
  const stars = query.stars ? Number(query.stars) : undefined
  const forceMock = query.mock === 'true'

  let domain = typeof query.domain === 'string' ? query.domain.trim() : ''

  if (!domain) {
    const client = getSanityClient(config)
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0] {
      trustpilot { url }
    }`)
    domain = extractDomainFromTrustpilotUrl(siteSettings?.trustpilot?.url)
  }

  return getTrustpilotReviews({
    apiKey: config.trustpilotApiKey,
    businessUnitId: config.trustpilotBusinessUnitId,
    domain,
    perPage,
    stars,
    forceMock,
  })
})
