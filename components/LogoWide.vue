<script setup>
import cawLogoWideSvg from '~/assets/svg/caw-logo-wide.svg?raw'

defineProps({
  label: {
    type: String,
    default: 'Crows Are White',
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  to: {
    type: String,
    default: '/',
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
  <div class="logo-wide">
    <NuxtLink
      v-if="interactive"
      :to="to"
      class="logo-wide__link"
      :aria-label="label"
    >
      <span class="logo-wide__mark">
        <span class="logo-wide__layer logo-wide__layer--outline" aria-hidden="true" v-html="logoMarkup" />
        <span class="logo-wide__layer logo-wide__layer--fill" aria-hidden="true" v-html="logoMarkup" />
      </span>
    </NuxtLink>

    <div
      v-else
      class="logo-wide__mark logo-wide__mark--static"
      role="img"
      :aria-label="label"
      v-html="logoMarkup"
    />
  </div>
</template>

<style scoped>
.logo-wide {
  display: flex;
  justify-content: center;
  width: 100%;
  color: var(--text-color, currentColor);
}

.logo-wide__link {
  display: inline-flex;
  width: min(100%, 430px);
  max-width: 100%;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.logo-wide__mark {
  position: relative;
  display: block;
  width: 100%;
}

.logo-wide__mark--static {
  width: min(100%, 430px);
  max-width: 100%;
}

.logo-wide__layer {
  display: block;
  width: 100%;
}

.logo-wide__layer--fill {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.logo-wide__mark :deep(svg),
.logo-wide__layer :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.logo-wide__mark :deep(path),
.logo-wide__mark :deep(polygon),
.logo-wide__mark :deep(rect),
.logo-wide__layer--outline :deep(path),
.logo-wide__layer--outline :deep(polygon),
.logo-wide__layer--outline :deep(rect) {
  stroke: currentColor;
  fill: none;
  stroke-width: 6px;
}

.logo-wide__layer--fill :deep(path),
.logo-wide__layer--fill :deep(polygon),
.logo-wide__layer--fill :deep(rect) {
  fill: currentColor;
  stroke: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo-wide__link:hover .logo-wide__layer--fill :deep(path),
.logo-wide__link:hover .logo-wide__layer--fill :deep(polygon),
.logo-wide__link:hover .logo-wide__layer--fill :deep(rect),
.logo-wide__link:focus-visible .logo-wide__layer--fill :deep(path),
.logo-wide__link:focus-visible .logo-wide__layer--fill :deep(polygon),
.logo-wide__link:focus-visible .logo-wide__layer--fill :deep(rect) {
  opacity: 1;
}
</style>
