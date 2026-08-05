export const OWNERS_DISPLAY_COUNT = 3

export function buildOwnersDisplayItems(cmsItems = []) {
  const items = Array.isArray(cmsItems) ? cmsItems : []

  return Array.from({ length: OWNERS_DISPLAY_COUNT }, (_, index) => {
    const cmsItem = items[index]
    if (cmsItem) {
      return cmsItem
    }

    return {
      _key: `owners-placeholder-${index}`,
      title: [],
      description: [],
      keys: [],
    }
  })
}
