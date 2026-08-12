<script setup>
import cawLogoWideSvg from '~/assets/svg/caw-logo-wide.svg?raw'

defineProps({
  label: {
    type: String,
    default: 'Crows Are White',
  },
})

const logoMarkup = cawLogoWideSvg
  .replace(/<\?xml[^>]*>\s*/i, '')
  .replace(/<svg([^>]*)>/, (_, attrs) => {
    const cleanedAttrs = attrs
      .replace(/\swidth="[^"]*"/g, '')
      .replace(/\sheight="[^"]*"/g, '')

    return `<svg${cleanedAttrs}>`
  })
</script>

<template>
  <div
    class="logo-wide"
    role="img"
    :aria-label="label"
    v-html="logoMarkup"
  />
</template>

<style scoped>
.logo-wide {
  display: flex;
  justify-content: center;
  width: 100%;
  color: var(--text-color, currentColor);
}

.logo-wide :deep(svg) {
  display: block;
  width: min(100%, 460px);
  height: auto;
}

.logo-wide :deep(path),
.logo-wide :deep(polygon),
.logo-wide :deep(rect) {
  stroke: currentColor;
  fill: none;
  stroke-width: 6px;
}
</style>
