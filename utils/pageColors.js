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
export const DEFAULT_MENU_BACKGROUND_COLOR = 'crema'
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
    color.startsWith('#')
    || color.startsWith('rgb')
    || color.startsWith('hsl')
    || color.startsWith('color(')
  )
}

/** Normalise Sanity colour objects, hex strings, or legacy brand tokens. */
export function normalizeColorValue(value) {
  if (!value) return undefined
  if (typeof value === 'object' && typeof value.hex === 'string') {
    return value.hex
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
    menuTextColor: normalizeColorValue(source?.menuTextColor),
    menuHighlightColor: normalizeColorValue(source?.menuHighlightColor),
    basketIconColor: normalizeColorValue(source?.basketIconColor),
  }
}

export function getPageColorVars(colors = {}) {
  const {
    pageColor,
    pageTextColor,
    menuBackgroundColor,
    menuTextColor,
    menuHighlightColor,
    basketIconColor,
  } = colors

  const background = toCssColor(pageColor, DEFAULT_PAGE_COLOR)
  const text = toCssColor(resolvePageTextColor(pageTextColor, pageColor), 'obsidian')
  const menuBackground = toCssColor(menuBackgroundColor, DEFAULT_MENU_BACKGROUND_COLOR)
  const menuText = toCssColor(
    resolvePageTextColor(menuTextColor, menuBackgroundColor || DEFAULT_MENU_BACKGROUND_COLOR),
    'obsidian',
  )
  const menuHighlight = toCssColor(menuHighlightColor, DEFAULT_MENU_HIGHLIGHT_COLOR)
  const basketIcon = basketIconColor
    ? toCssColor(basketIconColor, 'obsidian')
    : menuText

  return {
    '--background-color': background,
    '--text-color': text,
    '--menu-background-color': menuBackground,
    '--menu-text-color': menuText,
    '--menu-highlight-color': menuHighlight,
    '--basket-icon-color': basketIcon,
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
