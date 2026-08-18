export interface ShopArtistImage {
  asset?: {
    _id?: string
    url?: string
    metadata?: {
      dimensions?: {
        width?: number
        height?: number
      }
      lqip?: string
    }
  }
  alt?: string
}

export interface ShopArtistGalleryItem {
  _key: string
  caption?: string
  image?: ShopArtistImage
}

export interface ShopArtist {
  _id: string
  name: string
  subtitle?: string
  website?: string
  instagram?: string
  headshot?: ShopArtistImage
  portrait?: ShopArtistImage
  bio?: unknown[]
  whyWeChoseThisArtist?: unknown[]
  gallery?: ShopArtistGalleryItem[]
}

export interface ShopProductContent {
  _id: string
  shopifyHandle: string
  aboutArtistTitle?: string
  artist?: ShopArtist | null
}

export function useShopProductContent(handle: MaybeRefOrGetter<string>) {
  const resolvedHandle = computed(() => toValue(handle))

  return useAsyncData(
    () => `shop-product-content-${resolvedHandle.value}`,
    () => $fetch<{ content: ShopProductContent | null }>(
      `/api/shop/product-content/${resolvedHandle.value}`,
    ),
    { watch: [resolvedHandle] },
  )
}
