import { getSanityWriteClient } from '~/server/utils/sanityWrite'
import {
  formatUgcSignOff,
  mapUgcDocument,
  normalizeUgcLocation,
  validateUgcSubmission,
} from '~/utils/ugc'

function getFormField(parts, name) {
  const part = parts.find((entry) => entry.name === name)
  if (!part) return ''
  return part.data?.toString('utf8') ?? ''
}

function getImagePart(parts) {
  return parts.find((entry) => entry.name === 'image' && entry.filename && entry.data?.length)
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid submission.',
    })
  }

  const city = getFormField(parts, 'city')
  const country = getFormField(parts, 'country')
  const email = getFormField(parts, 'email')
  const imagePart = getImagePart(parts)

  const validationError = validateUgcSubmission({
    city,
    country,
    email,
    imageType: imagePart?.type,
    imageSize: imagePart?.data?.length,
  })

  if (validationError) {
    throw createError({
      statusCode: 400,
      statusMessage: validationError,
    })
  }

  const config = useRuntimeConfig()
  const client = getSanityWriteClient(config)

  const asset = await client.assets.upload('image', imagePart.data, {
    filename: imagePart.filename,
    contentType: imagePart.type,
  })

  const normalizedCity = normalizeUgcLocation(city)
  const normalizedCountry = normalizeUgcLocation(country)
  const trimmedEmail = String(email || '').trim()
  const submittedAt = new Date().toISOString()

  const doc = await client.create({
    _type: 'ugcSubmission',
    city: normalizedCity,
    country: normalizedCountry,
    email: trimmedEmail || undefined,
    status: 'pending',
    submittedAt,
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    },
  })

  const imageUrl = asset.url || null

  return {
    success: true,
    item: mapUgcDocument({
      _id: doc._id,
      city: normalizedCity,
      country: normalizedCountry,
      status: 'pending',
      submittedAt,
      image: {
        asset: {
          url: imageUrl,
          metadata: { lqip: '' },
        },
      },
    }),
    signOff: formatUgcSignOff(normalizedCity, normalizedCountry),
  }
})
