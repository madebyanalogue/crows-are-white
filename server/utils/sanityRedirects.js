/** GROQ: enabled URL redirects from Site Settings. */
export const SITE_REDIRECTS_QUERY = `*[_type == "siteSettings"][0].redirects[
  enabled != false
  && defined(from)
  && defined(to)
] {
  "from": from,
  "to": to
}`

/** Fetch enabled URL redirects from Site Settings. */
export async function fetchSanityRedirects() {
  const config = useRuntimeConfig()
  const projectId = config.public.sanity?.projectId || '11cdscj2'
  const dataset = config.public.sanity?.dataset || 'production'
  const apiVersion = config.public.sanity?.apiVersion || '2024-03-19'

  const response = await $fetch(
    `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: SITE_REDIRECTS_QUERY }),
    },
  )

  return response?.result ?? []
}
