<template>
  <div class="page-root">
    <div v-if="showLoading" class="wrapper page-loading">Loading...</div>
    <PageContent v-else-if="page" :page="page" />
  </div>
</template>

<script setup>
const route = useRoute()
const pageTitle = useState('pageTitle', () => '')

const slug = computed(() => {
  const param = route.params.slug
  if (!param) return ''
  return Array.isArray(param) ? param.join('/') : param
})

const { data: page, pending, error, status } = useAsyncData(
  () => `page-${slug.value}`,
  () => $fetch(`/api/page/${slug.value}`),
  { watch: [slug], lazy: true, ...freshDataOptions },
)

const showLoading = computed(() => status.value === 'pending' || (pending.value && !page.value))

watchEffect(() => {
  if (page.value?.title) {
    pageTitle.value = page.value.title
  }
})

usePageDevBackground(page)
usePageColor(page)
usePageSeo(page)

watchEffect(() => {
  if (status.value === 'pending' || status.value === 'idle') return
  if (error.value) {
    showError({
      statusCode: error.value.statusCode || 500,
      statusMessage: error.value.statusMessage || error.value.message || 'Failed to load page',
    })
    return
  }
  if (status.value === 'success' && !page.value) {
    showError({
      statusCode: 404,
      statusMessage: 'Page not found',
    })
  }
})
</script>
