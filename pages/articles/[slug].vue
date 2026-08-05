<template>
  <div v-if="showLoading" class="wrapper page-loading">Loading...</div>
  <ArticleContent v-else-if="article" :article="article" />
</template>

<script setup>
import { plainTextFromBlocks } from '~/utils/portableText'

const route = useRoute()
const pageTitle = useState('pageTitle', () => '')

const slug = computed(() => route.params.slug)

const { data: article, pending, error, status } = useAsyncData(
  () => `article-${slug.value}`,
  () => $fetch(`/api/article/${slug.value}`),
  { watch: [slug], lazy: true, ...freshDataOptions },
)

const showLoading = computed(() => status.value === 'pending' || (pending.value && !article.value))

const videoHeroActive = useVideoHero()

watchEffect(() => {
  const title = plainTextFromBlocks(article.value?.title)
  if (title) pageTitle.value = title
  videoHeroActive.value = false
})

usePageColor(computed(() => ({ pageColor: 'crayon' })))

watchEffect(() => {
  if (status.value === 'pending' || status.value === 'idle') return
  if (error.value) {
    showError({
      statusCode: error.value.statusCode || 500,
      message: error.value.message || 'Failed to load article',
    })
    return
  }
  if (status.value === 'success' && !article.value) {
    showError({
      statusCode: 404,
      message: 'Article not found',
    })
  }
})
</script>
