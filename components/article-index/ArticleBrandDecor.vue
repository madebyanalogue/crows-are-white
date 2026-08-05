<template>
  <div
    class="article-brand-decor"
    :class="[
      `article-brand-decor--${name}`,
      { 'article-brand-decor--icon': isIcon },
    ]"
  >
    <svg
      class="article-brand-decor__svg"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="svgViewBox"
      aria-hidden="true"
      v-html="svgInner"
    />
  </div>
</template>

<script setup>
import { getBrandIcon } from '~/utils/brandIcons'

const props = defineProps({
  name: {
    type: String,
    default: 'arc',
  },
})

const brandIcon = computed(() => getBrandIcon(props.name))
const isIcon = computed(() => Boolean(brandIcon.value))

const ABSTRACT_SVGS = {
  arc: {
    viewBox: '0 0 120 48',
    inner: '<path d="M8 40C28 8 92 8 112 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />',
  },
  wave: {
    viewBox: '0 0 120 48',
    inner: '<path d="M4 28C18 10 34 42 50 24C66 6 82 38 98 20C106 14 112 16 116 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />',
  },
  peak: {
    viewBox: '0 0 120 48',
    inner: '<path d="M18 36L60 8L102 36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />',
  },
}

const svgViewBox = computed(() => (
  brandIcon.value?.viewBox ?? ABSTRACT_SVGS[props.name]?.viewBox ?? ABSTRACT_SVGS.arc.viewBox
))

const svgInner = computed(() => (
  brandIcon.value?.inner ?? ABSTRACT_SVGS[props.name]?.inner ?? ABSTRACT_SVGS.arc.inner
))
</script>

<style scoped>
.article-brand-decor {
  display: block;
  color: var(--brand-decor-color, var(--arancio));
  opacity: 1;
}

.article-brand-decor__svg {
  display: block;
  width: 100%;
  height: auto;
}

.article-brand-decor--icon .article-brand-decor__svg {
  width: 100%;
  height: 100%;
}

</style>
