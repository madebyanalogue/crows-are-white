<template>
  <article class="default-page">
    <div
      v-if="title || subtitle || $slots.title || $slots.subtitle"
      class="wrapper"
    >
      <header class="page-content__intro page-content__intro--single grid-1">
        <div class="page-content__intro-title text-center">
          <h1 class="h1 condensed">
            <slot name="title">{{ title }}</slot>
          </h1>
        </div>
        <SanityContent
          v-if="subtitleBlocks.length"
          :blocks="subtitleBlocks"
          class="rich-text underline-links page-content__intro-copy max-central-content"
        />
        <div
          v-else-if="$slots.subtitle"
          class="sanity-content rich-text underline-links page-content__intro-copy max-central-content"
        >
          <p><slot name="subtitle" /></p>
        </div>
      </header>
    </div>

    <div class="wrapper default-page__body">
      <div
        class="default-page__content rich-text underline-links"
        :class="{ 'default-page__content--wide': wide }"
      >
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  wide: {
    type: Boolean,
    default: false,
  },
})

const subtitleBlocks = computed(() => {
  const text = props.subtitle?.trim()
  if (!text) return []

  return [{
    _type: 'block',
    _key: 'default-page-subtitle',
    style: 'normal',
    children: [{ _type: 'span', text, marks: [] }],
    markDefs: [],
  }]
})
</script>

<style scoped>
.default-page {
  min-height: 100dvh;
  background: var(--background-color, #fff);
  color: var(--text-color, #111010);
}

.default-page__body {
  padding-top: var(--section-padding);
  padding-bottom: var(--section-padding);
}

.default-page__content {
  width: 100%;
  max-width: 740px;
  margin-inline: auto;
}

.default-page__content--wide {
  max-width: 960px;
}

.default-page__content :deep(h2) {
  margin: 0 0 0.75rem;
  font-family: var(--sans);
  font-size: clamp(12px, 1vw, 14px);
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.4;
  text-transform: uppercase;
}

.default-page__content :deep(h2:not(:first-child)) {
  margin-top: 2.5rem;
}

.default-page__content :deep(p) {
  margin: 0;
  color: color-mix(in srgb, var(--text-color, #111010) 72%, transparent);
}

.default-page__content :deep(p + p) {
  margin-top: 1rem;
}

.default-page__content :deep(section + section) {
  margin-top: 2.5rem;
}
</style>
