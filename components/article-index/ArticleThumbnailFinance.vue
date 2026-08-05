<template>
  <NuxtLink
    v-if="article"
    :to="`/articles/${article.slug}`"
    class="article-thumb-finance"
  >
    <div class="wrapper">
      <div class="grid-1 grid-md-2 gap-4 gap-md-0" style="align-items: center; justify-content: center;">
      
      <div class="article-thumb-finance__image">
        <div class="article-thumb-finance__frame">
          <img
            :src="article.image"
            :alt="titlePlain"
            loading="lazy"
            decoding="async"
          >
          </div>
        </div>
      <div class="article-thumb-finance__copy">
        <h3 class="article-thumb-finance__title h3 serif" v-html="article.title" />
        <p v-if="formattedDate" class="article-thumb-finance__date ">
          {{ formattedDate }}
        </p>
      </div>
      </div>
  </div>
  </NuxtLink>
</template>

<script setup>
import { formatArticleDate } from '~/utils/articleIndex'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const titlePlain = computed(() => props.article.title?.replace(/<[^>]*>/g, '') ?? '')

const formattedDate = computed(() => formatArticleDate(props.article.date))
</script>

<style scoped>
.article-thumb-finance {
  align-items: center;
  color: inherit;
}
@media (max-width: 999px) {
.wrapper {
  padding: 0 !important;
}
}

.article-thumb-finance__copy {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: calc(var(--unit) * 1.5);
  width: 100%;
}
@media (min-width: 1000px) {
  .article-thumb-finance {
  padding: calc(var(--unit) * 4) 0 calc(var(--unit) * 2) 0;
  }
  .article-thumb-finance__copy {
    width: 90%;
    padding: calc(var(--unit) * 3.75);
  }
}
.article-thumb-finance__title {
  line-height: 1.35;
}

.article-thumb-finance__title {
  width: 100%;
}

.article-thumb-finance__title :deep(em),
.article-thumb-finance__title :deep(i) {
  font-style: italic;
}

.article-thumb-finance__image {
  display: flex;
  justify-content: center;
}

.article-thumb-finance__frame {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 7/6;
  overflow: hidden;
}

.article-thumb-finance__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (min-width: 1000px) {
  .col-11 {
    grid-column: 2 / 13;
  }
  .col-5 {
    grid-column: 14 / 24;
  }
}
</style>
