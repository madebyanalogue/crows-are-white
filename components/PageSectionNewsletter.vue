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
const DEFAULT_NEWSLETTER_INTRO = `If this film resonated with you, we'd love to keep in touch.

Receive occasional letters from the filmmakers, screening news, and updates as the journey continues.`
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
  if (isPlaceholderNewsletterIntro(cms)) return DEFAULT_NEWSLETTER_INTRO
  return cms
}

function resolveNewsletterSubmitLabel(section) {
  const cms = section?.newsletterSubmitLabel?.trim()
  return cms || DEFAULT_NEWSLETTER_SUBMIT_LABEL
}

const title = computed(() => resolveNewsletterTitle(props.section))
const intro = computed(() => resolveNewsletterIntro(props.section))
const submitLabel = computed(() => resolveNewsletterSubmitLabel(props.section))

const resolvedTextColor = computed(() => {
  const { newsletterTextColor, newsletterBackgroundColor } = props.section || {}
  if (!newsletterTextColor && !newsletterBackgroundColor) return null
  return resolvePageTextColor(newsletterTextColor, newsletterBackgroundColor)
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

  return {
    imageUrl,
    videoUrl,
    loop: hasCloudflareLoop ? loop.value : null,
    alt: props.section?.newsletterImage?.alt || '',
    textColor: isLightColor(resolvedTextColor.value) ? 'light' : undefined,
    overlayOpacity: Number.isFinite(overlay) ? Math.min(Math.max(overlay, 0), 100) / 100 : 0,
  }
})

const sectionStyle = computed(() => {
  const style = {}

  const backgroundColor = props.section?.newsletterBackgroundColor
  if (backgroundColor) {
    style.background = toCssColor(backgroundColor, DEFAULT_PAGE_COLOR)
  }

  if (resolvedTextColor.value) {
    style.color = toCssColor(resolvedTextColor.value, 'obsidian')
  }

  return style
})

const useWrapper = computed(() => props.section?.newsletterUseWrapper === true)

const innerClass = computed(() => ({
  wrapper: useWrapper.value,
  'page-section-newsletter__inner--contained': useWrapper.value,
}))
</script>

<template>
  <div
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
        :background="background"
      />
    </div>
  </div>
</template>

<style scoped>
.page-section-newsletter__inner--contained {
  padding-block: var(--wrapper-padding);
}

.page-section-newsletter__inner:not(.page-section-newsletter__inner--contained) {
  width: 100%;
}
</style>
