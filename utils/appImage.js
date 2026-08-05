export const APP_IMAGE_SIZES = {
  // Bare vw values (e.g. "100vw") are parsed as a 1px breakpoint by @nuxt/image — always prefix with a screen key.
  half: 'sm:100vw lg:50vw',
  third: 'sm:100vw lg:33vw',
  full: 'sm:100vw',
  gallery: 'sm:100vw lg:1000px',
  article: 'sm:100vw lg:1200px',
  featured: 'sm:100vw lg:1400px',
  cta: 'sm:100vw lg:600px',
}

export const APP_IMAGE_OVERLAYS = {
  WIPE: 'wipe',
  PATTERN_1: 'pattern-1',
  PATTERN_2: 'pattern-2',
  PATTERN_3: 'pattern-3',
  PATTERN_4: 'pattern-4',
  APR: 'apr',
  PATTERN_6: 'pattern-6',
}

export const APP_IMAGE_ANIMATION_DEFAULTS = {
  from: 1.1,
  to: 1,
  start: 'top bottom',
  end: 'bottom top',
  wipeFrom: 1,
  wipeTo: 0,
  wipeStart: 'top 85%',
  wipeDuration: 0.8,
  wipeEase: 'power2.out',
  patternFrom: 0,
  patternTo: 1,
  patternStart: 'top 92%',
  patternEnd: 'center center',
}

export function resolveAppImageOverlay(overlay, wipe = false) {
  if (overlay) return overlay
  if (wipe) return APP_IMAGE_OVERLAYS.WIPE
  return null
}

export function resolveAppImageSizes(sizes) {
  if (!sizes) return APP_IMAGE_SIZES.full
  return APP_IMAGE_SIZES[sizes] || sizes
}

export function sanityImageId(image) {
  return image?.asset?._id || ''
}

export function sanityImageDimensions(image) {
  const width = image?.asset?.metadata?.dimensions?.width
  const height = image?.asset?.metadata?.dimensions?.height
  return { width, height }
}
