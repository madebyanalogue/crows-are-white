import { getPageColorHtmlAttrs, pageBackgroundVar, extractPageChromeColors } from '~/utils/pageColors'
import { getCachedPageForRoute } from '~/utils/videoSectionFlags'

export function useAppliedPageColors() {
  return {
    pending: useState('dorsia_pendingPageColors', () => null),
    applied: useState('dorsia_appliedPageColors', () => null),
    swapped: useState('crows_pageColorSwapped', () => false),
  }
}

export function applyPendingPageColors() {
  const { pending, applied } = useAppliedPageColors()
  if (pending.value) {
    applied.value = { ...pending.value }
  }
}

function getKnownPageColorsForPath(nuxtApp, path) {
  if (!path) return null

  if (path === '/articles' || path === '/articles/') {
    return extractPageChromeColors()
  }

  if (path.startsWith('/articles/')) {
    return extractPageChromeColors({ pageColor: 'crayon' })
  }

  if (path === '/host-a-screening' || path === '/book-a-screening') {
    return extractPageChromeColors({
      pageColor: '#141414',
      pageTextColor: '#4f4f4e',
      menuBackgroundColor: '#ffffff',
      menuTextColor: '#1a1a1a',
      menuHighlightColor: '#ff59d0',
      basketIconColor: '#1a1a1a',
    })
  }

  if (path === '/watch' || path === '/watch/') {
    return extractPageChromeColors({
      pageColor: '#000000',
      pageTextColor: '#ffffff',
      menuBackgroundColor: '#0b0d0c',
      menuTextColor: '#ff555f',
      menuHighlightColor: '#ff555f',
      basketIconColor: '#ff555f',
    })
  }

  if (path === '/videos' || path === '/videos/') {
    return extractPageChromeColors({
      pageColor: '#e6f2e9',
      pageTextColor: 'obsidian',
      menuBackgroundColor: 'crema',
      menuTextColor: 'obsidian',
      menuHighlightColor: 'arancio',
    })
  }

  if (
    path === '/shop'
    || path === '/shop/'
    || path.startsWith('/shop/collections/')
  ) {
    return extractPageChromeColors({
      pageColor: '#ffffff',
      pageTextColor: '#111010',
      menuBackgroundColor: '#ffffff',
      menuTextColor: '#111010',
      menuHighlightColor: '#111010',
      basketIconColor: '#111010',
    })
  }

  const page = getCachedPageForRoute(nuxtApp, path)
  if (!page) return null

  return extractPageChromeColors(page)
}

export async function applyPageColorsFromRoute(path) {
  if (!import.meta.client || !path) return

  const nuxtApp = useNuxtApp()
  const { pending, applied } = useAppliedPageColors()

  let colors = getKnownPageColorsForPath(nuxtApp, path)

  if (!colors) {
    try {
      const slug = path === '/' ? 'home' : path.replace(/^\//, '')
      const pageColors = await $fetch(`/api/page-color/${slug}`)
      colors = extractPageChromeColors(pageColors)
    } catch {
      colors = extractPageChromeColors()
    }
  }

  pending.value = colors
  applied.value = colors
}

export function usePageColor(page) {
  const isTransitioning = useState('pageTransitioning', () => false)
  const { pending, applied, swapped } = useAppliedPageColors()

  watchEffect(() => {
    const pageValue = unref(page)
    const colors = extractPageChromeColors(pageValue)

    pending.value = colors

    const shouldApplyNow = import.meta.server
      || !isTransitioning.value
      || swapped.value

    if (shouldApplyNow) {
      applied.value = colors
    }
  })
}

export function usePageColorHead() {
  const { applied } = useAppliedPageColors()

  useHead(() => ({
    htmlAttrs: getPageColorHtmlAttrs(applied.value || {}),
  }))
}

export function suspendPageColorTransitions() {
  if (!import.meta.client) return
  document.documentElement.classList.remove('page-colors-transition-ready')
}

export function resetFooterBackgroundFadeState() {
  if (!import.meta.client) return

  const root = document.documentElement
  root.classList.remove('is-footer-background-fade', 'is-footer-background-fade-scrubbing')
  root.style.removeProperty('--footer-fade-progress')
  root.style.removeProperty('--footer-fade-start-bg')
  root.style.removeProperty('--footer-fade-start-color')
  root.style.removeProperty('--footer-fade-end-bg')
  root.style.removeProperty('--footer-fade-end-color')
}

export function enablePageColorTransitions() {
  if (!import.meta.client) return

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('page-colors-transition-ready')
    })
  })
}

export function resumePageColorTransitions() {
  if (!import.meta.client) return
  enablePageColorTransitions()
}

export function initPageColorTransitions() {
  if (!import.meta.client) return

  const { applied } = useAppliedPageColors()

  if (applied.value) {
    enablePageColorTransitions()
    return
  }

  const stop = watch(applied, (colors) => {
    if (!colors) return
    enablePageColorTransitions()
    stop()
  })
}

// Kept for any legacy reads; wipe overlay uses fixed aintree.
export function usePageTransitionBackground(page) {
  const pageTransitionBackground = useState(
    'crows_pageTransitionBackground',
    () => pageBackgroundVar(),
  )

  watchEffect(() => {
    pageTransitionBackground.value = pageBackgroundVar(unref(page)?.pageColor)
  })
}
