<template>
  <section
    v-if="hasContent"
    class="section-basic-page"
    :class="{
      'section-basic-page--no-pad-top': !paddingTop,
      'section-basic-page--no-pad-bottom': !paddingBottom,
    }"
  >
    <div class="grid">
      <div v-if="headline" class="span-md-2-4">
        <h2 class="h2">{{ headline }}</h2>
      </div>
      <div v-if="bodyBlocks.length" class="span-md-5-12">
        <SanityContent :blocks="bodyBlocks" />
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

const headline = computed(() => props.section?.basicPageHeadline ?? '')
const bodyBlocks = computed(() => props.section?.basicPageBody ?? [])
const paddingTop = computed(() => props.section?.basicPagePaddingTop !== false)
const paddingBottom = computed(() => props.section?.basicPagePaddingBottom !== false)

const hasContent = computed(
  () => Boolean(headline.value) || bodyBlocks.value.length > 0,
)
</script>

<style scoped>
.section-basic-page {
  padding-top: calc(var(--unit) * 1);
  padding-bottom: calc(var(--unit) * 1);
}

.section-basic-page--no-pad-top {
  padding-top: 0;
}

.section-basic-page--no-pad-bottom {
  padding-bottom: 0;
}
</style>
