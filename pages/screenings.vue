<script setup>
import { extractPageChromeColors } from '~/utils/pageColors'

definePageMeta({
  removeHeaderPadding: true,
})

const SCREENINGS_PAGE_COLORS_FALLBACK = {
  pageColor: '#ffffff',
  pageTextColor: '#111010',
  menuBackgroundColor: '#ffffff',
  menuTextColor: '#111010',
  menuHighlightColor: '#ff9944',
  basketIconColor: '#111010',
}

const { data: page } = await useCmsPage('screenings')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Screenings'
})

usePageSeo(page)

usePageColor(computed(() =>
  page.value ? extractPageChromeColors(page.value) : SCREENINGS_PAGE_COLORS_FALLBACK,
))

const displayPage = computed(() => {
  if (!page.value) return null

  const sections = (page.value.sections || []).filter(Boolean)
  if (sections.some((section) => section.sectionType === 'screenings')) {
    return page.value
  }

  return {
    ...page.value,
    sections: [{ _id: 'screenings-section-fallback', sectionType: 'screenings' }, ...sections],
  }
})
</script>

<template>
  <PageContent v-if="displayPage" :page="displayPage" />
</template>
