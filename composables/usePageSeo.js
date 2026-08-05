import { resolveSanityAssetUrl } from '~/utils/sanity'

export function usePageSeo(pageRef) {
  const pageSeoTitle = useState('pageSeoTitle', () => '')
  const pageSeoDescription = useState('pageSeoDescription', () => '')
  const pageSeoImage = useState('pageSeoImage', () => '')

  watchEffect(() => {
    const page = unref(pageRef)
    pageSeoTitle.value = page?.seoTitle?.trim() || ''
    pageSeoDescription.value = page?.seoDescription?.trim() || ''
    pageSeoImage.value = resolveSanityAssetUrl(page?.seoImage?.asset) || ''
  })

  onBeforeUnmount(() => {
    pageSeoTitle.value = ''
    pageSeoDescription.value = ''
    pageSeoImage.value = ''
  })
}
