<script setup>
import { extractPageChromeColors } from '~/utils/pageColors'

definePageMeta({
  removeHeaderPadding: true,
})

const VIDEOS_PAGE_COLORS_FALLBACK = {
  pageColor: '#e6f2e9',
  pageTextColor: 'obsidian',
  menuBackgroundColor: 'crema',
  menuTextColor: 'obsidian',
  featureColor: 'arancio',
}

const { data: page } = await useCmsPage('videos')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Videos'
})

usePageSeo(page)

usePageColor(computed(() =>
  page.value ? extractPageChromeColors(page.value) : VIDEOS_PAGE_COLORS_FALLBACK,
))

const displayPage = computed(() => {
  if (!page.value) return null

  const sections = (page.value.sections || []).filter(Boolean)
  if (sections.some((section) => section.sectionType === 'videos')) {
    return page.value
  }

  // Temporary fallback until a Videos page section is linked in Sanity.
  return {
    ...page.value,
    sections: [{ _id: 'videos-section-fallback', sectionType: 'videos' }, ...sections],
  }
})
</script>

<template>
  <PageContent v-if="displayPage" :page="displayPage" />
</template>
