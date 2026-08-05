import { getSanityClient } from '~/utils/sanity'

const portableTextProjection = `{
  _type,
  _key,
  style,
  children[] {
    _type,
    _key,
    text,
    marks
  }
}`

export default defineEventHandler(async (event) => {
  try {
    const client = getSanityClient(useRuntimeConfig())
    const query = `*[_type == "article"] | order(publishedAt desc, _createdAt desc) {
      _id,
      title[] ${portableTextProjection},
      slug,
      indexLayout,
      brandDecor,
      brandColor,
      publishedAt,
      thumbnailDisplayType,
      thumbnailText,
      featuredImage {
        asset-> {
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        },
        alt
      }
    }`

    return await client.fetch(query)
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch articles',
      data: error,
    })
  }
})
