import {
  extractPageChromeColors,
  extractSiteChromeColors,
  getPageColorBodyAttrs,
  getPageColorHtmlAttrs,
  mergePageChromeColors,
  pageBackgroundVar,
  resolvePageBackgroundHex,
  toCssColor,
  isLightColor,
  DEFAULT_UNSET_PAGE_BACKGROUND,
} from '~/utils/pageColors'
import { getCachedPageForRoute } from '~/utils/videoSectionFlags'
import { isShopRoute, resolveShopChromeColors, mergeShopChromeColors } from '~/utils/shopColors'

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
    syncBrowserChromeColors(applied.value)
  }
}

function getSiteMenuColors(nuxtApp) {
  const settings = nuxtApp?.payload?.data?.siteSettings
    ?? nuxtApp?.static?.data?.siteSettings
    ?? null

  return extractSiteChromeColors(settings || {})
}

function getKnownPageColorsForPath(nuxtApp, path) {
  if (!path) return null

  const siteMenu = getSiteMenuColors(nuxtApp)

  if (path === '/articles' || path === '/articles/') {
    return mergePageChromeColors({}, siteMenu)
  }

  if (path.startsWith('/articles/')) {
    return mergePageChromeColors({ pageColor: 'crayon' }, siteMenu)
  }

  if (isShopRoute(path)) {
    const shopColors = useState('shopChromeColors').value
    if (shopColors) return shopColors

    const shopPage = getCachedPageForRoute(nuxtApp, '/shop')
      ?? nuxtApp?.payload?.data?.['page-shop-color']
      ?? nuxtApp?.static?.data?.['page-shop-color']
      ?? null

    const siteSettings = nuxtApp?.payload?.data?.siteSettings
      ?? nuxtApp?.static?.data?.siteSettings
      ?? null

    return mergeShopChromeColors(
      resolveShopChromeColors(shopPage, siteSettings?.shopColors),
      siteMenu,
    )
  }

  const page = getCachedPageForRoute(nuxtApp, path)
  if (!page) return null

  return mergePageChromeColors(page, siteMenu)
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
      colors = mergePageChromeColors(pageColors, getSiteMenuColors(nuxtApp))
    } catch {
      colors = mergePageChromeColors({}, getSiteMenuColors(nuxtApp))
    }
  }

  pending.value = colors
  applied.value = colors
  syncBrowserChromeColors(colors)
}

export function usePageColor(page) {
  const isTransitioning = useState('pageTransitioning', () => false)
  const { pending, applied, swapped } = useAppliedPageColors()
  const { menuColors } = useSiteSettings()

  watchEffect(() => {
    const pageValue = unref(page)
    const colors = mergePageChromeColors(pageValue, menuColors.value)

    pending.value = colors

    const shouldApplyNow = import.meta.server
      || !isTransitioning.value
      || swapped.value

    if (shouldApplyNow) {
      applied.value = colors
      syncBrowserChromeColors(colors)
    }
  })
}

export function syncBrowserChromeColors(colors = {}) {
  if (!import.meta.client) return

  const background = toCssColor(
    colors.pageColor || DEFAULT_UNSET_PAGE_BACKGROUND,
    DEFAULT_UNSET_PAGE_BACKGROUND,
  )
  const hex = resolvePageBackgroundHex(colors)
  const light = isLightColor(colors.pageColor || background)
  const colorScheme = light ? 'light' : 'dark'

  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) {
    themeMeta.setAttribute('content', hex)
  }

  const schemeMeta = document.querySelector('meta[name="color-scheme"]')
  if (schemeMeta) {
    schemeMeta.setAttribute('content', colorScheme)
  }

  document.documentElement.style.backgroundColor = background
  document.documentElement.style.colorScheme = colorScheme
}

export function usePageColorHead() {
  const { applied } = useAppliedPageColors()

  useHead(() => {
    const colors = applied.value || {}
    const light = isLightColor(colors.pageColor || DEFAULT_UNSET_PAGE_BACKGROUND)

    return {
      htmlAttrs: getPageColorHtmlAttrs(colors),
      bodyAttrs: getPageColorBodyAttrs(colors),
      meta: [
        {
          key: 'theme-color',
          name: 'theme-color',
          content: resolvePageBackgroundHex(colors),
        },
        {
          key: 'color-scheme',
          name: 'color-scheme',
          content: light ? 'light' : 'dark',
        },
      ],
    }
  })

  if (import.meta.client) {
    watch(
      applied,
      (colors) => {
        if (!colors) return
        syncBrowserChromeColors(colors)
      },
      { immediate: true, deep: true },
    )
  }
}

export function suspendPageColorTransitions() {
  if (!import.meta.client) return
  document.documentElement.classList.remove('page-colors-transition-ready')
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
