<script setup lang="ts">
defineProps<{
  title: string
  tone?: 'info' | 'warn'
}>()
</script>

<template>
  <div
    class="border-2 p-6 text-sm leading-relaxed text-wire-muted"
    :class="
      tone === 'warn'
        ? 'border-amber-600 bg-amber-50'
        : 'border-wire-ink bg-white'
    "
  >
    <p
      class="label-caps mb-2"
      :class="tone === 'warn' ? 'text-amber-800' : 'text-wire-ink'"
    >
      {{ title }}
    </p>
    <p class="text-wire-ink"><slot /></p>
  </div>
</template>
