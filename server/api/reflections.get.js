import { getSanityClient } from '~/utils/sanity'
import { sanityFetchOptions } from '~/server/utils/sanityQuery'
import { mapReflectionDocument } from '~/utils/reflections'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(
    Math.max(Number.parseInt(String(query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  )

  const config = useRuntimeConfig()
  const client = getSanityClient(config, { useCdn: true })

  const groq = `*[_type == "reflectionSubmission" && status == "approved"]
    | order(coalesce(approvedAt, submittedAt) desc) [0...$limit] {
      _id,
      name,
      city,
      country,
      reflection,
      paperColor,
      status,
      submittedAt,
      approvedAt
    }`

  const docs = await client.fetch(groq, { limit }, sanityFetchOptions())

  setResponseHeaders(event, {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  })

  return {
    items: docs.map(mapReflectionDocument).filter(Boolean),
  }
})
