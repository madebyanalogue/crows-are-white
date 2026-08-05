<template>
  <section
    v-if="hasContent"
    class="section-text-and-image"
    :class="{ 'section-text-and-image--has-brand-logo': hasBrandLogo }"
    :style="sectionPaddingStyle"
  >
    <div
      ref="wrapperRef"
      class="wrapper section-text-and-image__wrapper"
      :class="brandLogoBottomPaddingClass"
    >
      
      <div
        class="section-text-and-image__layout grid-1 grid-md-2 gap-6 gap-sm-10 gap-md-0"
        :class="{
          'section-text-and-image__layout--text-only': !imageId,
          'section-text-and-image__layout--reversed': reverseOrder,
        }"
      >
        <figure
          v-if="imageId"
          class="section-text-and-image__figure"
        >
          <div
            ref="imageContainerRef"
            class="section-text-and-image__image-container"
            :class="{
              'section-text-and-image__image-container--auto': !resolvedImageAspectRatio,
              'section-text-and-image__image-container--with-pattern': hasInlineSidePattern,
            }"
            :style="imageContainerStyle"
          >
            <AppImage
              :src="imageId"
              :width="imageWidth"
              :height="imageHeight"
              :alt="imageAlt"
              :overlay="imageOverlay"
              :pattern-inline="hasInlineSidePattern"
              :pattern-width="imagePatternWidth"
              class="section-text-and-image__img"
              sizes="half"
            />
          </div>
          <figcaption
            v-if="caption"
            class="section-text-and-image__caption caption"
          >
            {{ caption }}
          </figcaption>
        </figure>

        <div
          v-if="hasTextContent"
          ref="textContentRef"
          class="section-text-and-image__content pad-0 pad-sm-4 pad-md-8 pad-top-bottom-xs"
          :style="contentHeightStyle"
        >
          <div
            class="section-text-and-image__inner"
            :class="{ 'section-text-and-image__inner--center': titleCenter }"
          >
            <h2
              v-if="titleBlocks.length"
              class="section-text-and-image__title"
              :class="[titleSizeClass, { serif: titleSizeClass !== 'h4', 'section-text-and-image__title--center': titleCenter }]"
            >
              <SanityInline :blocks="titleBlocks" />
            </h2>

            <div
              v-if="hasBodyContent"
              class="section-text-and-image__body"
              :class="{ 'section-text-and-image__body--center': descriptionCenter }"
            >
              <SanityContent
                v-if="descriptionBlocks.length"
                :blocks="descriptionBlocks"
                class="section-text-and-image__description"
                :class="{ 'max-text-block-width': Boolean(imageId) }"
              />

              <MenuLink
                v-if="hasLink"
                :item="menuItem"
                :show-arrow="false"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="hasBrandLogo"
        class="section-text-and-image__brand-logo"
        :class="{ 'section-text-and-image__brand-logo--centered': brandLogoCentered }"
        :style="brandLogoStyle"
        aria-hidden="true"
      >
        <AppImage
          :src="brandLogoId"
          :width="brandLogoWidth"
          :height="brandLogoHeight"
          alt=""
          class="section-text-and-image__brand-logo-img"
          sizes="full"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'
import { isAppImagePattern, isOverlayAppImagePattern } from '~/utils/appImagePatterns'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { whatsappUrl } = useSiteSettings()
const { getMenuItemUrl } = useMenuLinks()

const titleBlocks = computed(() => props.section?.textAndImageTitle ?? [])
const descriptionBlocks = computed(() => props.section?.textAndImageDescription ?? [])
const caption = computed(() => props.section?.textAndImageCaption?.trim() || '')

const image = computed(() => props.section?.textAndImageImage ?? null)
const imageId = computed(() => image.value?.asset?._id || '')
const imageWidth = computed(() => image.value?.asset?.metadata?.dimensions?.width)
const imageHeight = computed(() => image.value?.asset?.metadata?.dimensions?.height)

const imageOverlay = computed(() => {
  const value = props.section?.textAndImagePattern
  return isAppImagePattern(value) ? value : null
})
const hasImagePattern = computed(() => Boolean(imageOverlay.value))
const hasInlineSidePattern = computed(() => (
  hasImagePattern.value && !isOverlayAppImagePattern(imageOverlay.value)
))
const imagePatternWidth = computed(() => (
  imageOverlay.value === 'apr' ? '45%' : undefined
))

const imageAlt = computed(() => {
  const alt = image.value?.alt
  if (typeof alt === 'string' && alt.trim()) return alt.trim()
  if (caption.value) return caption.value
  const titleText = titleBlocks.value
    .flatMap((block) => block.children?.map((child) => child.text).join('') || '')
    .join(' ')
    .trim()
  return titleText || 'Image'
})

const hasImageAspectRatio = computed(() => {
  const width = imageWidth.value
  const height = imageHeight.value
  return width > 0 && height > 0
})

const customImageAspectRatio = computed(() => {
  const raw = props.section?.textAndImageImageRatio
  if (typeof raw !== 'string') return null

  const normalized = raw.trim()
  if (!normalized) return null

  const decimal = Number(normalized)
  if (Number.isFinite(decimal) && decimal > 0) {
    return String(decimal)
  }

  const slashMatch = normalized.match(/^([0-9]*\.?[0-9]+)\s*\/\s*([0-9]*\.?[0-9]+)$/)
  if (!slashMatch) return null

  const numerator = Number(slashMatch[1])
  const denominator = Number(slashMatch[2])
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || numerator <= 0 || denominator <= 0) {
    return null
  }

  return `${numerator} / ${denominator}`
})

const resolvedImageAspectRatio = computed(() => {
  if (customImageAspectRatio.value) return customImageAspectRatio.value
  if (!hasImageAspectRatio.value) return null
  return `${imageWidth.value} / ${imageHeight.value}`
})

const imageContainerStyle = computed(() => {
  if (!resolvedImageAspectRatio.value) return undefined

  if (hasInlineSidePattern.value) {
    return { '--section-text-and-image-media-aspect-ratio': resolvedImageAspectRatio.value }
  }

  return { aspectRatio: resolvedImageAspectRatio.value }
})

const menuItem = computed(() => ({
  text: props.section?.textAndImageLinkText,
  link: props.section?.textAndImageLink,
  isButton: true,
}))

const hasLink = computed(() => {
  if (!props.section?.textAndImageLinkText || !props.section?.textAndImageLink?.type) {
    return false
  }
  if (props.section.textAndImageLink.type === 'whatsapp') {
    return Boolean(whatsappUrl.value)
  }

  const href = getMenuItemUrl(menuItem.value)
  return Boolean(href && href !== '#')
})

const hasTextContent = computed(
  () => titleBlocks.value.length > 0
    || descriptionBlocks.value.length > 0
    || hasLink.value,
)

const titleCenter = computed(() => props.section?.textAndImageTitleCenter === true)
const titleSizeClass = computed(() => (
  props.section?.textAndImageTitleSize === 'h4' ? 'h4' : 'h3'
))
const descriptionCenter = computed(() => props.section?.textAndImageDescriptionCenter === true)
const reverseOrder = computed(() => props.section?.textAndImageReverseOrder === true)

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

  const legacyPaddingTop = props.section?.textAndImagePaddingTop
  const legacySmallPadding = props.section?.textAndImageSmallSectionPadding === true

  if (side === 'top') {
    if (legacyPaddingTop === false) return 'none'
    if (legacySmallPadding) return 'small'
    return 'large'
  }

  if (legacySmallPadding) return 'small'
  return 'large'
}

const sectionPaddingStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.textAndImagePaddingTop, 'top')],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.textAndImagePaddingBottom, 'bottom')],
}))

const contentHeightStyle = computed(() => {
  const raw = props.section?.textAndImageContentHeight
  if (raw === '' || raw == null) return undefined

  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0 || value > 100 || value === 100) {
    return undefined
  }

  return { height: `${value}%` }
})

const brandLogo = computed(() => props.section?.textAndImageBrandLogo ?? null)
const brandLogoId = computed(() => brandLogo.value?.asset?._id || '')
const brandLogoWidth = computed(() => brandLogo.value?.asset?.metadata?.dimensions?.width)
const brandLogoHeight = computed(() => brandLogo.value?.asset?.metadata?.dimensions?.height)
const hasBrandLogo = computed(() => Boolean(brandLogoId.value))

const brandLogoWidthPercent = computed(() => {
  const value = Number(props.section?.textAndImageBrandLogoWidth)
  if (Number.isFinite(value) && value >= 0 && value <= 100) {
    return value
  }
  return 100
})

const brandLogoRightOffset = computed(() => {
  const value = props.section?.textAndImageBrandLogoRightOffset
  if (value === '' || value == null) return null
  const offset = Number(value)
  if (Number.isFinite(offset) && offset >= -50 && offset <= 100) {
    return offset
  }
  return null
})

const brandLogoCentered = computed(() => brandLogoRightOffset.value === null)

function resolveBrandLogoBottomOffset(value) {
  if (value === '' || value == null) return 0
  const offset = Number(value)
  if (Number.isFinite(offset) && offset >= -50 && offset <= 50) {
    return offset
  }
  return 0
}

const brandLogoImageBottomOffset = computed(() => (
  resolveBrandLogoBottomOffset(props.section?.textAndImageBrandLogoImageBottomOffset)
))

const brandLogoTextBottomOffset = computed(() => (
  resolveBrandLogoBottomOffset(props.section?.textAndImageBrandLogoTextBottomOffset)
))

const brandLogoImageBottomOffsetCss = computed(() => (
  imageId.value && brandLogoImageBottomOffset.value !== 0
    ? `${brandLogoImageBottomOffset.value}%`
    : '0%'
))

const brandLogoTextBottomOffsetCss = computed(() => (
  hasTextContent.value && brandLogoTextBottomOffset.value !== 0
    ? `${brandLogoTextBottomOffset.value}%`
    : '0%'
))

const BRAND_LOGO_BOTTOM_PADDING_OFFSETS = {
  small: 3,
  medium: 6,
  large: 9,
  xlarge: 12,
}

const brandLogoBottomExtra = computed(() => {
  const multiplier = BRAND_LOGO_BOTTOM_PADDING_OFFSETS[props.section?.textAndImageBrandLogoBottomPadding]
  return multiplier ? `calc(var(--unit) * ${multiplier})` : '0px'
})

const wrapperRef = ref(null)
const imageContainerRef = ref(null)
const textContentRef = ref(null)
const brandLogoBottomPx = ref(0)

const updateBrandLogoBottom = () => {
  if (!import.meta.client || !wrapperRef.value) {
    brandLogoBottomPx.value = 0
    return
  }

  const anchorEl = imageContainerRef.value || textContentRef.value
  if (!anchorEl) {
    brandLogoBottomPx.value = 0
    return
  }

  const wrapperRect = wrapperRef.value.getBoundingClientRect()
  const anchorRect = anchorEl.getBoundingClientRect()
  brandLogoBottomPx.value = Math.max(0, Math.round(wrapperRect.bottom - anchorRect.bottom))
}

let brandLogoResizeObserver

const observeBrandLogoAnchors = () => {
  if (!import.meta.client || typeof ResizeObserver === 'undefined') return

  if (!brandLogoResizeObserver) {
    brandLogoResizeObserver = new ResizeObserver(() => {
      updateBrandLogoBottom()
    })
  }

  brandLogoResizeObserver.disconnect()

  if (wrapperRef.value) {
    brandLogoResizeObserver.observe(wrapperRef.value)
  }

  if (imageContainerRef.value) {
    brandLogoResizeObserver.observe(imageContainerRef.value)
  }

  if (textContentRef.value) {
    brandLogoResizeObserver.observe(textContentRef.value)
  }

  updateBrandLogoBottom()
}

onMounted(() => {
  observeBrandLogoAnchors()
})

onUnmounted(() => {
  brandLogoResizeObserver?.disconnect()
})

watch([imageId, caption, hasBrandLogo, hasTextContent], async () => {
  await nextTick()
  observeBrandLogoAnchors()
})

const brandLogoStyle = computed(() => {
  const style = {
    '--brand-logo-width': `${brandLogoWidthPercent.value}%`,
    '--brand-logo-bottom': `${brandLogoBottomPx.value}px`,
    '--brand-logo-bottom-extra': brandLogoBottomExtra.value,
    '--brand-logo-image-bottom-offset': brandLogoImageBottomOffsetCss.value,
    '--brand-logo-text-bottom-offset': brandLogoTextBottomOffsetCss.value,
  }

  if (brandLogoRightOffset.value !== null) {
    style.right = `${brandLogoRightOffset.value}%`
  }

  return style
})

const BRAND_LOGO_BOTTOM_PADDING_CLASSES = {
  small: 'section-text-and-image__wrapper--brand-bottom-pad-small',
  medium: 'section-text-and-image__wrapper--brand-bottom-pad-medium',
  large: 'section-text-and-image__wrapper--brand-bottom-pad-large',
  xlarge: 'section-text-and-image__wrapper--brand-bottom-pad-xlarge',
}

const brandLogoBottomPaddingClass = computed(() => {
  if (!hasBrandLogo.value) return ''
  const value = props.section?.textAndImageBrandLogoBottomPadding
  return BRAND_LOGO_BOTTOM_PADDING_CLASSES[value] || ''
})

const hasContent = computed(
  () => Boolean(imageId.value) || hasTextContent.value || hasBrandLogo.value,
)

const hasBodyContent = computed(
  () => descriptionBlocks.value.length > 0 || hasLink.value,
)
</script>

<style scoped>

.section-text-and-image__wrapper {
  position: relative;
}

.section-text-and-image__brand-logo {
  z-index:0;
}

.section-text-and-image__brand-logo {
  position: absolute;
  bottom: calc(
    var(--brand-logo-bottom, 0px)
    - var(--brand-logo-bottom-extra, 0px)
    - var(--brand-logo-image-bottom-offset, 0%)
    - var(--brand-logo-text-bottom-offset, 0%)
  );
  z-index: 0;
  width: var(--brand-logo-width, 100%);
  pointer-events: none;
}

.section-text-and-image__brand-logo--centered {
  left: 50%;
  transform: translateX(-50%);
}

.section-text-and-image__brand-logo-img {
  width: 100%;
  height: auto;
  display: block;
}

.section-text-and-image__brand-logo :deep(.app-image__img) {
  width: 100%;
  height: auto;
  display: block;
}

.section-text-and-image__wrapper--brand-bottom-pad-small {
  padding-bottom: calc(var(--unit) * 3);
}

.section-text-and-image__wrapper--brand-bottom-pad-medium {
  padding-bottom: calc(var(--unit) * 6);
}

.section-text-and-image__wrapper--brand-bottom-pad-large {
  padding-bottom: calc(var(--unit) * 9);
}

.section-text-and-image__wrapper--brand-bottom-pad-xlarge {
  padding-bottom: calc(var(--unit) * 12);
}

.section-text-and-image__layout--text-only {
  --max-text-block-width: 650px;
}

.section-text-and-image__layout {
  position: relative;
  z-index: 1;
  align-items: stretch;
}

.section-text-and-image__figure {
  display: flex;
  flex-direction: column;
  gap: var(--caption-gap);
  margin: 0;
  width: 100%;
}

.section-text-and-image__image-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: normal;
}
.section-text-and-image__image-container .app-image {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.section-text-and-image__image-container:not(.section-text-and-image__image-container--with-pattern) {
  overflow: hidden;
}

.section-text-and-image__image-container:not(.section-text-and-image__image-container--with-pattern) :deep(.app-image__media) {
  width: 100%;
  height: 100%;
}

.section-text-and-image__image-container--with-pattern :deep(.app-image__media) {
  aspect-ratio: var(--section-text-and-image-media-aspect-ratio);
  flex: 1;
  min-width: 0;
  height: auto;
}

.section-text-and-image__img {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  inset: 0;
  object-fit: cover;
  object-position: center;
}

.section-text-and-image__image-container :deep(.app-image__img) {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.section-text-and-image__image-container--auto .section-text-and-image__img {
  position: static;
  height: auto;
}

.section-text-and-image__caption {
  margin: 0;
}

.section-text-and-image__content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.section-text-and-image__layout--text-only {
  grid-template-columns: 1fr;
  justify-items: center;
}

.section-text-and-image__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--unit) * 2);
  width: 100%;
  max-width: var(--max-text-block-width);
}

.section-text-and-image__title {
  max-width: var(--max-text-block-width);
}
.section-text-and-image__layout--text-only .section-text-and-image__inner {
  max-width: 800px;
}

.section-text-and-image__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--unit) * 2);
  width: 100%;
  max-width: var(--max-text-block-width);
}

.section-text-and-image__title,
.section-text-and-image__description {
  width: 100%;
}

@media (min-width: 700px) {
  .section-text-and-image__inner--center {
    align-items: center;
  }

  .section-text-and-image__title--center {
    text-align: center;
  }

  .section-text-and-image__body--center {
    align-items: center;
    text-align: center;
  }
}

@media (min-width: 1000px) {
  .section-text-and-image__layout--reversed .section-text-and-image__content {
    order: 1;
    padding: calc(var(--unit) * 8) calc(var(--unit) * 10) calc(var(--unit) * 8) calc(var(--unit) * 5);
  }

  .section-text-and-image__layout--reversed .section-text-and-image__figure {
    order: 2;
  }
}

@media (max-width: 999px) {
.section-text-and-image__brand-logo {
 display: none;
}
}
</style>
