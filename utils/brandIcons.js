export const ABSTRACT_BRAND_DECORS = ['arc', 'wave', 'peak']

const brandIconModules = import.meta.glob('~/assets/brands/brand-*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parseBrandIconSvg(raw) {
  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/i)
  const viewBox = viewBoxMatch?.[1] ?? '0 0 48 48'
  const innerMatch = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  let inner = innerMatch?.[1]?.trim() ?? ''

  inner = inner.replace(
    /<(path|polygon|rect|circle|ellipse|line|polyline)([^>]*?)(\s*\/?)>/gi,
    (match, tag, attrs, closing) => {
      let nextAttrs = attrs

      if (/fill="/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/fill="[^"]*"/gi, 'fill="currentColor"')
      } else {
        nextAttrs += ' fill="currentColor"'
      }

      if (/stroke="/i.test(nextAttrs) && !/stroke="none"/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/stroke="[^"]*"/gi, 'stroke="currentColor"')
      }

      return `<${tag}${nextAttrs}${closing}>`
    },
  )

  return { viewBox, inner }
}

export const BRAND_ICONS = Object.fromEntries(
  Object.entries(brandIconModules)
    .map(([path, raw]) => {
      const name = path.match(/brand-(.+)\.svg$/)?.[1]
      return name ? [name, parseBrandIconSvg(raw)] : null
    })
    .filter(Boolean),
)

export const BRAND_ICON_NAMES = Object.keys(BRAND_ICONS)

export function isAbstractBrandDecor(name) {
  return ABSTRACT_BRAND_DECORS.includes(name)
}

export function getBrandIcon(name) {
  if (!name || isAbstractBrandDecor(name)) return null
  return BRAND_ICONS[name] ?? null
}

export function isValidBrandDecor(name) {
  if (!name) return false
  return isAbstractBrandDecor(name) || Boolean(getBrandIcon(name))
}
