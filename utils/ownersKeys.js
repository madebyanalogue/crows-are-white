import { OWNERS_KEY_SET_CONFIGS } from '~/composables/useOwnersCarousel'
import { toCssColor } from '~/utils/pageColors'

const DEFAULT_KEY_COLORS = ['#F0F0ED', '#f7f7f7', '#061c11', '#ff9944', '#7cfc83']

/** Base sizes before global scale — ring:key ratio tuned here */
const OWNERS_RING_SIZE_BASE = 105
const OWNERS_KEY_WIDTH_BASE = 72

/** Whole object scale (ring + keys together) */
export const OWNERS_OBJECT_SCALE = 2.5

/** Wire centre radius as a fraction of ring image width (tuned to PNG) */
const OWNERS_RING_WIRE_RADIUS_RATIO = 0.43
/** Pull hole onto wire centre (px at base scale, scaled globally) */
const OWNERS_KEY_RING_OVERLAP_BASE = 0

/** Keep in sync with Owners.vue / OwnersKeySet CSS */
export const OWNERS_RING_SIZE = OWNERS_RING_SIZE_BASE * OWNERS_OBJECT_SCALE
export const OWNERS_RING_RADIUS = OWNERS_RING_SIZE * OWNERS_RING_WIRE_RADIUS_RATIO
export const OWNERS_KEY_WIDTH = OWNERS_KEY_WIDTH_BASE * OWNERS_OBJECT_SCALE
export const OWNERS_KEY_RING_OVERLAP = OWNERS_KEY_RING_OVERLAP_BASE * OWNERS_OBJECT_SCALE
export const OWNERS_KEY_HOLE_RADIUS = OWNERS_RING_SIZE * 0.042

export const OWNERS_KEYRING_IMAGE = '/images/owners-keyring-transparent.png'

/** Local placeholder keys until uploaded in Sanity — setIndex + keyIndex */
export const OWNERS_PLACEHOLDER_KEYS = [
  {
    setIndex: 0,
    keyIndex: 1,
    src: '/images/owners-key-01.png',
    width: 342,
    height: 1024,
  },
]

export function ownersKeyColorCss(color) {
  return toCssColor(color, '#F0F0ED')
}

export function ownersKeyImageSrc(key) {
  return key?.image?.asset?._id || ''
}

export function ownersKeyImageWidth(key) {
  return key?.image?.asset?.metadata?.dimensions?.width
}

export function ownersKeyImageHeight(key) {
  return key?.image?.asset?.metadata?.dimensions?.height
}

export function ownersKeyLocalSrc(setIndex, keyIndex) {
  if (keyIndex === undefined) return ''
  const match = OWNERS_PLACEHOLDER_KEYS.find(
    (placeholder) => placeholder.setIndex === setIndex && placeholder.keyIndex === keyIndex,
  )
  return match?.src ?? ''
}

export function ownersKeyLocalDimensions(setIndex, keyIndex) {
  const match = OWNERS_PLACEHOLDER_KEYS.find(
    (placeholder) => placeholder.setIndex === setIndex && placeholder.keyIndex === keyIndex,
  )
  return {
    width: match?.width,
    height: match?.height,
  }
}

export function ownersKeyAttachPosition(angleDeg, keyWidth = OWNERS_KEY_WIDTH, scale = 1) {
  const rad = (angleDeg * Math.PI) / 180
  const renderedWidth = keyWidth * scale
  const centerX = OWNERS_RING_SIZE / 2
  const centerY = OWNERS_RING_SIZE * 0.48
  const attachX = centerX + (Math.sin(rad) * OWNERS_RING_RADIUS)
  const attachY = centerY + (Math.cos(rad) * OWNERS_RING_RADIUS)
  const holeOffsetY = renderedWidth * 0.5

  return {
    left: attachX,
    top: attachY - holeOffsetY + OWNERS_KEY_RING_OVERLAP,
    x: attachX - centerX,
  }
}

export function resolveOwnersKeys(item, setIndex) {
  const layoutConfigs = OWNERS_KEY_SET_CONFIGS[setIndex % OWNERS_KEY_SET_CONFIGS.length]
  const cmsKeys = Array.isArray(item?.keys) ? item.keys : []
  const count = Math.max(cmsKeys.length, layoutConfigs.length)

  return Array.from({ length: count }, (_, index) => {
    const layout = layoutConfigs[index % layoutConfigs.length]
    const cmsKey = cmsKeys[index]
    const attach = ownersKeyAttachPosition(layout.angle, OWNERS_KEY_WIDTH, layout.scale)

    return {
      _key: cmsKey?._key ?? `owners-key-${setIndex}-${index}`,
      color: cmsKey?.color || DEFAULT_KEY_COLORS[index % DEFAULT_KEY_COLORS.length],
      image: cmsKey?.image ?? null,
      angle: layout.angle,
      left: attach.left,
      top: attach.top,
      x: attach.x,
      restAngle: layout.restAngle,
      scale: layout.scale,
      zIndex: 2 + index,
    }
  })
}
