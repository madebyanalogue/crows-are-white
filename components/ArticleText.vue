<template>
  <div
    v-if="blocks.length"
    class="article-text max-text-block-width wrapper"
    :class="{
      'article-text--drop-cap': dropCap && dropCapLetter,
    }"
  >
    <span
      v-if="dropCap && dropCapLetter"
      class="article-text__drop-cap h1"
      aria-hidden="true"
    >
      {{ dropCapLetter }}
    </span>
    <SanityContent
      :blocks="displayBlocks"
      class="article-text__content rich-text underline-links"
    />
  </div>
</template>

<script setup>
import { splitDropCap } from '~/utils/portableText'

const props = defineProps({
  blocks: {
    type: Array,
    default: () => [],
  },
  dropCap: {
    type: Boolean,
    default: false,
  },
})

const dropCapData = computed(() => {
  if (!props.dropCap) {
    return { letter: '', blocks: props.blocks || [] }
  }
  return splitDropCap(props.blocks)
})

const dropCapLetter = computed(() => dropCapData.value.letter)
const displayBlocks = computed(() => dropCapData.value.blocks)
</script>

<style scoped>
.article-text {
  max-width:600px;
}
@media (min-width: 1000px) {
  .article-text {
    max-width:660px;
  }
}

.article-text--drop-cap {
  overflow: hidden;
}

.article-text__drop-cap {
  float: left;
  padding: 0px 15px 1px 0;
  line-height: 1;
  font-family: var(--serif);
  font-size: calc(var(--unit) * 5.2);
  line-height: 0.695;
}
@media (max-width: 999px) {
  .article-text__drop-cap {
    padding: 5px 15px 1px 0;
  }
}
</style>
