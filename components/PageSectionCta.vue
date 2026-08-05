<template>
  <section v-if="hasContent" class="section-cta" :style="sectionPaddingStyle">
    <div class="wrapper">
      <div class="grid-1 grid-md-2 section-padding-md-05 pad-top-bottom">
        <div />
        <div
          class="section-cta__content grid-1 gap-25 max-text-block-width"
          :class="{ 'section-cta__content--crayon': hasCrayonBackground }"
        >
          <h2 v-if="titleBlocks.length" class="h4 section-cta__title">
            <SanityInline :blocks="titleBlocks" />
          </h2>

          <SanityContent
            v-if="descriptionBlocks.length"
            :blocks="descriptionBlocks"
            class=""
          />

          <nav
            v-if="links.length"
            class="section-cta__links"
            aria-label="Calls to action"
          >
            <MenuLink
              v-for="link in links"
              :key="link._key"
              :item="toMenuItem(link)"
              arrow-variant="scale"
            />
          </nav>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const titleBlocks = computed(() => props.section?.ctaTitle ?? [])
const descriptionBlocks = computed(() => props.section?.ctaDescription ?? [])
const links = computed(() => props.section?.ctaLinks ?? [])
const hasCrayonBackground = computed(() => props.section?.ctaBackgroundColor === 'crayon')

const SECTION_PADDING_VALUES = {
  none: '0',
  small: 'var(--section-padding-small)',
  large: 'var(--section-padding)',
  xlarge: 'calc(var(--section-padding) * 1.5)',
}

const SECTION_PADDING_VALUES_BOTTOM_MOBILE = {
  ...SECTION_PADDING_VALUES,
  xlarge: 'calc(var(--section-padding) * 2.0)',
}

function resolveSectionPadding(value) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }

  // Legacy boolean: false = no padding, true/unset = padding on
  if (value === false) return 'none'
  return 'large'
}

function resolveMobilePadding(value, fallback) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }

  // 'inherit' or unset falls back to the desktop value
  return fallback
}

const sectionPaddingStyle = computed(() => {
  const top = resolveSectionPadding(props.section?.ctaPaddingTop)
  const bottom = resolveSectionPadding(props.section?.ctaPaddingBottom)
  const topMobile = resolveMobilePadding(props.section?.ctaPaddingTopMobile, top)
  const bottomMobile = resolveMobilePadding(props.section?.ctaPaddingBottomMobile, bottom)

  return {
    '--cta-padding-top': SECTION_PADDING_VALUES[top],
    '--cta-padding-bottom': SECTION_PADDING_VALUES[bottom],
    '--cta-padding-top-mobile': SECTION_PADDING_VALUES[topMobile],
    '--cta-padding-bottom-mobile': SECTION_PADDING_VALUES_BOTTOM_MOBILE[bottomMobile],
  }
})

const hasContent = computed(
  () => titleBlocks.value.length > 0
    || descriptionBlocks.value.length > 0
    || links.value.length > 0,
)

function toMenuItem(link) {
  return {
    text: link.linkTitle,
    link: {
      type: link.type,
      page: link.page,
      url: link.url,
    },
    isButton: true,
  }
}
</script>

<style scoped>
.section-cta {
  padding-top: var(--cta-padding-top);
  padding-bottom: var(--cta-padding-bottom);
}

.section-cta__content {
  display: flex;
  flex-direction: column;
}

.section-cta__content--crayon {
  background: var(--crayon);
  padding: var(--section-padding);
}
.section-cta__title {
  letter-spacing: -0.01em;
}

.section-cta__links {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.section-cta__links:has(.menu-link:hover) :deep(.menu-link) {
  opacity: 0.2;
}

.section-cta__links:has(.menu-link:hover) :deep(.menu-link:hover) {
  opacity: 1;
}
@media (max-width: 999px) {
  .section-cta {
    padding-top: var(--cta-padding-top-mobile);
    padding-bottom: var(--cta-padding-bottom-mobile);
  }

  .section-cta__content {
    margin: 0 auto;
  }
}
</style>
