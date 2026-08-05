<template>
  <section class="section-typography">
    <h2 class="h6 subdued">Typography</h2>
    <div class="section-typography__stack">
      <p class="h1">
        Heading One — <em>italic emphasis</em> within display text
      </p>
      <p class="h2">
        Heading Two — refined scale for <em>section titles</em> and hero lines
      </p>
      <p class="h3">
        Heading Three — supporting headlines with <em>measured rhythm</em>
      </p>
      <p class="h4">
        Heading Four — sub-section labels and <em>feature callouts</em>
      </p>
      <p class="h5">
        Heading Five — body-adjacent copy for <em>descriptions</em> and intros
      </p>
      <p class="h6">
        Heading Six — <em>uppercase</em> mono labels for navigation and metadata
      </p>
      <p class="h7">
        Heading Seven — compact text for <em>captions</em> and fine print
      </p>
      <p class="h8">
        Heading Eight — smallest scale for <em>footnotes</em> and legal lines
      </p>

   
    </div>
    <div class="section-typography__stack serif">
      <p class="h1">
        Heading One — <em>italic emphasis</em> within display text
      </p>
      <p class="h2">
        Heading Two — refined scale for <em>section titles</em> and hero lines
      </p>
      <p class="h3">
        Heading Three — supporting headlines with <em>measured rhythm</em>
      </p>
      <p class="h4">
        Heading Four — sub-section labels and <em>feature callouts</em>
      </p>
      <p class="h5">
        Heading Five — body-adjacent copy for <em>descriptions</em> and intros
      </p>
      <p class="h6">
        Heading Six — <em>uppercase</em> mono labels for navigation and metadata
      </p>
      <p class="h7">
        Heading Seven — compact text for <em>captions</em> and fine print
      </p>
      <p class="h8">
        Heading Eight — smallest scale for <em>footnotes</em> and legal lines
      </p>

   
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

const paragraphs = computed(() => props.section?.typographyContent ?? [])
</script>

<style scoped>
.section-typography__stack {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 0.75);
  margin-top: calc(var(--unit) * 0.5);
}

.section-typography__paragraph :deep(p) {
  font-size: var(--body);
  line-height: 1.45;
}
</style>
