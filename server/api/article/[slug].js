import { getSanityClient } from '~/utils/sanity'

const portableTextProjection = `{
  _type,
  _key,
  style,
  listItem,
  level,
  children[] {
    _type,
    _key,
    text,
    marks
  },
  markDefs[] {
    _type,
    _key,
    href
  }
}`

const imageProjection = `{
  _type,
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

const linkProjection = `{
  type,
  linkTitle,
  page-> {
    slug { current }
  },
  url
}`

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  try {
    const client = getSanityClient(useRuntimeConfig())
    const query = `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title[] ${portableTextProjection},
      intro[] ${portableTextProjection},
      slug,
      indexLayout,
      thumbnailDisplayType,
      thumbnailText,
      showFeaturedImageOnArticle,
      featuredImage ${imageProjection},
      content[] {
        _type,
        _key,
        text[] ${portableTextProjection},
        dropCap,
        image ${imageProjection},
        caption,
        tiltAndShadow,
        subtitle,
        title[] ${portableTextProjection},
        description[] ${portableTextProjection},
        link ${linkProjection}
      }
    }`

    const article = await client.fetch(query, { slug }, {
      timeout: 30000,
      perspective: 'published',
    })

    return article || null
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch article',
      data: error,
    })
  }
})
