import { extractPageChromeColors } from '~/utils/pageColors'

export const SHOP_COLORS_FALLBACK = {
  pageColor: '#ffffff',
  pageTextColor: '#111010',
  menuBackgroundColor: '#ffffff',
  menuTextColor: '#111010',
  menuHighlightColor: '#111010',
  basketIconColor: '#111010',
}

const SHOP_COLOR_KEYS = [
  'pageColor',
  'pageTextColor',
  'menuBackgroundColor',
  'menuBorderColor',
  'menuTextColor',
  'menuHighlightColor',
  'basketIconColor',
]

export function resolveShopChromeColors(shopPageSource, siteSettingsShopColors) {
  const fromPage = extractPageChromeColors(shopPageSource || {})
  const fromSettings = extractPageChromeColors(siteSettingsShopColors || {})
  const fallback = extractPageChromeColors(SHOP_COLORS_FALLBACK)

  return SHOP_COLOR_KEYS.reduce((colors, key) => {
    colors[key] = fromSettings[key] ?? fromPage[key] ?? fallback[key]
    return colors
  }, {})
}

export function isShopRoute(path = '') {
  return path === '/shop' || path === '/shop/' || path.startsWith('/shop/')
}
