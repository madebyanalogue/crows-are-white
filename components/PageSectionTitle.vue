<template>
  <section v-if="titleBlocks.length" class="section-title">
    <div class="section-padding text-center">
      <div class="">
        <h1 class="h2 serif">
          <SanityInline :blocks="titleBlocks" />
        </h1>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const titleBlocks = computed(() => props.section?.titleHeadline ?? [])
</script>
