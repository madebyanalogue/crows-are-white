<script setup>
definePageMeta({
  removeHeaderPadding: true,
})

const { data: page } = await useCmsPage('press')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Press'
})

usePageSeo(page)
usePageColor(page)
</script>

<template>
  <PageContent v-if="page" :page="page" />
</template>
