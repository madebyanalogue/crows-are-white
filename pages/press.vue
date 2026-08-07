<script setup>
import { extractPageChromeColors } from '~/utils/pageColors'

definePageMeta({
  removeHeaderPadding: true,
})

const PRESS_PAGE_COLORS_FALLBACK = {
  pageColor: 'fuji',
  pageTextColor: 'obsidian',
  menuBackgroundColor: 'fuji',
  menuTextColor: 'obsidian',
  menuHighlightColor: 'obsidian',
  basketIconColor: 'obsidian',
}

const { data: page } = await useCmsPage('press')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Press'
})

usePageSeo(page)

usePageColor(computed(() =>
  page.value ? extractPageChromeColors(page.value) : PRESS_PAGE_COLORS_FALLBACK,
))
</script>

<template>
  <PageContent v-if="page" :page="page" />
</template>
