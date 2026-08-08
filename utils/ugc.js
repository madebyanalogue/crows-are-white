const MAX_LOCATION_LENGTH = 80
const MAX_EMAIL_LENGTH = 254
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

export function normalizeUgcLocation(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function validateUgcSubmission({ city, country, email, imageType, imageSize }) {
  const normalizedCity = normalizeUgcLocation(city)
  const normalizedCountry = normalizeUgcLocation(country)

  if (!normalizedCity) return 'City is required.'
  if (normalizedCity.length > MAX_LOCATION_LENGTH) return 'City is too long.'
  if (!normalizedCountry) return 'Country is required.'
  if (normalizedCountry.length > MAX_LOCATION_LENGTH) return 'Country is too long.'

  if (email && String(email).trim().length > MAX_EMAIL_LENGTH) {
    return 'Email is too long.'
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return 'Please enter a valid email address.'
  }

  if (!imageType || !ALLOWED_IMAGE_TYPES.has(imageType)) {
    return 'Please upload a JPEG, PNG, or WebP image.'
  }

  if (!Number.isFinite(imageSize) || imageSize <= 0) {
    return 'Please upload a photo.'
  }

  if (imageSize > MAX_IMAGE_BYTES) {
    return 'Photo must be 10 MB or smaller.'
  }

  return null
}

export function formatUgcSignOff(city, country) {
  return [normalizeUgcLocation(city), normalizeUgcLocation(country)].filter(Boolean).join(', ')
}

export function mapUgcDocument(doc) {
  if (!doc) return null

  const imageUrl = doc.image?.asset?.url || null
  const city = normalizeUgcLocation(doc.city)
  const country = normalizeUgcLocation(doc.country)

  return {
    _id: doc._id,
    city,
    country,
    signOff: formatUgcSignOff(city, country),
    imageUrl,
    lqip: doc.image?.asset?.metadata?.lqip || '',
    status: doc.status || 'approved',
    submittedAt: doc.submittedAt || null,
    approvedAt: doc.approvedAt || null,
    isPending: doc.status === 'pending',
  }
}
