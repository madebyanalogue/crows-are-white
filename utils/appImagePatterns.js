export const APP_IMAGE_PATTERN_NAMES = [
  'pattern-1',
  'pattern-2',
  'pattern-3',
  'pattern-4',
  'apr',
  'pattern-6',
]

export const INLINE_APP_IMAGE_PATTERN_NAMES = ['apr']

export const OVERLAY_APP_IMAGE_PATTERN_NAMES = ['apr', 'pattern-6']

export const APP_IMAGE_PATTERN_WIDTHS = {
  apr: '30%',
  'pattern-6': '20%',
}

export const APP_IMAGE_PATTERN_ASPECT_RATIOS = {
  apr: '68.26 / 35.45',
  'pattern-6': '163 / 128',
}

export const APP_IMAGE_PATTERN_POSITIONS = {
  'pattern-6': 'bottom-right',
}

export function isAppImagePattern(overlay) {
  return APP_IMAGE_PATTERN_NAMES.includes(overlay)
}

export function isInlineAppImagePattern(overlay) {
  return INLINE_APP_IMAGE_PATTERN_NAMES.includes(overlay)
}

export function isOverlayAppImagePattern(overlay) {
  return OVERLAY_APP_IMAGE_PATTERN_NAMES.includes(overlay)
}

export function getAppImagePatternSrc(overlay) {
  const match = overlay.match(/^pattern-(\d+)$/)
  if (match) {
    return `/images/pattern-${match[1].padStart(2, '0')}.svg`
  }

  const imagePatternNames = APP_IMAGE_PATTERN_NAMES.filter((name) => !isInlineAppImagePattern(name))
  const index = imagePatternNames.indexOf(overlay)
  const num = String((index === -1 ? 0 : index) + 1).padStart(2, '0')
  return `/images/pattern-${num}.svg`
}

export function getAppImagePatternPosition(overlay) {
  return APP_IMAGE_PATTERN_POSITIONS[overlay] ?? 'bottom-left'
}

export function getAppImagePatternTransformOrigin(overlay) {
  return getAppImagePatternPosition(overlay) === 'bottom-right' ? 'bottom right' : 'bottom left'
}

export function getAppImagePatternWidth(overlay) {
  return APP_IMAGE_PATTERN_WIDTHS[overlay] ?? null
}

export function getAppImagePatternAspectRatio(overlay) {
  return APP_IMAGE_PATTERN_ASPECT_RATIOS[overlay] ?? '1 / 2'
}
