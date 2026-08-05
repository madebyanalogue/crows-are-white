import { getSanityClient } from '~/utils/sanity'

function toLastmod(value) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function pagePath(slug) {
  if (!slug || slug === 'home') return '/'
  return `/${slug}`
}

export async function fetchSitemapUrls(config) {
  const client = getSanityClient(config)

  const [pages, articles] = await Promise.all([
    client.fetch(`*[_type == "page" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }`),
    client.fetch(`*[_type == "article" && defined(slug.current)] {
      "slug": slug.current,
      publishedAt,
      _updatedAt
    }`),
  ])

  const urls = []
  const seen = new Set()

  for (const page of pages) {
    const loc = pagePath(page.slug)
    if (seen.has(loc)) continue
    seen.add(loc)
    urls.push({
      loc,
      lastmod: toLastmod(page._updatedAt),
    })
  }

  for (const article of articles) {
    const loc = `/articles/${article.slug}`
    if (seen.has(loc)) continue
    seen.add(loc)
    urls.push({
      loc,
      lastmod: toLastmod(article.publishedAt || article._updatedAt),
    })
  }

  return urls
}
