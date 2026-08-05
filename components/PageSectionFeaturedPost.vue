<template>
  <section
    v-if="hasContent"
    ref="sectionRef"
    class="section-featured-post section-padding"
    :class="{
      'section-featured-post--no-pad-top': !paddingTop,
    }"
    :style="sectionStyle"
  >
    <div ref="pinRef" class="section-featured-post__pin">
      <div class="wrapper">
        <div class="section-featured-post__layout grid-1 grid-md-2">
          <div class="section-featured-post__content">
            <div ref="mainRef" class="section-featured-post__main grid-1 gap-5">


              <div class="grid-1 gap-2">
                <p class="section-featured-post__subtitle">
                  Finance & Opinion
                </p>
                <component
                  :is="titleComponent"
                  v-if="titleBlocks.length"
                  v-bind="titleComponentProps"
                  class="section-featured-post__title-trigger"
                >
                  <h2 class="h3 serif section-featured-post__title">
                    <SanityInline :blocks="titleBlocks" />
                  </h2>
                </component>
              </div>

              <div
                v-if="hasLink"
                class="section-featured-post__link section-featured-post__link--main"
              >
                <MenuLink
                  :item="readMoreMenuItem"
                  :show-arrow="false"
                  link-class="menu-link--underline h4 serif"
                />
              </div>

            </div>
          </div>
          <div class="section-featured-post__content section-featured-post__media">
            <div class="section-featured-post__media-content">
              <div ref="mediaInnerRef" class="section-featured-post__inner">
                <div class="section-featured-post__logo-wrap">
                  <CrowsInsideTrack class="section-featured-post__logo" />
                  <NuxtLink
                    to="/the-inside-track"
                    class="section-featured-post__logo-link"
                    aria-label="The Inside Track"
                  />
                </div>
              </div>
              <div
                v-if="hasMediaLink"
                ref="mediaLinkRef"
                class="section-featured-post__link"
              >
                <MenuLink
                  :item="mediaLinkMenuItem"
                  :show-arrow="false"
                  link-class="menu-link--underline h4 serif"
                />
              </div>
            </div>
            <figure
              v-if="imageId"
              ref="figureRef"
              class="section-featured-post__figure"
            >
              <div class="section-featured-post__image-container">
                <AppImage
                  :src="imageId"
                  :width="imageWidth"
                  :height="imageHeight"
                  :alt="imageAlt"
                  class="section-featured-post__img"
                  sizes="half"
                />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'
import { toCssColor, resolvePageTextColor, DEFAULT_PAGE_COLOR } from '~/utils/pageColors'

const { whatsappUrl } = useSiteSettings()
const { getMenuItemUrl } = useMenuLinks()

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const article = computed(() => props.section?.featuredPostArticle ?? null)
const paddingTop = computed(() => props.section?.featuredPostPaddingTop !== false)

const titleBlocks = computed(() => {
  const sectionTitle = props.section?.featuredPostTitle
  if (Array.isArray(sectionTitle) && sectionTitle.length) return sectionTitle
  return article.value?.title ?? []
})
const articleSlug = computed(() => article.value?.slug?.current || '')

const image = computed(() => article.value?.featuredImage ?? null)
const imageId = computed(() => image.value?.asset?._id || '')
const imageWidth = computed(() => image.value?.asset?.metadata?.dimensions?.width)
const imageHeight = computed(() => image.value?.asset?.metadata?.dimensions?.height)

const imageAlt = computed(() => {
  const alt = image.value?.alt
  if (typeof alt === 'string' && alt.trim()) return alt.trim()

  const titleText = titleBlocks.value
    .flatMap((block) => block.children?.map((child) => child.text).join('') || '')
    .join(' ')
    .trim()

  return titleText || 'Featured post image'
})

const linkHref = computed(() => (
  articleSlug.value ? `/articles/${articleSlug.value}` : ''
))

const readMoreMenuItem = computed(() => ({
  text: 'Read more',
  link: {
    type: 'url',
    url: linkHref.value,
  },
}))

const featuredPostLinkTitle = computed(() => props.section?.featuredPostLinkTitle?.trim() || '')
const featuredPostLink = computed(() => props.section?.featuredPostLink ?? null)

const mediaLinkMenuItem = computed(() => ({
  text: featuredPostLinkTitle.value,
  link: featuredPostLink.value,
}))

const hasLink = computed(() => Boolean(linkHref.value))
const hasMediaLink = computed(() => {
  if (!featuredPostLinkTitle.value || !featuredPostLink.value?.type) return false
  if (featuredPostLink.value.type === 'whatsapp') return Boolean(whatsappUrl.value)

  const href = getMenuItemUrl(mediaLinkMenuItem.value)
  return Boolean(href && href !== '#')
})

const titleComponent = computed(() => (hasLink.value ? resolveComponent('NuxtLink') : 'button'))
const titleComponentProps = computed(() => (
  hasLink.value
    ? { to: linkHref.value }
    : { type: 'button' }
))

const sectionStyle = computed(() => ({
  '--section-background': toCssColor(props.section?.featuredPostBackgroundColor, 'obsidian'),
  '--section-color': toCssColor(
    resolvePageTextColor(
      props.section?.featuredPostTextColor,
      props.section?.featuredPostBackgroundColor,
    ),
    'fuji',
  ),
}))

const hasContent = computed(
  () => Boolean(article.value)
    && (titleBlocks.value.length > 0
      || Boolean(imageId.value)),
)

const sectionRef = ref(null)
const pinRef = ref(null)
const mainRef = ref(null)
const mediaInnerRef = ref(null)
const mediaLinkRef = ref(null)
const figureRef = ref(null)

const isDesktop = ref(false)
let desktopMediaQuery = null

function syncDesktop() {
  isDesktop.value = desktopMediaQuery?.matches ?? false
}

onMounted(() => {
  if (!import.meta.client) return

  desktopMediaQuery = window.matchMedia('(min-width: 1000px)')
  syncDesktop()
  desktopMediaQuery.addEventListener('change', syncDesktop)
})

onUnmounted(() => {
  desktopMediaQuery?.removeEventListener('change', syncDesktop)
})

const scrollEnabled = computed(() => (
  isDesktop.value
  && hasContent.value
  && Boolean(imageId.value)
))

useFeaturedPostScroll({
  sectionRef,
  pinRef,
  figureRef,
  mainRef,
  mediaInnerRef,
  mediaLinkRef,
  enabled: scrollEnabled,
})
</script>

<style scoped>
.section-featured-post {
  background: var(--section-background);
  color: var(--section-color);
}

.section-featured-post--no-pad-top {
  padding-top: 0;
}

.section-featured-post__pin {
  overflow: visible;
}

.section-featured-post__layout {
  align-items: stretch;
}

.section-featured-post__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(var(--unit) * 4);
  min-height: 100%;
  align-items: center;
  aspect-ratio: 1;
  position: relative;
}
.section-featured-post__media-content {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 3);
}

.section-featured-post__logo-wrap {
  position: relative;
  width: min(80%, 560px);
  margin: 0 auto;
}

.section-featured-post__logo-link {
  display: block;
  position: absolute;
  inset: 0;
}

.section-featured-post__inner {
  position: relative;
  width: 100%;
  display: block;
}

.section-featured-post__link {
  text-align: center;
}

.section-featured-post__link--main {
  text-align: left;
}

.section-featured-post__link :deep(.menu-link) {
  display: inline-block;
  padding: 0;
}

.section-featured-post__link :deep(.menu-link__underline-base) {
  opacity: 0.2;
}


.section-featured-post__main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  max-width: 34rem;
  width: 100%;
}

.section-featured-post__title-trigger {
  appearance: none;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
  text-align: left;
  text-decoration: none;
  width: 100%;
}

.section-featured-post__title {
  margin: 0;
  line-height: 1.15;
}

.section-featured-post__title :deep(em),
.section-featured-post__title :deep(i) {
  font-family: var(--serif);
  font-style: italic;
}

.section-featured-post__title-trigger:hover .section-featured-post__title,
.section-featured-post__title-trigger:focus-visible .section-featured-post__title {
  opacity: 0.75;
  transition: opacity 0.3s ease;
}

.section-featured-post__logo {
  width: 100%;
  height: auto;
  fill: currentColor;
  display: block;
}

.section-featured-post__figure {
  margin: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  z-index: 0;
  will-change: transform;
  z-index: 1;
}

.section-featured-post__image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.section-featured-post__image-container :deep(.app-image) {
  width: 100%;
  height: 100%;
  display: block;
}

.section-featured-post__image-container :deep(.app-image__media) {
  width: 100%;
  height: 100%;
}

.section-featured-post__img {
  width: 100%;
  height: 100%;
}

.section-featured-post__image-container :deep(.app-image__img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

@media (min-width: 1000px) {
  .section-featured-post__main {
    opacity: 1;
  }

  .section-featured-post__inner {
    opacity: 0;
  }

  .section-featured-post__media-content .section-featured-post__link {
    opacity: 0;
  }

  .section-featured-post__title {
    font-size: calc(var(--h3) * 1.15);
  }
}
</style>
