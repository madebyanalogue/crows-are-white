import { extractPageChromeColors } from '~/utils/pageColors'

export const SHOP_COLORS_FALLBACK = {
  pageColor: '#ffffff',
  pageTextColor: '#111010',
}

const SHOP_PAGE_COLOR_KEYS = ['pageColor', 'pageTextColor']

export function resolveShopChromeColors(shopPageSource, siteSettingsShopColors) {
  const fromPage = extractPageChromeColors(shopPageSource || {})
  const fromSettings = extractPageChromeColors(siteSettingsShopColors || {})
  const fallback = extractPageChromeColors(SHOP_COLORS_FALLBACK)

  return SHOP_PAGE_COLOR_KEYS.reduce((colors, key) => {
    colors[key] = fromSettings[key] ?? fromPage[key] ?? fallback[key]
    return colors
  }, {})
}

export function isShopRoute(path = '') {
  return path === '/shop' || path === '/shop/' || path.startsWith('/shop/')
}
