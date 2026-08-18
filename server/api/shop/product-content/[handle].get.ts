import { getSanityClient } from '~/utils/sanity'
import { sanityFetchOptions } from '~/server/utils/sanityQuery'

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

export default defineEventHandler(async (event) => {
  const handle = String(getRouterParam(event, 'handle') || '').trim().toLowerCase()

  if (!handle) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product handle is required',
    })
  }

  try {
    const config = useRuntimeConfig()
    const client = getSanityClient(config)

    const query = `*[
      _type == "shopProductContent" &&
      lower(shopifyHandle) == $handle
    ][0]{
      _id,
      shopifyHandle,
      aboutArtistTitle,
      "artist": artist->{
        _id,
        name,
        subtitle,
        website,
        instagram,
        headshot ${imageProjection},
        portrait ${imageProjection},
        bio[] ${portableTextProjection},
        whyWeChoseThisArtist[] ${portableTextProjection},
        gallery[] {
          _key,
          caption,
          image ${imageProjection}
        }
      }
    }`

    const content = await client.fetch(query, { handle }, sanityFetchOptions())

    return {
      content: content || null,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch shop product content',
      data: error,
    })
  }
})
