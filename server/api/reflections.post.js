import { getSanityWriteClient } from '~/server/utils/sanityWrite'
import {
  mapReflectionDocument,
  normalizeReflectionField,
  validateReflectionSubmission,
} from '~/utils/reflections'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const validationError = validateReflectionSubmission({
    name: body?.name,
    city: body?.city,
    country: body?.country,
    reflection: body?.reflection,
    paperColor: body?.paperColor,
  })

  if (validationError) {
    throw createError({
      statusCode: 400,
      statusMessage: validationError,
    })
  }

  const config = useRuntimeConfig()
  const client = getSanityWriteClient(config)

  const name = normalizeReflectionField(body?.name)
  const city = normalizeReflectionField(body?.city)
  const country = normalizeReflectionField(body?.country)
  const reflection = normalizeReflectionField(body?.reflection)
  const paperColor = String(body?.paperColor ?? '').trim()
  const submittedAt = new Date().toISOString()

  const doc = await client.create({
    _type: 'reflectionSubmission',
    name: name || undefined,
    city: city || undefined,
    country: country || undefined,
    reflection,
    paperColor,
    status: 'pending',
    submittedAt,
  })

  return {
    success: true,
    item: mapReflectionDocument({
      _id: doc._id,
      name,
      city,
      country,
      reflection,
      paperColor,
      status: 'pending',
      submittedAt,
    }),
  }
})
