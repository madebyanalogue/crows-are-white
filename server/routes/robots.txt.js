import { getSiteConfig, getSiteIndexable } from '#site-config/server/composables'

export default defineEventHandler((event) => {
  const siteConfig = getSiteConfig(event)
  const indexable = getSiteIndexable(event)
  const siteUrl = siteConfig.url?.replace(/\/$/, '')

  const lines = ['User-agent: *']

  if (indexable) {
    lines.push('Allow: /')
    if (siteUrl) {
      lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`)
    }
  } else {
    lines.push('Disallow: /')
  }

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return `${lines.join('\n')}\n`
})
