import { getSanityClient } from '~/utils/sanity'

export default defineEventHandler(async () => {
  try {
    const client = getSanityClient(useRuntimeConfig())
    const query = `*[_type == "page"] | order(orderRank) {
      _id,
      title,
      slug,
      orderRank
    }`

    return await client.fetch(query)
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch pages',
      data: error,
    })
  }
})
