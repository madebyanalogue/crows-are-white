<script setup>
import instagramIcon from '~/assets/svg/social-instagram.svg?raw'
import youtubeIcon from '~/assets/svg/social-youtube.svg?raw'
import xIcon from '~/assets/svg/social-x.svg?raw'
import tiktokIcon from '~/assets/svg/social-tiktok.svg?raw'

const props = defineProps({
  platform: {
    type: String,
    required: true,
  },
})

const ICONS = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  twitter: xIcon,
  tiktok: tiktokIcon,
}

const normalizedPlatform = computed(() => props.platform?.trim().toLowerCase() || '')

function normalizeSvg(raw) {
  return raw
    .replace(/<\?xml[^>]*>\s*/i, '')
    .replace(/<svg([^>]*)>/, (_, attrs) => {
      const cleanedAttrs = attrs
        .replace(/\swidth="[^"]*"/g, '')
        .replace(/\sheight="[^"]*"/g, '')

      return `<svg${cleanedAttrs}>`
    })
}

const iconMarkup = computed(() => {
  const raw = ICONS[normalizedPlatform.value]
  return raw ? normalizeSvg(raw) : ''
})
</script>

<template>
  <span
    v-if="iconMarkup"
    class="social-icon"
    :class="`social-icon--${normalizedPlatform}`"
    aria-hidden="true"
    v-html="iconMarkup"
  />
</template>

<style scoped>
.social-icon {
  display: block;
  flex-shrink: 0;
}

.social-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
