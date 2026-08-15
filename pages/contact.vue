<script setup>
definePageMeta({
  removeHeaderPadding: true,
})

const { data: page } = await useCmsPage('contact')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Contact'
})

usePageSeo(page)
usePageColor(page)
</script>

<template>
  <PageContent v-if="page" :page="page" />
</template>
