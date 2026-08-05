<template>
  <section
    class="section-articles-index "
    :class="{ 'section-articles-index--no-pad-top': !paddingTop }"
  >
    <div
      ref="headerRef"
      class="section-articles-index__header"
    >
      <div class="section-articles-index__header-inner">
        <CrowsInsideTrack class="section-articles-index__logo" />
        <div
          v-if="hasIntro"
          class="section-articles-index__intro h4 serif"
        >
          <SanityContent :blocks="introBlocks" />
        </div>
      </div>
    </div>
    
    <div class="section-articles-index__list wrapper">
      <div class="section-articles-index__blocks">
        <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
          <div
            v-if="block.type === 'standard-row'"
            class="section-articles-index__row section-articles-index__row--standard grid gap-3 gap-md-0"
            :class="[
              `section-articles-index__row--align-${block.align}`,
              getStandardRowClass(block.columns),
            ]"
          >
            <ArticleThumbnailStandard
              v-for="article in block.articles"
              :key="article.slug"
              :article="article"
            />
          </div>

          <ArticleThumbnailBrand
            v-else-if="block.type === 'brand' && block.article"
            :article="block.article"
          />

          <ArticleThumbnailFinance
            v-else-if="block.type === 'finance' && block.article"
            :article="block.article"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import ArticleThumbnailBrand from '~/components/article-index/ArticleThumbnailBrand.vue'
import ArticleThumbnailFinance from '~/components/article-index/ArticleThumbnailFinance.vue'
import ArticleThumbnailStandard from '~/components/article-index/ArticleThumbnailStandard.vue'
import {
  buildArticleIndexBlocks,
  DUMMY_ARTICLES_INDEX_INTRO,
  getStandardRowClass,
  groupArticlesByLayout,
  mapSanityArticleToIndex,
} from '~/utils/articleIndex'

const props = defineProps({
  section: {
    type: Object,
    default: () => ({}),
  },
})

const headerRef = ref(null)

const introBlocks = computed(() => {
  const blocks = props.section?.articlesIndexIntro
  if (Array.isArray(blocks) && blocks.length) return blocks
  return DUMMY_ARTICLES_INDEX_INTRO
})

const hasIntro = computed(() => introBlocks.value.length > 0)
const paddingTop = computed(() => props.section?.articlesIndexPaddingTop !== false)

const { data: articles } = useArticles()

const blocks = computed(() => {
  const mapped = (articles.value || []).map(mapSanityArticleToIndex)
  return buildArticleIndexBlocks(groupArticlesByLayout(mapped))
})

useArticlesIndexPin(headerRef)
</script>

<style scoped>
.section-articles-index {
  position: relative;
  --grid-columns: 1;
  --caption: clamp(16px, var(--caption), var(--caption));
}

@media (min-width: 1000px) {
.section-articles-index {
  --grid-columns: 24;
}
}

.section-articles-index > .pin-spacer {
  width: 100% !important;
  max-width: 100%;
}
.grid {
  grid-template-columns: repeat(var(--grid-columns), 1fr);
}
.section-articles-index__header {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: clamp(800px, 60dvh, 1000px);
  padding: 0 60px !important;
  pointer-events: none;
}

.section-articles-index__header-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 4);
  width: min(100%, 64rem);
  text-align: center;
}

.section-articles-index__logo {
  width: min(100%, 50rem);
  height: auto;
  fill: currentColor;
}
.section-articles-index__logo g:first-child > path {
  fill: var(--verdea);
}

.section-articles-index__intro {
  max-width: 34rem;
  width: 100%;
  line-height: 1.25;
}

.section-articles-index__intro :deep(p),
.section-articles-index__intro :deep(h1),
.section-articles-index__intro :deep(h2),
.section-articles-index__intro :deep(h3),
.section-articles-index__intro :deep(h4),
.section-articles-index__intro :deep(h5),
.section-articles-index__intro :deep(h6),
.section-articles-index__intro :deep(blockquote) {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  opacity: 1;
}

.section-articles-index__intro :deep(p + p) {
  margin-top: 1em;
}

.section-articles-index__list {
  position: relative;
  z-index: 2;
  padding-top: calc(var(--unit) * 3.5);
  padding-bottom: calc(var(--unit) * 3);
}

.section-articles-index--no-pad-top .section-articles-index__list {
  padding-top: 0;
}

.section-articles-index__blocks {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 7);
}

.section-articles-index__row {
  align-items: start;
}

.section-articles-index__row--align-bottom {
  align-items: end;
}

@media (min-width: 1000px) {
  .section-articles-index__row--6-4 > :deep(:nth-child(1)) {
    grid-column: 2 / 15;
  }

  .section-articles-index__row--6-4 > :deep(:nth-child(2)) {
    grid-column: 16 / 24;
  }

  .section-articles-index__row--4-6 > :deep(:nth-child(1)) {
    grid-column: 2 / 11;
  }

  .section-articles-index__row--4-6 > :deep(:nth-child(2)) {
    grid-column: 12 / 24;
  }
}

@media (max-width: 999px) {
  .section-articles-index__row > :deep(*) {
    grid-column: 1 / -1;
  }
}


</style>
