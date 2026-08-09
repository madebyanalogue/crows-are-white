const REFLECTION_PAPER_TEXT = '#4a4844'

export const REFLECTION_PAPER_COLORS = [
  { value: 'warmIvory', label: 'Warm ivory', hex: '#f8f5f1', text: REFLECTION_PAPER_TEXT },
  { value: 'fadedCream', label: 'Faded cream', hex: '#f9f7f0', text: REFLECTION_PAPER_TEXT },
  { value: 'paleRicePaper', label: 'Pale rice paper', hex: '#f7f6f4', text: REFLECTION_PAPER_TEXT },
  { value: 'softGrey', label: 'Soft grey', hex: '#f3f3f2', text: REFLECTION_PAPER_TEXT },
  { value: 'agedWhite', label: 'Aged white', hex: '#f6f5f2', text: REFLECTION_PAPER_TEXT },
]

const LEGACY_PAPER_COLOR_ALIASES = {
  peach: 'warmIvory',
  blush: 'fadedCream',
  butter: 'paleRicePaper',
  rose: 'softGrey',
  apricot: 'agedWhite',
}

export const REFLECTION_PAPER_COLOR_VALUES = new Set(
  REFLECTION_PAPER_COLORS.map((entry) => entry.value),
)

export const REFLECTION_PAPER_COLOR_MAP = Object.fromEntries(
  REFLECTION_PAPER_COLORS.map((entry) => [entry.value, entry]),
)

export function normalizeReflectionPaperColor(paperColor) {
  const normalized = String(paperColor ?? '').trim()
  if (!normalized) return ''
  return LEGACY_PAPER_COLOR_ALIASES[normalized] || normalized
}

export function getReflectionPaperStyle(paperColor) {
  const resolved = normalizeReflectionPaperColor(paperColor)
  const color = REFLECTION_PAPER_COLOR_MAP[resolved] || REFLECTION_PAPER_COLOR_MAP.paleRicePaper
  return {
    '--reflection-paper-bg': color.hex,
    '--reflection-paper-text': color.text,
  }
}

export function pickReflectionPaperColor(seed = '') {
  if (!REFLECTION_PAPER_COLORS.length) return 'paleRicePaper'

  const value = String(seed ?? '')
  if (!value) {
    const index = Math.floor(Math.random() * REFLECTION_PAPER_COLORS.length)
    return REFLECTION_PAPER_COLORS[index].value
  }

  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index)
    hash |= 0
  }

  return REFLECTION_PAPER_COLORS[Math.abs(hash) % REFLECTION_PAPER_COLORS.length].value
}

export function resolveReflectionPaperColor(paperColor, seed = '') {
  const resolved = normalizeReflectionPaperColor(paperColor)
  if (resolved && REFLECTION_PAPER_COLOR_VALUES.has(resolved)) {
    return resolved
  }

  return pickReflectionPaperColor(seed)
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
export const MAX_LONGFORM_REFLECTION_LENGTH = 500

export function normalizeReflectionField(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function formatReflectionLocation({ city, country }) {
  const normalizedCity = normalizeReflectionField(city)
  const normalizedCountry = normalizeReflectionField(country)

  if (normalizedCity && normalizedCountry) {
    return `${normalizedCity}, ${normalizedCountry}`
  }

  if (normalizedCountry) return normalizedCountry
  if (normalizedCity) return normalizedCity
  return ''
}

export function formatReflectionNameCity({ name, city, country }) {
  const normalizedName = normalizeReflectionField(name)
  const normalizedCity = normalizeReflectionField(city)
  const normalizedCountry = normalizeReflectionField(country)

  return [normalizedName, normalizedCity, normalizedCountry]
    .filter(Boolean)
    .join(', ')
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

  if (normalizedPaperColor) {
    const resolved = normalizeReflectionPaperColor(normalizedPaperColor)
    if (!REFLECTION_PAPER_COLOR_VALUES.has(resolved)) {
      return 'Invalid paper colour.'
    }
  }

  return null
}

export function mapReflectionDocument(doc) {
  if (!doc) return null

  const name = normalizeReflectionField(doc.name)
  const city = normalizeReflectionField(doc.city)
  const country = normalizeReflectionField(doc.country)
  const reflection = normalizeReflectionField(doc.reflection)
  const paperColor = normalizeReflectionPaperColor(doc.paperColor) || 'paleRicePaper'

  return {
    _id: doc._id,
    name,
    city,
    country,
    reflection,
    paperColor,
    longform: doc.longform === true,
    attribution: formatReflectionAttribution({ name, city, country }),
    status: doc.status || 'approved',
    submittedAt: doc.submittedAt || null,
    approvedAt: doc.approvedAt || null,
    isPending: doc.status === 'pending',
  }
}

export function getReflectionLocationKey(city, country) {
  return `${normalizeReflectionField(city).toLowerCase()}|${normalizeReflectionField(country).toLowerCase()}`
}

export function reflectionMatchesLocation(item, location) {
  if (!item || !location) return false

  return getReflectionLocationKey(item.city, item.country)
    === getReflectionLocationKey(location.city, location.country)
}

export function filterReflectionsByLocation(items = [], location) {
  if (!location) return items

  const exactMatches = items.filter((item) => reflectionMatchesLocation(item, location))
  if (exactMatches.length) return exactMatches

  const country = normalizeReflectionField(location.country).toLowerCase()
  if (!country) return items

  const countryMatches = items.filter((item) =>
    normalizeReflectionField(item.country).toLowerCase() === country,
  )

  return countryMatches.length ? countryMatches : items
}

export function filterReflectionsByLocations(items = [], locations = []) {
  if (!locations?.length) return items

  const matches = items.filter((item) =>
    locations.some((location) => reflectionMatchesLocation(item, location)),
  )

  return matches.length ? matches : items
}

export function filterReflectionsByMapMarker(items = [], marker) {
  if (!marker?.locations?.length) return items

  if (marker.isCluster) {
    return filterReflectionsByLocations(items, marker.locations)
  }

  return filterReflectionsByLocation(items, marker.locations[0])
}

function hashString(value) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

export function pickFeaturedReflections(items = [], limit = 6) {
  if (!items.length) return []

  const capped = Math.min(Math.max(limit, 1), items.length)
  const recentCount = Math.min(2, capped)
  const recent = items.slice(0, recentCount)
  const recentIds = new Set(recent.map((item) => item._id))
  const pool = items.filter((item) => !recentIds.has(item._id))
  const shuffled = [...pool].sort((left, right) =>
    hashString(left._id || '') - hashString(right._id || ''),
  )

  return [...recent, ...shuffled].slice(0, capped)
}

export function pickReflectionBatch(items = [], limit = 6, batchIndex = 0) {
  if (!items.length) return []

  const capped = Math.min(Math.max(limit, 1), items.length)
  const sorted = [...items].sort((left, right) =>
    hashString(`${batchIndex}:${left._id || ''}`) - hashString(`${batchIndex}:${right._id || ''}`),
  )
  const start = (batchIndex * capped) % sorted.length

  return [...sorted.slice(start), ...sorted.slice(0, start)].slice(0, capped)
}

export function getReflectionCountries(items = []) {
  const countries = new Set()

  for (const item of items) {
    const country = normalizeReflectionField(item?.country)
    if (country) countries.add(country)
  }

  return [...countries].sort((left, right) => left.localeCompare(right))
}

export function filterReflectionsByCountry(items = [], country) {
  const normalizedCountry = normalizeReflectionField(country).toLowerCase()
  if (!normalizedCountry) return items

  return items.filter((item) =>
    normalizeReflectionField(item?.country).toLowerCase() === normalizedCountry,
  )
}

export function sortReflectionsNewest(items = []) {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left?.approvedAt || left?.submittedAt || '') || 0
    const rightTime = Date.parse(right?.approvedAt || right?.submittedAt || '') || 0
    return rightTime - leftTime
  })
}

export function sortReflectionsRandom(items = [], seed = 0) {
  return [...items].sort((left, right) =>
    hashString(`${seed}:${left?._id || ''}`) - hashString(`${seed}:${right?._id || ''}`),
  )
}

export function applyReflectionFilters(items = [], {
  location = null,
  mapMarker = null,
  country = '',
  sort = 'newest',
  randomSeed = 0,
} = {}) {
  let filtered = [...items]

  if (mapMarker) {
    filtered = filterReflectionsByMapMarker(filtered, mapMarker)
  } else if (location) {
    filtered = filterReflectionsByLocation(filtered, location)
  } else if (country) {
    filtered = filterReflectionsByCountry(filtered, country)
  }

  if (sort === 'random') {
    return sortReflectionsRandom(filtered, randomSeed)
  }

  return sortReflectionsNewest(filtered)
}
