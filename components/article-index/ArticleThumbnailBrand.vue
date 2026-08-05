<template>
  <NuxtLink
    v-if="article"
    :to="`/articles/${article.slug}`"
    class="article-thumb-brand"
  >
    <div class="grid">
      <div class="article-thumb-brand__copy col-8">
        <h3 class="article-thumb-brand__title headline">
          {{ article.title }}
        </h3>
        <div class="article-thumb-brand__decor" aria-hidden="true">
          <ArticleBrandDecor :name="article.brandDecor || 'arc'" />
        </div>
      </div>
      <div class="article-thumb-brand__image col-4">
        <img
          :src="article.image"
          :alt="article.title"
          loading="lazy"
          decoding="async"
        >
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import ArticleBrandDecor from '~/components/article-index/ArticleBrandDecor.vue'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const decorColor = computed(() => (
  props.article.brandColor === 'verdea' ? 'var(--verdea)' : 'var(--arancio)'
))
</script>

<style scoped>
.article-thumb-brand .grid {
  align-items: center;
  color: inherit;
}
@media (min-width: 1000px) {
  .article-thumb-brand .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.article-thumb-brand .grid > * {
  aspect-ratio:1;
}

.article-thumb-brand__copy {
  position: relative;
  min-height: 100%;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: left;
  overflow: hidden;
}
@media (min-width: 1000px) {
  .article-thumb-brand__copy {
  padding:calc(var(--unit) * 3.75);
}
}

.article-thumb-brand__title {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  font-size: calc(var(--unit-font) * 4);
  line-height: .95;
  letter-spacing: -0.01em;
}

.article-thumb-brand__decor {
  --brand-decor-color: v-bind(decorColor);
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 0;
  width: 80%;
  height: 80%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.article-thumb-brand__decor :deep(.article-brand-decor) {
  width: auto;
  height: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  max-height: 100%;
}


.article-thumb-brand:hover .article-thumb-brand__decor :deep(.article-brand-decor),
.article-thumb-brand:focus-visible .article-thumb-brand__decor :deep(.article-brand-decor) {
  opacity: 1;
}

.article-thumb-brand__image {
  width: 100%;
  overflow: hidden;
}

.article-thumb-brand__image img {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 7 / 6;
  object-fit: cover;
}

@media (max-width: 999px) {
  .article-thumb-brand__copy .grid,
  .article-thumb-brand__image {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1000px) {
  .article-thumb-brand {
    margin:calc(var(--unit) * 3) 0 calc(var(--unit) * 5);
  }
  /* .col-4 {
    grid-column-start: 17;
    grid-column-end: 24;
  }

  .col-8 {
    grid-column-end: 16;
    grid-column-start: 3;
  } */
}
@media (max-width: 999px) {
.article-thumb-brand__title {
  font-size: 8vw;
}
}
</style>
