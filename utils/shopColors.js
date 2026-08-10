import { extractPageChromeColors, mergePageChromeColors } from '~/utils/pageColors'

export const SHOP_COLORS_FALLBACK = {
  pageColor: '#ffffff',
  pageTextColor: '#111010',
}

export function resolveShopChromeColors(shopPageSource, siteSettingsShopColors) {
  const fromPage = extractPageChromeColors(shopPageSource || {})
  const fromSettings = extractPageChromeColors(siteSettingsShopColors || {})
  const fallback = extractPageChromeColors(SHOP_COLORS_FALLBACK)

  return {
    pageColor: fromSettings.pageColor ?? fromPage.pageColor ?? fallback.pageColor,
    pageTextColor: fromSettings.pageTextColor ?? fromPage.pageTextColor ?? fallback.pageTextColor,
    featureColor: fromPage.featureColor ?? fromPage.menuHighlightColor,
  }
}

export function mergeShopChromeColors(shopChrome, siteMenuSource) {
  return mergePageChromeColors(shopChrome, siteMenuSource)
}

export function isShopRoute(path = '') {
  return path === '/shop' || path === '/shop/' || path.startsWith('/shop/')
}
