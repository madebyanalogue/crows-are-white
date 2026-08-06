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

const title = computed(() => props.section?.newsletterTitle?.trim() || 'Newsletter')

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
</script>

<template>
  <div
    class="page-section-newsletter"
    :style="sectionStyle"
  >
    <NewsletterBlock
      :title="title"
      :background="background"
    />
  </div>
</template>

