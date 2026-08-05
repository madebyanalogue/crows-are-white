<template>
  <h3 v-if="block.subtitle" class="article-block-subtitle h3 text-center wrapper">
    {{ block.subtitle }}
  </h3>
</template>

<script setup>
defineProps({
  block: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.article-block-subtitle {
  width: min(100%, var(--max-subheading-block-width));
  max-width: var(--max-subheading-block-width);
  margin: 0;
}
</style>
