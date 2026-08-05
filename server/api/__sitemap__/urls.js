import { fetchSitemapUrls } from '~/server/utils/sitemapUrls'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  return fetchSitemapUrls(config)
})
