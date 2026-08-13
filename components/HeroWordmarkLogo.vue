<script setup>
import heroLogoSvg from '~/assets/svg/logo-16-9.svg?raw'

defineProps({
  label: {
    type: String,
    default: 'Crows Are White',
  },
})

const heroLogoMarkup = heroLogoSvg.replace(
  /<svg([^>]*)>/,
  '<svg$1 preserveAspectRatio="xMidYMid slice">',
)
</script>

<template>
  <div
    class="hero-wordmark-logo"
    role="img"
    :aria-label="label"
    v-html="heroLogoMarkup"
  />
</template>

<style scoped>
.hero-wordmark-logo {
  display: block;
  width: 100%;
  height: 100%;
  color: var(--hero-feature-color, currentColor);
}

.hero-wordmark-logo :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-wordmark-logo :deep(path) {
  fill: currentColor;
}
</style>
