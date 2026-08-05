<template>
  <section
    v-if="hasContent"
    class="section-inline-video"
    :style="sectionPaddingStyle"
  >
    <div class="wrapper">
      <div
        class="section-inline-video__layout grid-1 grid-md-2 gap-6 gap-sm-10 gap-md-0"
        :class="{
          'section-inline-video__layout--video-only': !hasTextContent,
          'section-inline-video__layout--reversed': reverseOrder,
        }"
      >
        <figure
          v-if="hasVideoPlayer"
          class="section-inline-video__figure"
        >
          <div class="section-inline-video__video-container">
            <MiniVideoPlayer
              :video-url="videoUrl"
              :loop-clip-url="previewVideoUrl"
              :preview-image="posterUrl"
            />
            <figcaption
              v-if="caption"
              class="section-inline-video__caption caption"
            >
              {{ caption }}
            </figcaption>
          </div>
        </figure>

        <div
          v-if="hasTextContent"
          class="section-inline-video__content pad-sm-4 pad-md-8"
        >
          <div class="section-inline-video__inner">
            <h2
              v-if="titleBlocks.length"
              class="section-inline-video__title"
              :class="[titleSizeClass, { serif: titleSizeClass !== 'h4' }]"
            >
              <SanityInline :blocks="titleBlocks" />
            </h2>

            <div
              v-if="descriptionBlocks.length"
              class="section-inline-video__body"
            >
              <SanityContent
                :blocks="descriptionBlocks"
                class="section-inline-video__description"
                :class="{ 'max-text-block-width': hasVideoPlayer }"
              />
            </div>

            <nav
              v-if="links.length"
              class="section-inline-video__links"
              aria-label="Calls to action"
            >
              <MenuLink
                v-for="link in links"
                :key="link._key"
                :item="toMenuItem(link)"
                arrow-variant="scale"
              />
            </nav>
            
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const titleBlocks = computed(() => props.section?.inlineVideoTitle ?? [])
const descriptionBlocks = computed(() => props.section?.inlineVideoDescription ?? [])
const links = computed(() => {
  const repeaterLinks = props.section?.inlineVideoLinks ?? []
  if (repeaterLinks.length) {
    return repeaterLinks
  }

  if (!props.section?.inlineVideoLinkText || !props.section?.inlineVideoLink?.type) {
    return []
  }

  return [{
    _key: 'legacy-inline-video-link',
    linkTitle: props.section.inlineVideoLinkText,
    type: props.section.inlineVideoLink.type,
    page: props.section.inlineVideoLink.page,
    url: props.section.inlineVideoLink.url,
  }]
})
const caption = computed(() => props.section?.inlineVideoCaption ?? '')
const reverseOrder = computed(() => props.section?.inlineVideoReverseOrder === true)
const titleSizeClass = computed(() => (
  props.section?.inlineVideoTitleSize === 'h4' ? 'h4' : 'h3'
))

const SECTION_PADDING_VALUES = {
  none: '0',
  small: 'var(--section-padding-small)',
  large: 'var(--section-padding)',
  xlarge: 'calc(var(--section-padding) * 1.5)',
}

function resolveSectionPadding(value, side) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }

  if (side === 'top' && value === false) {
    return 'none'
  }

  return 'large'
}

const sectionPaddingStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.inlineVideoPaddingTop, 'top')],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.inlineVideoPaddingBottom, 'bottom')],
}))

const videoUrl = computed(() => props.section?.inlineVideoFile?.asset?.url ?? '')
const previewVideoUrl = computed(() => props.section?.inlineVideoPreviewFile?.asset?.url ?? '')
const posterUrl = computed(() => props.section?.inlineVideoPoster?.asset?.url ?? '')

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

const hasTextContent = computed(
  () => titleBlocks.value.length > 0
    || descriptionBlocks.value.length > 0
    || links.value.length > 0,
)
const hasVideoPlayer = computed(
  () => Boolean(videoUrl.value || previewVideoUrl.value || posterUrl.value),
)
const hasContent = computed(() => hasTextContent.value || hasVideoPlayer.value)
</script>

<style scoped>


.section-inline-video__layout {
  align-items: stretch;
}

.section-inline-video__figure {
  display: flex;
  flex-direction: column;
  gap: var(--caption-gap);
  margin: 0;
  width: 100%;
  align-items: end;
  text-align: left;
}

.section-inline-video__video-container {
  display: flex;
  flex-direction: column;
  gap: var(--caption-gap);
  margin: 0;
  width: 100%;
  align-items: start;
  text-align: left;
}
@media (min-width: 1000px) {
.section-inline-video__video-container {
width: 90%;
}
}

.section-inline-video__caption {
  margin: 0;
}

.section-inline-video__content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.section-inline-video__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--unit) * 2);
  width: 100%;
  max-width: var(--max-text-block-width);
}

.section-inline-video__title {
  margin: 0;
  max-width: var(--max-text-block-width);
  line-height: 1.25;
}

.section-inline-video__links {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
}

.section-inline-video__links:has(.menu-link:hover) :deep(.menu-link) {
  opacity: 0.2;
}

.section-inline-video__links:has(.menu-link:hover) :deep(.menu-link:hover) {
  opacity: 1;
}

.section-inline-video__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--unit) * 2);
  width: 100%;
  max-width: var(--max-text-block-width);
}

.section-inline-video__title,
.section-inline-video__description {
  width: 100%;
}

.section-inline-video__layout--video-only {
  grid-template-columns: 1fr;
  justify-items: center;
}

.section-inline-video__layout--video-only .section-inline-video__inner {
  max-width: 800px;
}

@media (min-width: 1000px) {
  .section-inline-video__layout:not(.section-inline-video__layout--reversed) .section-inline-video__content {
    order: 1;
  }

  .section-inline-video__layout:not(.section-inline-video__layout--reversed) .section-inline-video__figure {
    order: 2;
  }
}
</style>
