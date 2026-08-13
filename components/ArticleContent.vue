<template>
  <article class="page-content article grid-1 gap-5">
    <div class="article__topnav wrapper">
      <NuxtLink :to="ARTICLES_INDEX_PATH" class="article__back caption">
        <span aria-hidden="true">&larr;</span>
        Back to all articles
      </NuxtLink>
    </div>

    <div
      v-if="hasHeader && showFeaturedImage"
      class="article__header article__header--with-featured"
    >
      <div class="article__intro grid-1 gap-section">
        <div v-if="article.title?.length || categoryLabel" class="wrapper">
          <NuxtLink
            v-if="categoryLabel"
            :to="categoryLink"
            class="article__category caption"
          >
            {{ categoryLabel }}
          </NuxtLink>
          <h1
            v-if="article.title?.length"
            class="h2 serif light article__title text-center line-height-125"
          >
            <SanityInline :blocks="article.title" />
          </h1>
          <p v-if="author" class="article__author caption">by {{ author }}</p>
        </div>
        <ArticleText
          v-if="introBlocks.length"
          :blocks="introBlocks"
          drop-cap
        />
      </div>
      <figure ref="featuredFigureRef" class="article__featured">
        <div ref="featuredParallaxRef" class="article__featured-parallax">
          <AppImage
            :src="featuredImageSrc"
            :width="featuredImageWidth"
            :height="featuredImageHeight"
            :alt="article.featuredImage?.alt || titlePlain"
            class="article__featured-img"
            sizes="half"
          />
        </div>
      </figure>
    </div>

    <div
      v-else-if="hasHeader"
      class="article__header"
    >
      <div class="grid-1 gap-gutter">
        <div class="article__intro grid-1 gap-section pad-top">
          <div v-if="article.title?.length || categoryLabel" class="wrapper">
            <NuxtLink
              v-if="categoryLabel"
              :to="categoryLink"
              class="article__category caption"
            >
              {{ categoryLabel }}
            </NuxtLink>
            <h1
              v-if="article.title?.length"
              class="h1 serif article__title light text-center line-height-125 section-padding pad-top-bottom"
            >
              <SanityInline :blocks="article.title" />
            </h1>
            <p v-if="author" class="article__author caption">by {{ author }}</p>
          </div>
          <ArticleText
            v-if="introBlocks.length"
            :blocks="introBlocks"
            drop-cap
          />
        </div>
      </div>
    </div>

    <div v-if="blocks.length" class="article__content gap-5 section-padding pad-bottom">
      <template v-for="block in blocks" :key="block._key">
        <ArticleBlockText
          v-if="block._type === 'articleTextBlock'"
          :block="block"
        />
        <ArticleBlockImage
          v-else-if="block._type === 'articleImageBlock'"
          :block="block"
        />
        <ArticleBlockSubtitle
          v-else-if="block._type === 'articleSubtitleBlock'"
          :block="block"
        />
        <ArticleBlockCta
          v-else-if="block._type === 'articleCtaBlock'"
          :block="block"
        />
      </template>
    </div>
  </article>
</template>

<script setup>
import { plainTextFromBlocks } from '~/utils/portableText'
import { CATEGORY_LABELS } from '~/utils/articleIndex'

const ARTICLES_INDEX_PATH = '/inside-track'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const author = computed(() => props.article?.author || 'Des Branson')
const category = computed(() => props.article?.indexLayout || 'standard')
const categoryLabel = computed(() => CATEGORY_LABELS[category.value] || '')
const categoryLink = computed(() => ({
  path: ARTICLES_INDEX_PATH,
  query: { category: category.value },
}))

const titlePlain = computed(() => plainTextFromBlocks(props.article?.title))
const introBlocks = computed(() => props.article?.intro ?? [])
const featuredImageSrc = computed(
  () => props.article?.featuredImage?.asset?._id || '',
)
const showFeaturedImage = computed(() => (
  props.article?.showFeaturedImageOnArticle !== false
  && Boolean(featuredImageSrc.value)
))
const hasHeader = computed(() =>
  Boolean(props.article?.title?.length)
  || introBlocks.value.length > 0
  || showFeaturedImage.value,
)
const featuredImageWidth = computed(
  () => props.article?.featuredImage?.asset?.metadata?.dimensions?.width,
)
const featuredImageHeight = computed(
  () => props.article?.featuredImage?.asset?.metadata?.dimensions?.height,
)

const blocks = computed(() => props.article?.content || [])

const featuredFigureRef = ref(null)
const featuredParallaxRef = ref(null)

useVideoParallax(featuredFigureRef, featuredParallaxRef)
</script>

<style scoped>
.article {
  --max-text-block-width: 480px;
  --max-image-block-width: 1000px;
  --max-subheading-block-width: 700px;
  --max-article-cta-width: 1060px;
  --article-featured-max-height: 75vw;
  --article-featured-parallax-speed: 0.35;
  --body: clamp(16px, calc(var(--unit-font) * 1), 18px);
}
.article__intro {
  align-items:center;
  justify-content:center;

  display: flex;
    flex-direction: column;
}

.article__topnav {
  padding-top: calc(var(--unit) * 1.5);
}

.article__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(--animation-default);
}

.article__category {
  display: block;
  margin-bottom: calc(var(--unit) * 1);
  color: inherit;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
  transition: opacity var(--animation-default);
}

.article__author {
  margin-top: calc(var(--unit) * 1);
  color: inherit;
  text-align: center;
  font-style: italic;
  opacity: 0.6;
}

@media (hover: hover) {
  .article__back:hover,
  .article__category:hover {
    opacity: 1;
  }
}
.article__header {
  align-items: center;
}

.article__header--with-featured {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
}

@media (min-width: 1000px) {
  .article__header--with-featured {
    grid-template-columns: repeat(2, 1fr);
    align-items: stretch;
  }
  .article__title {
    max-width:900px;
    margin: 0 auto;
  }
}

.article__featured {
  position: relative;
  margin: 0;
  width: 100%;
  height: var(--article-featured-max-height);
  max-height: var(--article-featured-max-height);
  max-height: calc(100dvh - calc(var(--header-height) * 1px));
  overflow: hidden;
  min-height: 0;
}

.article__featured-parallax {
  width: 100%;
  height: calc(100% * (1 + var(--article-featured-parallax-speed)));
  will-change: transform;
}

.article__featured-img {
  display: block;
  width: 100%;
  height: 100%;
}

.article__featured-img :deep(.app-image),
.article__featured-img :deep(.app-image__media) {
  display: block;
  width: 100%;
  height: 100%;
}

.article__featured-img :deep(.app-image__img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.article__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  --body: clamp(16px, calc(var(--unit-font) * .8), 18px);
}

</style>
