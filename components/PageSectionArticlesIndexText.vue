<template>
  <section
    class="section-articles-index-text"
    :class="{ 'section-articles-index-text--no-pad-top': !paddingTop }"
  >
    <div
      ref="headerRef"
      class="section-articles-index-text__header"
    >
      <div class="section-articles-index-text__header-inner">
        <CrowsInsideTrack class="section-articles-index-text__logo" />
        <div
          v-if="hasIntro"
          class="section-articles-index-text__intro h4 serif"
        >
          <SanityContent :blocks="introBlocks" />
        </div>
      </div>
    </div>

    <div class="section-articles-index-text__list wrapper">
      <div class="section-articles-index-text__filters" role="tablist">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="section-articles-index-text__filter caption"
          :class="{ 'is-active': activeCategory === filter.value }"
          :aria-pressed="activeCategory === filter.value"
          @click="setCategory(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <ul class="section-articles-index-text__items">
        <li
          v-for="(article, index) in filteredArticles"
          :key="article.slug"
          class="section-articles-index-text__item"
        >
          <NuxtLink
            :to="`/articles/${article.slug}`"
            class="section-articles-index-text__link"
          >
            <span class="section-articles-index-text__index caption">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span
              class="section-articles-index-text__title serif"
              v-html="article.title"
            />
            <span class="section-articles-index-text__meta caption">
              {{ getArticleMeta(article) }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <p
        v-if="!filteredArticles.length"
        class="section-articles-index-text__empty caption"
      >
        No articles in this category yet.
      </p>
    </div>
  </section>
</template>

<script setup>
import {
  ARTICLE_CATEGORY_FILTERS,
  CATEGORY_LABELS,
  DUMMY_ARTICLES_INDEX_INTRO,
  formatOrdinalArticleDate,
  mapSanityArticleToIndex,
  normalizeArticleCategory,
} from '~/utils/articleIndex'

const props = defineProps({
  section: {
    type: Object,
    default: () => ({}),
  },
})

const route = useRoute()
const router = useRouter()

const headerRef = ref(null)

const introBlocks = computed(() => {
  const blocks = props.section?.articlesIndexIntro
  if (Array.isArray(blocks) && blocks.length) return blocks
  return DUMMY_ARTICLES_INDEX_INTRO
})

const hasIntro = computed(() => introBlocks.value.length > 0)
const paddingTop = computed(() => props.section?.articlesIndexPaddingTop !== false)

const filters = ARTICLE_CATEGORY_FILTERS
const activeCategory = ref(normalizeArticleCategory(route.query.category))

watch(
  () => route.query.category,
  (value) => {
    activeCategory.value = normalizeArticleCategory(value)
  },
)

function setCategory(value) {
  activeCategory.value = value
  const query = { ...route.query }
  if (value === 'all') {
    delete query.category
  } else {
    query.category = value
  }
  router.replace({ query })
}

const { data: sanityArticles } = useArticles()

const articles = computed(() => {
  const seen = new Set()

  return (sanityArticles.value || [])
    .map(mapSanityArticleToIndex)
    .filter((article) => {
      if (!article.slug || seen.has(article.slug)) return false
      seen.add(article.slug)
      return true
    })
})

const filteredArticles = computed(() => {
  if (activeCategory.value === 'all') return articles.value
  return articles.value.filter(
    (article) => (article.category || article.indexLayout) === activeCategory.value,
  )
})

function getArticleMeta(article) {
  if (article.date) return formatOrdinalArticleDate(article.date)
  return CATEGORY_LABELS[article.category] || ''
}

useArticlesIndexPin(headerRef)
</script>

<style scoped>
.section-articles-index-text {
  position: relative;
  --caption: clamp(14px, var(--caption), var(--caption));
}

.section-articles-index-text > .pin-spacer {
  width: 100% !important;
  max-width: 100%;
}

.section-articles-index-text__header {
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

.section-articles-index-text__header-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 4);
  width: min(100%, 64rem);
  text-align: center;
}

.section-articles-index-text__logo {
  width: min(100%, 50rem);
  height: auto;
  fill: currentColor;
}
.section-articles-index-text__logo g:first-child > path {
  fill: var(--verdea);
}

.section-articles-index-text__intro {
  max-width: 34rem;
  width: 100%;
  line-height: 1.25;
}

.section-articles-index-text__intro :deep(p),
.section-articles-index-text__intro :deep(h1),
.section-articles-index-text__intro :deep(h2),
.section-articles-index-text__intro :deep(h3),
.section-articles-index-text__intro :deep(h4),
.section-articles-index-text__intro :deep(h5),
.section-articles-index-text__intro :deep(h6),
.section-articles-index-text__intro :deep(blockquote) {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  opacity: 1;
}

.section-articles-index-text__intro :deep(p + p) {
  margin-top: 1em;
}

.section-articles-index-text__list {
  position: relative;
  z-index: 2;
  padding-top: calc(var(--unit) * 3.5);
  padding-bottom: calc(var(--unit) * 6);
}

.section-articles-index-text--no-pad-top .section-articles-index-text__list {
  padding-top: 0;
}

.section-articles-index-text__filters {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--unit) * 1);
  margin-bottom: calc(var(--unit) * 2);
}

.section-articles-index-text__filter {
  padding: calc(var(--unit) * 0.5) calc(var(--unit) * 1.25);
  border: 1px solid currentColor;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  transition: opacity var(--animation-default), background-color var(--animation-default), color var(--animation-default);
}

.section-articles-index-text__filter.is-active {
  opacity: 1;
  background: currentColor;
  color: var(--background-color, var(--crayon));
}

@media (hover: hover) {
  .section-articles-index-text__filter:hover {
    opacity: 1;
  }
}

.section-articles-index-text__empty {
  padding: calc(var(--unit) * 3) 0;
  opacity: 0.5;
}

.section-articles-index-text__items {
  list-style: none;
  border-top: 1px solid currentColor;
}

.section-articles-index-text__item {
  border-bottom: 1px solid currentColor;
}

.section-articles-index-text__link {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  column-gap: calc(var(--unit) * 2);
  padding: calc(var(--unit) * 1.75) 0;
  color: inherit;
  transition: opacity var(--animation-default), padding-left var(--animation-default);
}

.section-articles-index-text__index {
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
}

.section-articles-index-text__title {
  font-size: clamp(28px, calc(var(--unit) * 2.6), 72px);
  line-height: 1.05;
}

.section-articles-index-text__title :deep(em) {
  font-style: italic;
}

.section-articles-index-text__meta {
  grid-column: 2;
  margin-top: calc(var(--unit) * 0.75);
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (min-width: 1000px) {
  .section-articles-index-text__link {
    grid-template-columns: auto 1fr auto;
  }

  .section-articles-index-text__meta {
    grid-column: auto;
    margin-top: 0;
    text-align: right;
    align-self: baseline;
  }
}

@media (hover: hover) {
  .section-articles-index-text__link:hover {
    padding-left: calc(var(--unit) * 1.5);
  }

  .section-articles-index-text__link:hover .section-articles-index-text__index,
  .section-articles-index-text__link:hover .section-articles-index-text__meta {
    opacity: 1;
  }
}
</style>
