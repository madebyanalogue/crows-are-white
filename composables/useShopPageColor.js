import { resolveShopChromeColors, mergeShopChromeColors } from '~/utils/shopColors'

export function useShopChromeColorsState() {
  return useState('shopChromeColors', () => null)
}

export function useShopPageColor(shopPageSource) {
  const { shopColors: siteShopColors, menuColors } = useSiteSettings()
  const shopChromeColorsState = useShopChromeColorsState()
  const isTransitioning = useState('pageTransitioning', () => false)
  const { pending, applied, swapped } = useAppliedPageColors()

  const { data: shopPageColors } = useAsyncData(
    'page-shop-color',
    () => $fetch('/api/page-color/shop').catch(() => null),
    {
      ...freshDataOptions,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key]
          ?? nuxtApp.static.data[key]
          ?? nuxtApp.payload.data['page-shop']
          ?? nuxtApp.static.data['page-shop']
          ?? null
      },
    },
  )

  const colors = computed(() => mergeShopChromeColors(
    resolveShopChromeColors(
      unref(shopPageSource) || shopPageColors.value,
      siteShopColors.value,
    ),
    menuColors.value,
  ))

  watchEffect(() => {
    const resolved = colors.value

    shopChromeColorsState.value = resolved
    pending.value = resolved

    const shouldApplyNow = import.meta.server
      || !isTransitioning.value
      || swapped.value

    if (shouldApplyNow) {
      applied.value = resolved
    }
  })
}
