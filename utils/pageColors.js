export const PAGE_COLOR_OPTIONS = [
  { value: 'fuji', label: 'White' },
  { value: 'crayon', label: 'Crayon' },
  { value: 'crema', label: 'Crema' },
  { value: 'obsidian', label: 'Obsidian' },
  { value: 'racing-green', label: 'Racing Green' },
  { value: 'aintree', label: 'Aintree' },
  { value: 'arancio', label: 'Arancio' },
  { value: 'verdea', label: 'Verdea' },
]

export const PAGE_TEXT_COLOR_OPTIONS = [
  { value: 'obsidian', label: 'Obsidian' },
  { value: 'racing-green', label: 'Racing Green' },
  { value: 'aintree', label: 'Aintree Green' },
  { value: 'fuji', label: 'Fuji' },
]

export const DEFAULT_PAGE_COLOR = 'fuji'
export const DEFAULT_UNSET_PAGE_BACKGROUND = 'crema'
export const DEFAULT_MENU_BACKGROUND_COLOR = 'crema'
export const DEFAULT_MENU_BORDER_COLOR = '#999'
export const DEFAULT_MENU_HIGHLIGHT_COLOR = 'arancio'
export const DEFAULT_PAGE_TRANSITION_WIPE_COLOR = 'aintree'

const PAGE_COLOR_VALUES = new Set(PAGE_COLOR_OPTIONS.map((option) => option.value))
const PAGE_TEXT_COLOR_VALUES = new Set(PAGE_TEXT_COLOR_OPTIONS.map((option) => option.value))
const DARK_PAGE_COLORS = new Set(['obsidian', 'racing-green', 'aintree'])

const BRAND_HEX = {
  fuji: '#ffffff',
  crayon: '#f7f7f7',
  crema: '#F0F0ED',
  obsidian: '#000e0a',
  'racing-green': '#0e3e27',
  aintree: '#061c11',
  arancio: '#ff9944',
  verdea: '#7cfc83',
}

function isRawCssColor(color) {
  return typeof color === 'string' && (
    color === 'transparent'
    || color.startsWith('#')
    || color.startsWith('rgb')
    || color.startsWith('hsl')
    || color.startsWith('color(')
  )
}

function parseHexChannels(hex) {
  const normalized = hex.replace('#', '')
  if (normalized.length === 3) {
    return {
      r: Number.parseInt(normalized[0] + normalized[0], 16),
      g: Number.parseInt(normalized[1] + normalized[1], 16),
      b: Number.parseInt(normalized[2] + normalized[2], 16),
    }
  }
  if (normalized.length === 6) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    }
  }
  return null
}

function resolveColorAlpha(value) {
  if (typeof value?.alpha === 'number') return value.alpha
  if (typeof value?.rgb?.a === 'number') return value.rgb.a
  return 1
}

function hexAlphaToCssColor(hex, alpha = 1) {
  const safeAlpha = Math.min(1, Math.max(0, Number(alpha)))
  if (safeAlpha >= 1) return hex

  const channels = parseHexChannels(hex)
  if (!channels) return hex

  return `rgba(${channels.r}, ${channels.g}, ${channels.b}, ${safeAlpha})`
}

/** Normalise Sanity colour objects, hex strings, or legacy brand tokens. */
export function normalizeColorValue(value) {
  if (!value) return undefined
  if (typeof value === 'object' && typeof value.hex === 'string') {
    return hexAlphaToCssColor(value.hex, resolveColorAlpha(value))
  }
  if (typeof value === 'string') {
    return value
  }
  return undefined
}

function isDarkHex(hex) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return false
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

export function isLightColor(color) {
  const normalized = normalizeColorValue(color)
  if (!normalized) return false
  if (isRawCssColor(normalized)) {
    if (normalized.startsWith('#')) return !isDarkHex(normalized)
    return false
  }
  return normalized === 'fuji' || !DARK_PAGE_COLORS.has(normalized)
}

export function toCssColor(color, fallbackToken = DEFAULT_PAGE_COLOR) {
  const normalized = normalizeColorValue(color)
  if (isRawCssColor(normalized)) return normalized
  if (PAGE_COLOR_VALUES.has(normalized) || PAGE_TEXT_COLOR_VALUES.has(normalized)) {
    return `var(--${normalized})`
  }
  const fallback = normalizeColorValue(fallbackToken) || fallbackToken
  if (isRawCssColor(fallback)) return fallback
  if (PAGE_COLOR_VALUES.has(fallback) || PAGE_TEXT_COLOR_VALUES.has(fallback)) {
    return `var(--${fallback})`
  }
  return BRAND_HEX[fallback] || BRAND_HEX[DEFAULT_PAGE_COLOR]
}

export function resolvePageColor(color, fallback = DEFAULT_PAGE_COLOR) {
  const normalized = normalizeColorValue(color)
  if (isRawCssColor(normalized)) return normalized
  return PAGE_COLOR_VALUES.has(normalized) ? normalized : fallback
}

export function pageBackgroundVar(color, fallback = DEFAULT_PAGE_COLOR) {
  return toCssColor(color, fallback)
}

export function resolvePageColorCssValue(color) {
  if (typeof document === 'undefined') return null
  const normalized = normalizeColorValue(color)
  if (isRawCssColor(normalized)) return normalized
  const key = resolvePageColor(normalized)
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${key}`).trim()
  return value || BRAND_HEX[key] || null
}

function resolveAutoTextColor(backgroundColor) {
  const normalized = normalizeColorValue(backgroundColor)
  if (isRawCssColor(normalized)) {
    if (normalized.startsWith('#')) {
      return isDarkHex(normalized) ? BRAND_HEX.fuji : BRAND_HEX.obsidian
    }
    return BRAND_HEX.fuji
  }
  const key = resolvePageColor(normalized)
  return DARK_PAGE_COLORS.has(key) ? 'fuji' : 'obsidian'
}

export function resolvePageTextColor(textColor, backgroundColor) {
  const normalizedText = normalizeColorValue(textColor)
  if (isRawCssColor(normalizedText)) return normalizedText
  if (normalizedText && PAGE_TEXT_COLOR_VALUES.has(normalizedText)) {
    return normalizedText
  }
  return resolveAutoTextColor(backgroundColor)
}

export function extractPageChromeColors(source = {}) {
  return {
    pageColor: normalizeColorValue(source?.pageColor),
    pageTextColor: normalizeColorValue(source?.pageTextColor),
    menuBackgroundColor: normalizeColorValue(source?.menuBackgroundColor),
    menuBorderColor: normalizeColorValue(source?.menuBorderColor),
    menuTextColor: normalizeColorValue(source?.menuTextColor),
    menuHighlightColor: normalizeColorValue(source?.menuHighlightColor),
    featureColor: normalizeColorValue(source?.featureColor),
    basketIconColor: normalizeColorValue(source?.basketIconColor),
  }
}

export function extractSiteCartColors(settings = {}) {
  const cartColors = settings?.cartColors || {}

  return {
    cartBackgroundColor: normalizeColorValue(cartColors.cartBackgroundColor),
    cartTextColor: normalizeColorValue(cartColors.cartTextColor),
    cartFeatureColor: normalizeColorValue(cartColors.cartFeatureColor),
    cartBasketIconColor: normalizeColorValue(cartColors.cartBasketIconColor),
  }
}

export function extractSiteChromeColors(settings = {}) {
  return {
    ...extractSiteMenuColors(settings),
    ...extractSiteCartColors(settings),
  }
}

export function extractSiteMenuColors(settings = {}) {
  const menuColors = settings?.menuColors || {}

  return {
    ...extractPageChromeColors(menuColors),
    menuBorderDisabled: menuColors.menuBorderDisabled === true
      || menuColors.menuBorderEnabled === false,
    menuBorderInset: menuColors.menuBorderInset,
  }
}

export function getMenuBorderVars({
  menuBorderColor,
  menuBorderDisabled,
  menuBorderInset,
} = {}) {
  const menuBorder = menuBorderColor
    ? toCssColor(menuBorderColor, DEFAULT_MENU_BORDER_COLOR)
    : DEFAULT_MENU_BORDER_COLOR
  const showMenuBorder = menuBorderDisabled !== true
  const inset = Number.isFinite(Number(menuBorderInset)) ? Number(menuBorderInset) : 6

  if (!showMenuBorder) {
    return {
      '--menu-border-color': menuBorder,
      '--menu-border-width': '0px',
      '--menu-border-inset': '0px',
      '--menu-border-inner-display': 'none',
    }
  }

  return {
    '--menu-border-color': menuBorder,
    '--menu-border-width': '1px',
    '--menu-border-inset': `${Math.max(0, inset)}px`,
    '--menu-border-inner-display': 'block',
  }
}

export function mergePageChromeColors(pageSource = {}, siteMenuSource = {}) {
  const page = extractPageChromeColors(pageSource)
  const siteMenu = extractPageChromeColors(siteMenuSource)
  const pageFeatureColor = page.featureColor || page.menuHighlightColor

  return {
    pageColor: page.pageColor,
    pageTextColor: page.pageTextColor,
    menuBackgroundColor: siteMenu.menuBackgroundColor,
    menuBorderColor: siteMenu.menuBorderColor,
    menuBorderDisabled: siteMenuSource.menuBorderDisabled === true
      || siteMenuSource.menuBorderEnabled === false,
    menuBorderInset: siteMenuSource.menuBorderInset,
    menuTextColor: siteMenu.menuTextColor,
    menuHighlightColor: pageFeatureColor || siteMenu.menuHighlightColor,
    basketIconColor: siteMenu.basketIconColor,
    cartBackgroundColor: siteMenuSource.cartBackgroundColor,
    cartTextColor: siteMenuSource.cartTextColor,
    cartFeatureColor: pageFeatureColor || siteMenuSource.cartFeatureColor,
    cartBasketIconColor: siteMenuSource.cartBasketIconColor,
  }
}

export function getPageColorVars(colors = {}) {
  const {
    pageColor,
    pageTextColor,
    menuBackgroundColor,
    menuBorderColor,
    menuBorderDisabled,
    menuBorderInset,
    menuTextColor,
    menuHighlightColor,
    basketIconColor,
    cartBackgroundColor,
    cartTextColor,
    cartFeatureColor,
    cartBasketIconColor,
  } = colors

  const background = toCssColor(
    pageColor || DEFAULT_UNSET_PAGE_BACKGROUND,
    DEFAULT_UNSET_PAGE_BACKGROUND,
  )
  const text = toCssColor(
    resolvePageTextColor(pageTextColor, pageColor || DEFAULT_UNSET_PAGE_BACKGROUND),
    'obsidian',
  )
  const menuBackground = toCssColor(menuBackgroundColor, DEFAULT_MENU_BACKGROUND_COLOR)
  const menuBorderVars = getMenuBorderVars({
    menuBorderColor,
    menuBorderDisabled,
    menuBorderInset,
  })
  const menuText = toCssColor(
    resolvePageTextColor(menuTextColor, menuBackgroundColor || DEFAULT_MENU_BACKGROUND_COLOR),
    'obsidian',
  )
  const menuHighlight = toCssColor(menuHighlightColor, DEFAULT_MENU_HIGHLIGHT_COLOR)
  const basketIcon = basketIconColor
    ? toCssColor(basketIconColor, 'obsidian')
    : menuText
  const cartBackground = cartBackgroundColor
    ? toCssColor(cartBackgroundColor, DEFAULT_MENU_BACKGROUND_COLOR)
    : menuBackground
  const cartText = cartTextColor
    ? toCssColor(
      resolvePageTextColor(cartTextColor, cartBackgroundColor || menuBackgroundColor),
      'obsidian',
    )
    : menuText
  const cartFeature = cartFeatureColor
    ? toCssColor(cartFeatureColor, DEFAULT_MENU_HIGHLIGHT_COLOR)
    : menuHighlight
  const cartBasketIcon = cartBasketIconColor
    ? toCssColor(cartBasketIconColor, 'obsidian')
    : basketIcon

  return {
    '--background-color': background,
    '--text-color': text,
    '--menu-background-color': menuBackground,
    ...menuBorderVars,
    '--menu-text-color': menuText,
    '--menu-highlight-color': menuHighlight,
    '--feature-color': menuHighlight,
    '--basket-icon-color': basketIcon,
    '--cart-background-color': cartBackground,
    '--cart-text-color': cartText,
    '--cart-feature-color': cartFeature,
    '--cart-basket-icon-color': cartBasketIcon,
  }
}

export function pageColorStyle(colorsOrBackground, maybeTextColor) {
  const colors = typeof colorsOrBackground === 'object' && colorsOrBackground !== null
    ? colorsOrBackground
    : { pageColor: colorsOrBackground, pageTextColor: maybeTextColor }

  return Object.entries(getPageColorVars(colors))
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ')
}

export function getPageColorHtmlAttrs(colorsOrBackground, maybeTextColor) {
  const colors = typeof colorsOrBackground === 'object' && colorsOrBackground !== null
    ? colorsOrBackground
    : { pageColor: colorsOrBackground, pageTextColor: maybeTextColor }

  const vars = getPageColorVars(colors)

  return {
    style: Object.entries(vars)
      .map(([name, value]) => `${name}: ${value}`)
      .join('; '),
    'data-background-color': vars['--background-color'],
    'data-text-color': vars['--text-color'],
  }
}
