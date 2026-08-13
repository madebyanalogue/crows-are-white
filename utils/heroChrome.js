import {
  DEFAULT_MENU_BORDER_COLOR,
  DEFAULT_MENU_HIGHLIGHT_COLOR,
  getMenuBorderVars,
  getPageColorVars,
  getWideGamutStyleVars,
  normalizeColorValue,
  parseWideGamutColorInput,
  toCssColor,
} from '~/utils/pageColors'

export function resolveHeroMenuBorderColor(section = {}) {
  const mode = section.heroMenuBorderColorMode
  const customColor = normalizeColorValue(section.heroMenuBorderColor)

  if (mode === 'transparent') return 'transparent'
  if (mode === 'custom' && customColor) return customColor
  if (mode === 'default') return undefined

  // Legacy sections that stored a colour before the mode field existed.
  if (customColor) return customColor

  return undefined
}

export function extractHeroChromeColors(section = {}) {
  return {
    heroFeatureColor: normalizeColorValue(section.heroFeatureColor),
    heroMenuFrosted: section.heroMenuFrosted !== false,
    heroMenuBackgroundColor: normalizeColorValue(section.heroMenuBackgroundColor),
    heroMenuTextColor: normalizeColorValue(section.heroMenuTextColor),
    heroMenuBorderColorMode: section.heroMenuBorderColorMode || 'default',
    heroMenuBorderColor: resolveHeroMenuBorderColor(section),
  }
}

export function getHeroFeatureColorVar(section = {}) {
  const parsed = parseWideGamutColorInput(section?.heroFeatureColor)
  return parsed?.srgb || toCssColor(undefined, DEFAULT_MENU_HIGHLIGHT_COLOR)
}

export function getHeroFeatureColorStyleVars(section = {}) {
  return getWideGamutStyleVars(
    section?.heroFeatureColor,
    DEFAULT_MENU_HIGHLIGHT_COLOR,
    '--hero-feature-color',
  )
}

function applyHeroMenuBorderColor(result, heroMenuBorderColor) {
  if (heroMenuBorderColor === 'transparent') {
    Object.assign(result, getMenuBorderVars({
      menuBorderColor: 'transparent',
      menuBorderDisabled: true,
    }))
    return
  }

  if (heroMenuBorderColor) {
    result['--menu-border-color'] = toCssColor(
      heroMenuBorderColor,
      DEFAULT_MENU_BORDER_COLOR,
    )
  }
}

export function getHeroMenuChromeVars(section = {}) {
  const {
    heroMenuFrosted,
    heroMenuBackgroundColor,
    heroMenuTextColor,
    heroMenuBorderColor,
  } = extractHeroChromeColors(section)

  const parsedFeatureColor = parseWideGamutColorInput(section?.heroFeatureColor)
  const featureColor = parsedFeatureColor?.srgb || toCssColor(undefined, DEFAULT_MENU_HIGHLIGHT_COLOR)
  const result = {
    '--hero-menu-feature-color': featureColor,
  }

  if (heroMenuFrosted) {
    if (heroMenuTextColor) {
      const vars = getPageColorVars({ menuTextColor: heroMenuTextColor })
      result['--menu-text-color'] = vars['--menu-text-color']
      result['--basket-icon-color'] = vars['--basket-icon-color']
    } else {
      result['--menu-text-color'] = 'var(--fuji, #fff)'
      result['--basket-icon-color'] = 'var(--fuji, #fff)'
    }

    applyHeroMenuBorderColor(result, heroMenuBorderColor)

    return result
  }

  if (!heroMenuBackgroundColor && !heroMenuTextColor && !heroMenuBorderColor) {
    return null
  }

  const colors = {
    menuBackgroundColor: heroMenuBackgroundColor,
    menuTextColor: heroMenuTextColor,
    menuBorderColor: heroMenuBorderColor === 'transparent'
      ? 'transparent'
      : heroMenuBorderColor,
  }

  const vars = getPageColorVars(colors)
  const solidResult = {
    '--hero-menu-feature-color': featureColor,
  }

  if (heroMenuBackgroundColor) {
    solidResult['--menu-background-color'] = vars['--menu-background-color']
  }
  if (heroMenuTextColor) {
    solidResult['--menu-text-color'] = vars['--menu-text-color']
    solidResult['--basket-icon-color'] = vars['--basket-icon-color']
  }

  applyHeroMenuBorderColor(solidResult, heroMenuBorderColor)

  return solidResult
}

export const HERO_MENU_CSS_VARS = [
  '--hero-menu-feature-color',
  '--menu-background-color',
  '--menu-border-color',
  '--menu-border-width',
  '--menu-border-inset',
  '--menu-border-inner-display',
  '--menu-text-color',
  '--basket-icon-color',
]

export function heroSectionHasMenuChrome() {
  return false
}
