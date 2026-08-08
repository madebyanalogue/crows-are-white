<script setup>
import { extractPageChromeColors } from '~/utils/pageColors'

definePageMeta({
  removeHeaderPadding: false,
})

const REFLECTIONS_PAGE_COLORS_FALLBACK = {
  pageColor: 'crema',
  pageTextColor: 'obsidian',
  menuBackgroundColor: 'crema',
  menuTextColor: 'obsidian',
  menuHighlightColor: 'obsidian',
  basketIconColor: 'obsidian',
}

const { data: page } = await useCmsPage('reflections')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Reflections'
})

usePageSeo(page)

usePageColor(computed(() =>
  page.value ? extractPageChromeColors(page.value) : REFLECTIONS_PAGE_COLORS_FALLBACK,
))

function mapPageBackgroundToSection(source) {
  if (!source) return {}

  return {
    reflectionsBackgroundMediaType: source.pageBackgroundMediaType,
    reflectionsBackgroundVideoSource: source.pageBackgroundVideoSource,
    reflectionsBackgroundVideo: source.pageBackgroundVideo,
    reflectionsBackgroundLoopCloudflare720: source.pageBackgroundLoopCloudflare720,
    reflectionsBackgroundLoopCloudflare1080: source.pageBackgroundLoopCloudflare1080,
    reflectionsBackgroundOverlayOpacity: source.pageBackgroundOverlayOpacity,
    reflectionsBackgroundScrimOpacity: source.pageBackgroundScrimOpacity,
  }
}

const section = computed(() => {
  const fromSections = (page.value?.sections || []).find(
    (entry) => entry?.sectionType === 'reflections',
  )

  if (fromSections) {
    return {
      ...mapPageBackgroundToSection(page.value),
      ...fromSections,
      reflectionsTitle: fromSections.reflectionsTitle?.trim()
        || page.value?.title
        || 'Reflections',
    }
  }

  return {
    sectionType: 'reflections',
    reflectionsTitle: page.value?.title || 'Reflections',
    reflectionsMaxItems: 10,
    ...mapPageBackgroundToSection(page.value),
  }
})
</script>

<template>
  <PageSectionReflections
    v-if="page"
    :section="section"
    is-first-section
    full-page
  />
</template>
