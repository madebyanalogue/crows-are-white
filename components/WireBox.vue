<script setup lang="ts">
defineProps<{
  label: string
  aspect?: string
  minHeight?: string
  dark?: boolean
}>()
</script>

<template>
  <div
    class="wire-box flex items-center justify-center p-10 text-center"
    :class="[aspect, dark && 'wire-box-dark']"
    :style="minHeight ? { minHeight } : undefined"
  >
    <p class="max-w-sm text-sm font-medium" :class="dark ? 'text-stone-400' : 'text-wire-muted'">{{ label }}</p>
  </div>
</template>
