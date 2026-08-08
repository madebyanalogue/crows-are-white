import { getSanityClient } from '~/utils/sanity'
import { getRouterPageSlug, pageDocumentFilter, sanityFetchOptions } from '~/server/utils/sanityQuery'
import { colorField } from '~/server/utils/sanityColor'

export default defineEventHandler(async (event) => {
  const slug = getRouterPageSlug(event)

  try {
    const client = getSanityClient(useRuntimeConfig())
    const colors = await client.fetch(
      `*[${pageDocumentFilter()}][0] {
        showFooter,
        ${colorField('pageColor')},
        ${colorField('pageTextColor')}
      }`,
      { slug },
      sanityFetchOptions({ timeout: 10000 }),
    )

    return colors || {}
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch page colour',
      data: error,
    })
  }
})
