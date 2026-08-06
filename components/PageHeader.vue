<template>
  <header class="page-header">
    <h1 class="page-header__title large-title">
      <slot name="title">{{ title }}</slot>
    </h1>
    <p v-if="subtitle || $slots.subtitle" class="page-header__subtitle">
      <slot name="subtitle">{{ subtitle }}</slot>
    </p>
  </header>
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
})
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: clamp(2rem, 5vw, 3.5rem);
}


.page-header__subtitle {
  margin: 0.85rem auto 0;
  max-width: 34rem;
  font-family: var(--sans);
  font-size: clamp(13px, 1.1vw, 15px);
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.6;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--text-color, #111010) 58%, transparent);
}
</style>
