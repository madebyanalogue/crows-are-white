export const REFLECTION_PAPER_COLORS = [
  { value: 'peach', label: 'Peach', hex: '#f1c1ae', text: '#3a2a22' },
  { value: 'blush', label: 'Blush', hex: '#f5d3e2', text: '#3a2430' },
  { value: 'butter', label: 'Butter', hex: '#fae8ac', text: '#3a3420' },
  { value: 'rose', label: 'Rose', hex: '#d08b80', text: '#3a2420' },
  { value: 'apricot', label: 'Apricot', hex: '#e0ac88', text: '#3a2c22' },
]

export const REFLECTION_PAPER_COLOR_VALUES = new Set(
  REFLECTION_PAPER_COLORS.map((entry) => entry.value),
)

export const REFLECTION_PAPER_COLOR_MAP = Object.fromEntries(
  REFLECTION_PAPER_COLORS.map((entry) => [entry.value, entry]),
)

export function getReflectionPaperStyle(paperColor) {
  const color = REFLECTION_PAPER_COLOR_MAP[paperColor] || REFLECTION_PAPER_COLORS[0]
  return {
    '--reflection-paper-bg': color.hex,
    '--reflection-paper-text': color.text,
  }
}

export const REFLECTION_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China',
  'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Egypt', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'Iceland',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan',
  'Jordan', 'Kenya', 'Latvia', 'Lebanon', 'Lithuania', 'Malaysia', 'Mexico',
  'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia',
  'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea',
  'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
]

const MAX_NAME_LENGTH = 80
const MAX_LOCATION_LENGTH = 80
const MAX_REFLECTION_LENGTH = 500

export function normalizeReflectionField(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function formatReflectionAttribution({ name, city, country }) {
  const normalizedName = normalizeReflectionField(name)
  const normalizedCity = normalizeReflectionField(city)
  const normalizedCountry = normalizeReflectionField(country)

  if (normalizedName && normalizedCity && normalizedCountry) {
    return `${normalizedName}, ${normalizedCity}, ${normalizedCountry}`
  }

  if (normalizedCity && normalizedCountry) {
    return `A reflection from ${normalizedCity}, ${normalizedCountry}`
  }

  if (normalizedCountry && !normalizedCity) {
    return `Shared from ${normalizedCountry}`
  }

  return 'Anonymous'
}

export function validateReflectionSubmission({ name, city, country, reflection, paperColor }) {
  const normalizedReflection = normalizeReflectionField(reflection)
  const normalizedName = normalizeReflectionField(name)
  const normalizedCity = normalizeReflectionField(city)
  const normalizedCountry = normalizeReflectionField(country)
  const normalizedPaperColor = String(paperColor ?? '').trim()

  if (!normalizedReflection) return 'Please share your reflection.'
  if (normalizedReflection.length > MAX_REFLECTION_LENGTH) {
    return 'Reflection is too long.'
  }

  if (normalizedName.length > MAX_NAME_LENGTH) return 'Name is too long.'
  if (normalizedCity.length > MAX_LOCATION_LENGTH) return 'City is too long.'
  if (normalizedCountry.length > MAX_LOCATION_LENGTH) return 'Country is too long.'

  if (normalizedCity && !normalizedCountry) {
    return 'Country is required when a city is entered.'
  }

  if (!normalizedPaperColor || !REFLECTION_PAPER_COLOR_VALUES.has(normalizedPaperColor)) {
    return 'Please choose a paper colour.'
  }

  return null
}

export function mapReflectionDocument(doc) {
  if (!doc) return null

  const name = normalizeReflectionField(doc.name)
  const city = normalizeReflectionField(doc.city)
  const country = normalizeReflectionField(doc.country)
  const reflection = normalizeReflectionField(doc.reflection)
  const paperColor = String(doc.paperColor ?? '').trim()

  return {
    _id: doc._id,
    name,
    city,
    country,
    reflection,
    paperColor,
    attribution: formatReflectionAttribution({ name, city, country }),
    status: doc.status || 'approved',
    submittedAt: doc.submittedAt || null,
    approvedAt: doc.approvedAt || null,
    isPending: doc.status === 'pending',
  }
}
