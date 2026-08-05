import { plainTextFromBlocks } from '~/utils/portableText'

export const DUMMY_ARTICLES_INDEX_INTRO = [
  {
    _type: 'block',
    _key: 'articles-index-intro',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'articles-index-intro-span',
        text: 'Stories on culture, commerce, and the people shaping what comes next.',
        marks: [],
      },
    ],
    markDefs: [],
  },
]

export const CATEGORY_LABELS = {
  standard: 'Feature',
  brand: 'Marque',
  finance: 'Finance',
}

export const ARTICLE_CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'standard', label: CATEGORY_LABELS.standard },
  { value: 'brand', label: CATEGORY_LABELS.brand },
  { value: 'finance', label: CATEGORY_LABELS.finance },
]

export function normalizeArticleCategory(value) {
  const raw = Array.isArray(value) ? value[0] : value
  return raw in CATEGORY_LABELS ? raw : 'all'
}

export const ARTICLE_INDEX_LAYOUT = [
  { type: 'standard-row', align: 'top', columns: [6, 4] },
  { type: 'brand' },
  { type: 'standard-row', align: 'top', columns: [4, 6] },
  { type: 'finance' },
  { type: 'standard-row', align: 'bottom', columns: [6, 4] },
  { type: 'brand' },
  { type: 'standard-row', align: 'bottom', columns: [4, 6] },
  { type: 'finance' },
]

export function getStandardRowClass(columns = []) {
  return `section-articles-index__row--${columns.join('-')}`
}

export function formatArticleDate(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatOrdinalArticleDate(dateString) {
  if (!dateString) return ''
  const normalized = dateString.includes('T')
    ? dateString.slice(0, 10)
    : dateString
  const date = new Date(`${normalized}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateString

  const day = date.getDate()
  const suffix = getOrdinalSuffix(day)
  const monthYear = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date)

  return `${day}${suffix} ${monthYear}`
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

export function groupArticlesByLayout(articles = []) {
  return articles.reduce((groups, article) => {
    const layout = article.category || article.indexLayout
    if (!layout || !groups[layout]) return groups
    groups[layout].push(article)
    return groups
  }, {
    standard: [],
    brand: [],
    finance: [],
  })
}

function portableTitleWithEmphasis(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks.map((block) => {
    if (block._type !== 'block' || !Array.isArray(block.children)) return ''
    return block.children.map((child) => {
      const text = child.text || ''
      if (!child.marks?.length) return text
      return child.marks.includes('em') ? `<em>${text}</em>` : text
    }).join('')
  }).join(' ').trim()
}

export function mapSanityArticleToIndex(article) {
  const slug = article.slug?.current || article.slug
  const layout = article.indexLayout || 'standard'
  const imageUrl = article.featuredImage?.asset?.url || ''
  const titleBlocks = article.title
  const titlePlain = typeof titleBlocks === 'string'
    ? titleBlocks
    : plainTextFromBlocks(titleBlocks)

  const mapped = {
    category: layout,
    indexLayout: layout,
    slug,
    title: layout === 'finance'
      ? portableTitleWithEmphasis(titleBlocks)
      : titlePlain,
    image: imageUrl,
    date: article.publishedAt || '',
  }

  if (layout === 'brand') {
    mapped.brandDecor = article.brandDecor || 'arc'
    mapped.brandColor = article.brandColor || 'arancio'
  }

  return mapped
}

export function buildArticleIndexBlocks(articlesByCategory = {}) {
  const pools = {
    standard: [...(articlesByCategory.standard || [])],
    brand: [...(articlesByCategory.brand || [])],
    finance: [...(articlesByCategory.finance || [])],
  }

  const remaining = () => pools.standard.length + pools.brand.length + pools.finance.length

  const blocks = []
  let cursor = 0
  let safety = 0

  // Cycle the editorial layout template until every article is placed, so the
  // grid scales to any number of Sanity articles.
  while (remaining() > 0 && safety < 1000) {
    safety += 1
    const template = ARTICLE_INDEX_LAYOUT[cursor % ARTICLE_INDEX_LAYOUT.length]
    cursor += 1

    if (template.type === 'standard-row') {
      const articles = [pools.standard.shift(), pools.standard.shift()].filter(Boolean)
      if (articles.length) blocks.push({ ...template, articles })
      continue
    }

    const article = pools[template.type]?.shift()
    if (article) blocks.push({ ...template, article })
  }

  return blocks
}
