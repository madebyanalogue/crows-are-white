import { findRedirect, getAllRedirects, isRedirectExemptPath, normalizePath } from '../utils/redirects'

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  if (isRedirectExemptPath(pathname)) {
    return
  }

  const redirects = await getAllRedirects()
  const match = findRedirect(pathname, redirects)

  if (match) {
    return sendRedirect(event, normalizePath(match.to), 301)
  }
})
