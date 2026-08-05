<template>
  <article class="default-page">
    <PageHeader :title="title" :subtitle="subtitle">
      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>
      <template v-if="$slots.subtitle" #subtitle>
        <slot name="subtitle" />
      </template>
    </PageHeader>

    <div
      class="default-page__content rich-text underline-links"
      :class="{ 'default-page__content--wide': wide }"
    >
      <slot />
    </div>
  </article>
</template>

<script setup>
defineProps({
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
</script>

<style scoped>
.default-page {
  min-height: 100dvh;
  padding:
    calc(var(--header-height, 112) * 1px + clamp(1.5rem, 4vw, 2.5rem))
    var(--wrapper-padding, 1.25rem)
    clamp(2.5rem, 6vw, 4rem);
  background: var(--background-color, #fff);
  color: var(--text-color, #111010);
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
