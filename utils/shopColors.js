import { extractPageChromeColors, mergePageChromeColors } from '~/utils/pageColors'

export const SHOP_COLORS_FALLBACK = {
  pageColor: '#ffffff',
  pageTextColor: '#111010',
  menuBackgroundColor: 'fuji',
}

export function resolveShopChromeColors(shopPageSource, siteSettingsShopColors) {
  const fromPage = extractPageChromeColors(shopPageSource || {})
  const fromSettings = extractPageChromeColors(siteSettingsShopColors || {})
  const fallback = extractPageChromeColors(SHOP_COLORS_FALLBACK)

  return {
    pageColor: fromSettings.pageColor ?? fromPage.pageColor ?? fallback.pageColor,
    pageTextColor: fromSettings.pageTextColor ?? fromPage.pageTextColor ?? fallback.pageTextColor,
    menuBackgroundColor: fromPage.menuBackgroundColor ?? fallback.menuBackgroundColor,
  }
}

export function mergeShopChromeColors(shopChrome, siteMenuSource) {
  const merged = mergePageChromeColors(shopChrome, siteMenuSource)

  return {
    ...merged,
    menuBackgroundColor: shopChrome.menuBackgroundColor ?? merged.menuBackgroundColor,
  }
}

export function isShopRoute(path = '') {
  return path === '/shop' || path === '/shop/' || path.startsWith('/shop/')
}
