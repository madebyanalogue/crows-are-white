<script setup>
definePageMeta({
  transparentHeader: true,
})

import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'
import { getLoopVideoHeadLinks } from '~/utils/loopVideoPreload'

const { data: page, error } = await useAsyncData('page-home', async () => {
  const home = await $fetch('/api/page/home').catch(() => null)
  if (home) return home
  return $fetch('/api/page/homepage').catch(() => null)
})

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Crows Are White'
})

usePageDevBackground(page)
usePageColor(page)
usePageSeo(page)

const heroLoop = computed(() => {
  const heroSection = page.value?.sections?.find((section) => section?.sectionType === 'hero')
  return heroSection ? resolveSectionLoopVideo(heroSection, 'hero') : null
})

useHead(() => ({
  link: getLoopVideoHeadLinks(heroLoop.value),
}))

const displayPage = computed(() => {
  if (!page.value) return null

  return {
    ...page.value,
    // Home is built from sections — keep the page title out of the intro column.
    richText: [],
  }
})

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: error.value.statusMessage || 'Home page not found',
  })
}
</script>

<template>
  <PageContent v-if="displayPage" :page="displayPage" />
</template>
