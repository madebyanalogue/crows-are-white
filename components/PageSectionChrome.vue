<script setup>
defineProps({
  section: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="page-section-chrome"
    :class="{
      'page-section-chrome--border-top': section?.sectionBorderTop === true,
      'page-section-chrome--border-bottom': section?.sectionBorderBottom === true,
    }"
  >
    <slot />
  </div>
</template>
