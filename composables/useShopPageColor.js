import { resolveShopChromeColors } from '~/utils/shopColors'
import { mergePageChromeColors } from '~/utils/pageColors'

export function useShopChromeColorsState() {
  return useState('shopChromeColors', () => null)
}

export function useShopPageColor(shopPageSource) {
  const { shopColors: siteShopColors, menuColors } = useSiteSettings()
  const shopChromeColorsState = useShopChromeColorsState()

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

  const colors = computed(() => mergePageChromeColors(
    resolveShopChromeColors(
      unref(shopPageSource) || shopPageColors.value,
      siteShopColors.value,
    ),
    menuColors.value,
  ))

  watchEffect(() => {
    shopChromeColorsState.value = colors.value
  })

  usePageColor(colors)
}
