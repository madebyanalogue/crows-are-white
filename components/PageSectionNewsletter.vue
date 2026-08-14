<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { toCssColor, resolvePageTextColor, isLightColor, DEFAULT_PAGE_COLOR } from '~/utils/pageColors'
import { resolveSectionLoopVideo } from '~/utils/sectionLoopVideo'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const DEFAULT_NEWSLETTER_TITLE = 'Stay with the Story'
const DEFAULT_NEWSLETTER_SUBMIT_LABEL = 'Stay in Touch'

function isPlaceholderNewsletterTitle(value) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return true
  return /^newsletter$/i.test(normalized)
}

function isPlaceholderNewsletterIntro(value) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return true
  return /^\[(?:work in progress|wip)\]$/i.test(normalized)
}

function resolveNewsletterTitle(section) {
  const cms = section?.newsletterTitle?.trim()
  if (isPlaceholderNewsletterTitle(cms)) return DEFAULT_NEWSLETTER_TITLE
  return cms
}

function resolveNewsletterIntro(section) {
  const cms = section?.newsletterIntro?.trim()
  if (!cms || isPlaceholderNewsletterIntro(cms)) return ''
  return cms
}

function resolveNewsletterSubmitLabel(section) {
  const cms = section?.newsletterSubmitLabel?.trim()
  return cms || DEFAULT_NEWSLETTER_SUBMIT_LABEL
}

const title = computed(() => resolveNewsletterTitle(props.section))
const intro = computed(() => resolveNewsletterIntro(props.section))
const submitLabel = computed(() => resolveNewsletterSubmitLabel(props.section))

const accentColor = computed(() => {
  const color = props.section?.newsletterTextColor
  if (!color) return null
  return toCssColor(color, 'obsidian')
})

const loop = computed(() => {
  if ((props.section?.newsletterMediaType || 'none') !== 'video') return null
  return resolveSectionLoopVideo(props.section, 'newsletter')
})

const background = computed(() => {
  const mediaType = props.section?.newsletterMediaType || 'none'

  const imageUrl = mediaType === 'image'
    ? resolveSanityAssetUrl(props.section?.newsletterImage?.asset)
    : null

  const videoUrl = mediaType === 'video' && loop.value?.kind === 'mp4'
    ? loop.value.url
    : null

  const hasCloudflareLoop = mediaType === 'video' && loop.value?.kind === 'cloudflare'

  if (!imageUrl && !videoUrl && !hasCloudflareLoop) return null

  const overlay = Number(props.section?.newsletterOverlayOpacity)
  const fallbackLightText = !accentColor.value
    && isLightColor(resolvePageTextColor(
      props.section?.newsletterTextColor,
      props.section?.newsletterBackgroundColor,
    ))

  return {
    imageUrl,
    videoUrl,
    loop: hasCloudflareLoop ? loop.value : null,
    alt: props.section?.newsletterImage?.alt || '',
    textColor: fallbackLightText ? 'light' : undefined,
    overlayOpacity: Number.isFinite(overlay) ? Math.min(Math.max(overlay, 0), 100) / 100 : 0,
  }
})

const sectionStyle = computed(() => {
  const style = {}

  const backgroundColor = props.section?.newsletterBackgroundColor
  if (backgroundColor) {
    style.background = toCssColor(backgroundColor, DEFAULT_PAGE_COLOR)
  }

  if (accentColor.value) {
    style.color = accentColor.value
  }

  return style
})

const layout = computed(() => {
  const value = props.section?.newsletterLayout
  if (value === 'split') return 'split'
  if (value === 'map') return 'map'
  return 'overlay'
})

const isMapLayout = computed(() => layout.value === 'map')

const useWrapper = computed(() =>
  props.section?.newsletterUseWrapper === true
  || layout.value === 'split'
  || isMapLayout.value,
)

const innerClass = computed(() => ({
  wrapper: useWrapper.value,
  'page-section-newsletter__inner--contained': useWrapper.value,
}))

const mapBackgroundImage = computed(() => {
  const image = props.section?.newsletterMapBackgroundImage
  const url = resolveSanityAssetUrl(image?.asset)
  if (!url) return null

  return {
    url,
    alt: image?.alt || '',
  }
})

const mapTitle = computed(() => props.section?.newsletterMapTitle?.trim() || '')

const mapLightStyle = computed(() => props.section?.newsletterMapLightStyle === true)

const mapZoomControls = computed(() => props.section?.newsletterMapZoomControls === true)

const sectionId = computed(() => {
  const raw = props.section?.newsletterSectionId?.trim().replace(/^#/, '') || 'newsletter'
  return raw || 'newsletter'
})

const { items: reflectionItems } = useReflections(500)
</script>

<template>
  <div
    :id="sectionId"
    class="page-section-newsletter"
    :style="sectionStyle"
  >
    <div
      class="page-section-newsletter__inner"
      :class="innerClass"
    >
      <NewsletterBlock
        :title="title"
        :intro="intro"
        :submit-label="submitLabel"
        :accent-color="accentColor"
        :background="background"
        :layout="layout"
      >
        <template
          v-if="isMapLayout"
          #map
        >
          <WatchingFromSection
            compact
            :items="reflectionItems"
            :title="mapTitle"
            :map-background-image="mapBackgroundImage"
            :map-light-style="mapLightStyle"
            :show-map-zoom-controls="mapZoomControls"
            map-posts-layout="below"
          />
        </template>
      </NewsletterBlock>
    </div>
  </div>
</template>

<style scoped>
.page-section-newsletter__inner--contained {
  padding-block: var(--wrapper-padding);
}

@media (max-width: 999px) {
  .page-section-newsletter__inner--contained {
    padding-block: var(--wrapper-padding);
    padding-left: 0;
    padding-right: 0;
  }
}

.page-section-newsletter__inner:not(.page-section-newsletter__inner--contained) {
  width: 100%;
}
</style>
