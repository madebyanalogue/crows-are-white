<script setup>
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'
import { resolveSanityAssetUrl } from '~/utils/sanity'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const {
  getMenuItemUrl,
  getMenuItemTarget,
  getMenuItemRel,
  isExternalUrl,
  isSamePageLink,
  isSamePageHref,
  getUrlHash,
  scrollToTop,
  scrollToHash,
} = useMenuLinks()

const sectionRef = ref(null)
const parallaxRef = ref(null)

const loop = computed(() => resolveSectionLoopVideo(props.section, 'letterbox'))

const mediaType = computed(() =>
  props.section?.letterboxMediaType === 'image' ? 'image' : 'video',
)

const mainImageUrl = computed(() =>
  mediaType.value === 'image'
    ? resolveSanityAssetUrl(props.section?.letterboxImage?.asset) || ''
    : '',
)

const mainImageAlt = computed(() =>
  props.section?.letterboxImage?.alt?.trim() || '',
)

const hasImage = computed(() => Boolean(mainImageUrl.value))

const hasVideo = computed(() => mediaType.value === 'video' && Boolean(
  loop.value?.url720
  || loop.value?.url
  || loop.value?.youtubeId,
))

const hasMedia = computed(() => hasVideo.value || hasImage.value)

const usesNaturalShape = computed(() => {
  const ratio = props.section?.letterboxAspectRatio
  return ratio === 'natural'
})

const mediaDimensions = ref(null)

const resolvedMediaDimensions = computed(() => {
  const runtime = mediaDimensions.value
  if (runtime?.width && runtime?.height) return runtime

  if (mediaType.value === 'image') {
    const dims = props.section?.letterboxImage?.asset?.metadata?.dimensions
    if (dims?.width && dims?.height) {
      return { width: dims.width, height: dims.height }
    }
  }

  const width = loop.value?.width
  const height = loop.value?.height
  if (width && height) return { width, height }

  return null
})

const hasNaturalShape = computed(() =>
  usesNaturalShape.value && Boolean(resolvedMediaDimensions.value),
)

const videoFit = computed(() =>
  props.section?.letterboxVideoFit === 'contain' ? 'contain' : 'cover',
)

const parallaxEnabled = computed(() => props.section?.letterboxParallax !== false)

const useWrapper = computed(() => props.section?.letterboxUseWrapper === true)

const useViewportMinHeight = computed(() => props.section?.letterboxMinHeightViewport === true)

const videoWidth = computed(() => {
  const value = props.section?.letterboxVideoWidth
  if (!value || value === '100') return '100%'
  return `${value}%`
})

const hasCustomWidth = computed(() => videoWidth.value !== '100%')

const videoAlignClass = computed(() => {
  const align = props.section?.letterboxVideoAlign
  if (align === 'left') return 'is-align-left'
  if (align === 'right') return 'is-align-right'
  return 'is-align-center'
})

const videoVerticalAlignClass = computed(() => {
  const align = props.section?.letterboxVideoVerticalAlign
  if (align === 'top') return 'is-valign-top'
  if (align === 'bottom') return 'is-valign-bottom'
  return 'is-valign-center'
})

const usesStaticMediaLayer = computed(() =>
  !parallaxEnabled.value || videoFit.value === 'contain',
)

const overlayImageUrl = computed(() =>
  resolveSanityAssetUrl(props.section?.letterboxOverlayImage?.asset) || '',
)

const overlayImageAlt = computed(() =>
  props.section?.letterboxOverlayImage?.alt?.trim() || '',
)

const hasOverlayImage = computed(() => Boolean(overlayImageUrl.value))

function onMediaDimensions(dimensions) {
  if (!dimensions?.width || !dimensions?.height) return
  mediaDimensions.value = dimensions
}

function onImageLoad(event) {
  onMediaDimensions({
    width: event.target.naturalWidth,
    height: event.target.naturalHeight,
  })
}

const overlayLink = computed(() => {
  const label = props.section?.letterboxLinkText?.trim()
  const link = props.section?.letterboxLink
  if (!label || !link) return null

  const menuItem = {
    text: label,
    link: {
      type: link.type,
      page: link.page,
      url: link.url,
    },
  }

  const href = getMenuItemUrl(menuItem)
  if (!href || href === '#') return null

  const target = getMenuItemTarget(menuItem)
  const useRouterLink = target !== '_blank'
    && !href.startsWith('mailto:')
    && !href.startsWith('tel:')
    && !isExternalUrl(href)

  return {
    label,
    href,
    target,
    rel: getMenuItemRel(menuItem),
    useRouterLink,
    menuItem,
  }
})

function onLinkClick(event) {
  const link = overlayLink.value
  if (!link?.useRouterLink) return

  const { href, menuItem } = link
  const hash = getUrlHash(href)

  if (href.startsWith('#')) {
    event.preventDefault()
    scrollToHash(href)
    return
  }

  if (hash && isSamePageHref(href)) {
    event.preventDefault()
    scrollToHash(hash)
    return
  }

  if (isSamePageLink(menuItem)) {
    event.preventDefault()
    scrollToTop()
  }
}

const sectionStyle = computed(() => {
  if (!hasNaturalShape.value || hasCustomWidth.value) return undefined

  const dims = resolvedMediaDimensions.value
  return {
    aspectRatio: `${dims.width} / ${dims.height}`,
  }
})

const frameStyle = computed(() => {
  const style = { width: videoWidth.value }

  if (hasNaturalShape.value && hasCustomWidth.value) {
    const dims = resolvedMediaDimensions.value
    style.aspectRatio = `${dims.width} / ${dims.height}`
  }

  return style
})

useVideoParallax(sectionRef, parallaxRef, {
  speed: 0.22,
  disabled: computed(() => !parallaxEnabled.value),
})
</script>

<template>
  <section
    v-if="hasMedia"
    ref="sectionRef"
    class="page-section-letterbox-video"
    :class="{
      'is-natural-shape': hasNaturalShape,
      'is-contained': videoFit === 'contain',
      'is-parallax-disabled': !parallaxEnabled,
      'is-wrapped': useWrapper,
      'is-image': hasImage,
      'is-viewport-min-height': useViewportMinHeight,
    }"
    :style="sectionStyle"
    :aria-label="hasImage ? 'Image' : 'Video'"
  >
    <div
      class="page-section-letterbox-video__container"
      :class="[
        videoAlignClass,
        videoVerticalAlignClass,
        { wrapper: useWrapper },
      ]"
    >
      <div
        class="page-section-letterbox-video__frame"
        :class="{ 'is-natural-shape': hasNaturalShape }"
        :style="frameStyle"
      >
        <div
          ref="parallaxRef"
          class="page-section-letterbox-video__parallax"
          :class="{ 'is-static': usesStaticMediaLayer }"
        >
          <SectionLoopVideo
            v-if="hasVideo"
            :loop="loop"
            title="Letterbox video"
            aspect-class="page-section-letterbox-video__video"
            :object-fit="videoFit"
            @media-dimensions="onMediaDimensions"
          />
          <img
            v-else-if="hasImage"
            class="page-section-letterbox-video__image"
            :src="mainImageUrl"
            :alt="mainImageAlt"
            draggable="false"
            loading="lazy"
            @load="onImageLoad"
          >
        </div>

        <img
          v-if="hasOverlayImage"
          class="page-section-letterbox-video__overlay"
          :src="overlayImageUrl"
          :alt="overlayImageAlt"
          draggable="false"
          loading="lazy"
        >

        <div
          v-if="overlayLink"
          class="page-section-letterbox-video__link-wrap"
        >
          <NuxtLink
            v-if="overlayLink.useRouterLink"
            :to="overlayLink.href"
            class="page-section-letterbox-video__link large-title"
            @click="onLinkClick"
          >
            {{ overlayLink.label }}
          </NuxtLink>
          <a
            v-else
            :href="overlayLink.href"
            class="page-section-letterbox-video__link large-title"
            :target="overlayLink.target"
            :rel="overlayLink.rel"
          >
            {{ overlayLink.label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-section-letterbox-video {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 2.5;
  min-height: 500px;
  overflow: hidden;
}

.page-section-letterbox-video.is-viewport-min-height {
  min-height: 100dvh;
}

.page-section-letterbox-video.is-natural-shape:not(.is-viewport-min-height),
.page-section-letterbox-video.is-wrapped:not(.is-viewport-min-height) {
  aspect-ratio: auto;
  min-height: 0;
  height: auto;
}

.page-section-letterbox-video.is-natural-shape.is-viewport-min-height,
.page-section-letterbox-video.is-wrapped.is-viewport-min-height {
  aspect-ratio: auto;
  height: auto;
}

.page-section-letterbox-video__container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: inherit;
}

.page-section-letterbox-video__container.is-valign-top {
  align-items: flex-start;
}

.page-section-letterbox-video__container.is-valign-bottom {
  align-items: flex-end;
}

.page-section-letterbox-video__container.is-align-left {
  justify-content: flex-start;
}

.page-section-letterbox-video__container.is-align-right {
  justify-content: flex-end;
}

.page-section-letterbox-video__frame {
  position: relative;
  width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  overflow: hidden;
}

.page-section-letterbox-video__frame.is-natural-shape {
  aspect-ratio: auto;
  height: auto;
  max-height: none;
}

.page-section-letterbox-video__parallax {
  position: absolute;
  left: 0;
  width: 100%;
  top: -7.5%;
  height: 115%;
  will-change: transform;
}

.page-section-letterbox-video__parallax.is-static,
.page-section-letterbox-video.is-natural-shape .page-section-letterbox-video__parallax {
  position: absolute;
  inset: 0;
  top: 0;
  height: 100%;
}

.page-section-letterbox-video :deep(.section-loop-video) {
  background: transparent;
}

.page-section-letterbox-video__parallax :deep(.section-loop-video__el) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-section-letterbox-video.is-contained :deep(.section-loop-video__el) {
  object-fit: contain;
}

.page-section-letterbox-video__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-section-letterbox-video.is-contained .page-section-letterbox-video__image {
  object-fit: contain;
}

.page-section-letterbox-video__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.page-section-letterbox-video__link-wrap {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem clamp(1.25rem, 6vw, 30px);
  pointer-events: none;
}

.page-section-letterbox-video__link {
  display: inline-flex;
  pointer-events: auto;
  padding: 0.25em 0.7em 0.33em;
  border: 3px double var(--screenings-ink);
  border-radius: 10px;
  corner-shape: notch;
  text-align: center;
  text-decoration: none;
  color: var(--screenings-ink);
  background: var(--background-color);
  transition: color 0.2s ease;
}

.page-section-letterbox-video__link:hover {
  color: var(--menu-highlight-color, var(--arancio));
}

.page-section-letterbox-video__link:focus-visible {
  outline: 2px solid var(--menu-highlight-color, var(--arancio));
  outline-offset: 4px;
}
</style>
