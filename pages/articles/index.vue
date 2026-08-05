<template>
  <PageSectionArticlesIndex />
</template>

<script setup>
const pageTitle = useState('pageTitle', () => '')

pageTitle.value = 'Inside Track'
usePageColor(ref(null))
</script>
