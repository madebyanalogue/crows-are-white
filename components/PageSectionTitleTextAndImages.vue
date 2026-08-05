<template>
  <div
    v-if="hasContent"
    class="section-title-text-and-images"
    :class="{
      'section-title-text-and-images--no-pad-bottom': paddingBottom === 'none',
    }"
    :style="sectionPaddingStyle"
  >

    <div class="wrapper">
      <div v-if="hasHeadline" class="text-center section-padding pad-bottom">
          <h1 class="h2 serif">
            <SanityInline :blocks="section.titleHeadline" />
          </h1>
        </div>
      <div class="grid-1 gap-3">
        

        <hr
          v-if="hasHeadline && hasItems"
          class="page-content__divider"
        />

        <section
          v-if="hasItems"
          class="section-title-text-and-images__items grid-1 gap-1 gap-md-3"
        >
          <template
            v-for="(item, index) in visibleItems"
            :key="item._key"
          >
            <hr
              v-if="index > 0"
              class="page-content__divider"
            />
            <div class="section-title-text-and-images__item grid-1 gap-6">
              <div class="grid-1 grid-md-2 gap-3 gap-md-gutter">
                <div v-if="item.title?.length" class="">
                  <h2 class="h3" style="letter-spacing: -0.01em;">
                    <SanityInline :blocks="item.title" />
                  </h2>
                </div>
                <div
                  v-if="item.description?.length || hasItemLinks(item)"
                  class="section-title-text-and-images__content"
                >
                  <SanityContent
                    v-if="item.description?.length"
                    :blocks="item.description"
                    class="max-text-block-width"
                  />
                  <nav
                    v-if="hasItemLinks(item)"
                    class="section-title-text-and-images__links"
                    aria-label="Related links"
                  >
                    <MenuLink
                      v-for="link in itemLinks(item)"
                      :key="link._key"
                      :item="toMenuItem(link)"
                      arrow-variant="scale"
                    />
                  </nav>
                </div>
              </div>

              <div
                v-if="item.images?.length"
                class="section-title-text-and-images__images gap-3 gap-md-gutter"
                :style="imagesGridStyle(item)"
              >
                <figure
                  v-for="imageItem in item.images"
                  :key="imageItem._key"
                  class="section-title-text-and-images__figure"
                >
                  <div
                    class="section-title-text-and-images__image-container"
                    :class="{
                      'section-title-text-and-images__image-container--auto': !imageAspectRatio(imageItem),
                    }"
                    :style="imageContainerStyle(imageItem)"
                  >
                    <AppImage
                      v-if="imageSrc(imageItem)"
                      :src="imageSrc(imageItem)"
                      :width="imageWidth(imageItem)"
                      :height="imageHeight(imageItem)"
                      :alt="imageCaption(imageItem)"
                      class="section-title-text-and-images__img"
                      sizes="gallery"
                    />
                  </div>
                  <figcaption
                    v-if="imageCaption(imageItem)"
                    class="section-title-text-and-images__caption caption"
                  >
                    {{ imageCaption(imageItem) }}
                  </figcaption>
                </figure>
              </div>
            </div>
          </template>
        </section>

        <hr
          v-if="hasItems && dividerAfterLastItem"
          class="page-content__divider section-title-text-and-images__divider--after-last"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { getMenuItemUrl } = useMenuLinks()

const items = computed(() => props.section?.titleTextAndImagesItems ?? [])
const visibleItems = computed(() => items.value.filter(
  (item) => item.title?.length || item.description?.length || item.images?.length,
))
const hasHeadline = computed(() => (props.section?.titleHeadline?.length ?? 0) > 0)
const hasItems = computed(() => visibleItems.value.length > 0)
const hasContent = computed(() => hasHeadline.value || hasItems.value)
const dividerAfterLastItem = computed(() => props.section?.titleTextAndImagesDividerAfterLastItem === true)

const SECTION_PADDING_VALUES = {
  none: '0',
  small: 'var(--section-padding-small)',
  large: 'var(--section-padding)',
  xlarge: 'calc(var(--section-padding) * 1.5)',
}

function resolveSectionPadding(value) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }

  if (value === false) return 'none'
  return 'large'
}

const paddingTop = computed(() => resolveSectionPadding(props.section?.titleTextAndImagesPaddingTop))
const paddingBottom = computed(() => resolveSectionPadding(props.section?.titleTextAndImagesPaddingBottom))

const sectionPaddingStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[paddingTop.value],
  paddingBottom: SECTION_PADDING_VALUES[paddingBottom.value],
}))

function imageSrc(item) {
  return item?.image?.asset?._id || ''
}

function imageWidth(item) {
  return item?.image?.asset?.metadata?.dimensions?.width
}

function imageHeight(item) {
  return item?.image?.asset?.metadata?.dimensions?.height
}

function imageCaption(item) {
  const caption = item?.caption
  if (typeof caption === 'string' && caption.trim()) {
    return caption.trim()
  }

  const alt = item?.image?.alt
  if (typeof alt === 'string' && alt.trim()) {
    return alt.trim()
  }

  return ''
}

function usesNaturalRatio(item) {
  return (item?.aspectRatio || 'natural') === 'natural'
}

function imageAspectRatio(item) {
  if (!usesNaturalRatio(item)) {
    const value = Number(item?.aspectRatioValue)
    if (value > 0) return String(value)
  }

  const width = imageWidth(item)
  const height = imageHeight(item)
  if (width > 0 && height > 0) return `${width} / ${height}`

  return null
}

function imageContainerStyle(item) {
  const aspectRatio = imageAspectRatio(item)
  if (!aspectRatio) return undefined
  return { aspectRatio }
}

function imagesGridStyle(item) {
  return {
    '--images-grid-template': item?.imagesGridTemplate || '1fr 1fr',
  }
}

function toMenuItem(link) {
  return {
    text: link.linkText,
    link: {
      type: 'page',
      page: link.page,
    },
    isButton: true,
  }
}

function isValidLink(link) {
  if (!link?.linkText?.trim() || link?.page?.slug?.current == null) {
    return false
  }

  const href = getMenuItemUrl(toMenuItem(link))
  return Boolean(href && href !== '#')
}

function itemLinks(item) {
  return (item?.links ?? []).filter(isValidLink)
}

function hasItemLinks(item) {
  return itemLinks(item).length > 0
}
</script>

<style scoped>
.section-title-text-and-images {
  display: flex;
  flex-direction: column;
}
@media (min-width: 1000px) {
  .section-title-text-and-images {
--max-text-block-width: 530px;
  }
}
.section-title-text-and-images--no-pad-bottom .section-title-text-and-images__divider--after-last {
  margin-bottom: calc(var(--unit) * 0);
}

.section-title-text-and-images__items {
  display: flex;
  flex-direction: column;
}

.section-title-text-and-images__item {
  display: flex;
  flex-direction: column;
}

.section-title-text-and-images__images {
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
  width: 100%;
}

@media (min-width: 1000px) {
  .section-title-text-and-images__images {
    grid-template-columns: var(--images-grid-template, 1fr 1fr);
  }
}

.section-title-text-and-images__figure {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.section-title-text-and-images__img {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  inset: 0;
  object-fit: cover;
  object-position: center;
}

.section-title-text-and-images__image-container {
  position: relative;
  overflow: hidden;
}

.section-title-text-and-images__image-container--auto .section-title-text-and-images__img {
  position: static;
  height: auto;
}

.section-title-text-and-images__content {
  min-width: 0;
}

.section-title-text-and-images__links {
  display: grid;
  gap: calc(var(--unit) * .65);
  margin-top: calc(var(--unit) * 2);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  max-width: 600px;
  width: 100%;
  min-width: 0;
}

.section-title-text-and-images__links :deep(.menu-link) {
  min-width: 0;
}

.section-title-text-and-images__links :deep(.menu-link__content--button:has(.link-arrow) .menu-link__label) {
  width: auto;
  max-width: 100%;
}

.section-title-text-and-images__links:has(.menu-link:hover) :deep(.menu-link) {
  opacity: 0.2;
}

.section-title-text-and-images__links:has(.menu-link:hover) :deep(.menu-link:hover) {
  opacity: 1;
}

@media (max-width: 999px) {
  .page-content__divider {
    margin: calc(var(--unit) * 2) 0;
  }
}
</style>
