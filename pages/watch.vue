<script setup>
import { extractPageChromeColors } from '~/utils/pageColors'

definePageMeta({
  removeHeaderPadding: true,
})

const WATCH_PAGE_COLORS_FALLBACK = {
  pageColor: '#000000',
  pageTextColor: '#ffffff',
  menuBackgroundColor: '#0b0d0c',
  menuTextColor: '#ff555f',
  menuHighlightColor: '#ff555f',
  basketIconColor: '#ff555f',
}

const { data: page } = await useCmsPage('watch')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Watch'
})

usePageSeo(page)

usePageColor(computed(() =>
  page.value ? extractPageChromeColors(page.value) : WATCH_PAGE_COLORS_FALLBACK,
))

const displayPage = computed(() => {
  if (!page.value) return null

  const sections = (page.value.sections || []).filter(Boolean)
  if (sections.some((section) => section.sectionType === 'watch')) {
    return page.value
  }

  // Temporary fallback until a Watch page section is linked in Sanity.
  return {
    ...page.value,
    sections: [{ _id: 'watch-section-fallback', sectionType: 'watch' }, ...sections],
  }
})
</script>

<template>
  <PageContent v-if="displayPage" :page="displayPage" />
</template>
