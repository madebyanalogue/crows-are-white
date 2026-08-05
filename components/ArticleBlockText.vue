<template>
  <ArticleText
    v-if="block.text?.length"
    :blocks="block.text"
    :drop-cap="block.dropCap"
  />
</template>

<script setup>
defineProps({
  block: {
    type: Object,
    required: true,
  },
})
</script>
