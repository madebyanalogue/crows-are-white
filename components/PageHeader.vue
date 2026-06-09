<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="mb-14 md:mb-20">
    <h1 class="text-4xl font-semibold text-wire-ink md:text-5xl lg:text-6xl">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-6 max-w-3xl text-lg leading-relaxed text-wire-muted md:text-xl">
      {{ subtitle }}
    </p>
  </header>
</template>
