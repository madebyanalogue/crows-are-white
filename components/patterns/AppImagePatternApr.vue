<template>
  <div
    class="app-image-pattern-apr"
    aria-hidden="true"
    v-html="aprSvg"
  />
</template>

<script setup>
import aprSvg from './apr.svg?raw'
</script>

<style scoped>
.app-image-pattern-apr {
  display: block;
  width: 100%;
  height: 100%;
}

.app-image-pattern-apr :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
