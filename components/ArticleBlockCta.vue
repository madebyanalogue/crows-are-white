<template>
  <aside v-if="hasContent" class="article-block-cta">
    <figure class="article-block-cta__media">
      <AppImage
        v-if="imageSrc"
        :src="imageSrc"
        :width="imageWidth"
        :height="imageHeight"
        :alt="imageAlt"
        class="article-block-cta__img"
        sizes="cta"
      />
      <CrowsCta
        v-else
        class="article-block-cta__brand"
      />
    </figure>
    <div class="article-block-cta__content">
      <h3 v-if="titleBlocks.length" class="article-block-cta__title h4">
        <SanityInline :blocks="titleBlocks" />
      </h3>
      <SanityContent
        v-if="descriptionBlocks.length"
        :blocks="descriptionBlocks"
        class="article-block-cta__description rich-text"
      />
      <nav
        v-if="links.length"
        class="article-block-cta__links"
        aria-label="Calls to action"
      >
        <MenuLink
          v-for="(link, index) in links"
          :key="link._key || index"
          :item="toMenuItem(link)"
          link-class=""
          :show-arrow="false"
        />
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { plainTextFromBlocks } from '~/utils/portableText'

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
})

const imageSrc = computed(() => props.block.image?.asset?._id || '')
const imageWidth = computed(() => props.block.image?.asset?.metadata?.dimensions?.width)
const imageHeight = computed(() => props.block.image?.asset?.metadata?.dimensions?.height)
const titleBlocks = computed(() => props.block.title ?? [])
const descriptionBlocks = computed(() => props.block.description ?? [])
const titlePlain = computed(() => plainTextFromBlocks(titleBlocks.value))
const imageAlt = computed(() => props.block.image?.alt || titlePlain.value || '')

const links = computed(() => {
  if (props.block.links?.length) return props.block.links
  if (props.block.link?.linkTitle) return [props.block.link]
  return []
})

const hasContent = computed(() =>
  titleBlocks.value.length > 0
  || descriptionBlocks.value.length > 0
  || links.value.length > 0,
)

function toMenuItem(link) {
  return {
    text: link.linkTitle,
    link: {
      type: link.type,
      page: link.page,
      url: link.url,
    },
    isButton: true,
  }
}
</script>

<style scoped>
.article-block-cta {
  width: 100%;
  max-width: var(--max-article-cta-width, 1060px);
  display: grid;
  align-items: center;
  background-color: var(--fuji);
  overflow: hidden;
}
.article-block-cta__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 2);
  padding: calc(var(--unit) * 0);
}
@media (max-width: 999px) {
  .article-block-cta {
    background:transparent !important;
  }
}


@media (min-width: 1000px) {
  .article-block-cta {
    grid-template-columns: 1fr 2fr;
    width: calc(var(--unit) * 70);
  }

  .article-block-cta__content {
    grid-column: 2;
    padding: calc(var(--unit) * 5);
  }

  .article-block-cta__media {
    grid-column: 1;
    grid-row: 1;
    align-self: stretch;
  }
}

.article-block-cta__links {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--unit) * 1.5);
  margin-top: calc(var(--unit) * 0.25);
}

.article-block-cta__links:has(.menu-link:hover) :deep(.menu-link) {
  opacity: 0.2;
}

.article-block-cta__links:has(.menu-link:hover) :deep(.menu-link:hover) {
  opacity: 1;
}

.article-block-cta__media {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  height: 100%;
  width: 100%;
}

.article-block-cta__img,
.article-block-cta__brand {
  width: 100%;
  height: auto;
  display: block;
}

.article-block-cta__img {
  height: 100%;
  object-fit: cover;
}

@media (max-width: 999px) {
.article-block-cta__media {
  display:none;
}
}

</style>
