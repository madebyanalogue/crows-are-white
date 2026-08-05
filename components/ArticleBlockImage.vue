<template>
  <figure v-if="imageSrc" class="article-block-image">
    <div
      class="article-block-image__frame"
      :class="{ 'article-block-image__frame--tilted': block.tiltAndShadow }"
      :style="frameStyle"
    >
      <div
        v-if="block.tiltAndShadow"
        class="article-block-image__shadow"
        aria-hidden="true"
      />
      <AppImage
        :src="imageSrc"
        :width="imageWidth"
        :height="imageHeight"
        :alt="block.image?.alt || block.caption || ''"
        class="article-block-image__img"
        sizes="article"
      />
    </div>
    <figcaption v-if="block.caption" class="article-block-image__caption h7 subdued">
      {{ block.caption }}
    </figcaption>
  </figure>
</template>

<script setup>
const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
})

const imageSrc = computed(() => props.block?.image?.asset?._id || '')
const imageWidth = computed(() => props.block?.image?.asset?.metadata?.dimensions?.width)
const imageHeight = computed(() => props.block?.image?.asset?.metadata?.dimensions?.height)

const frameStyle = computed(() => {
  const width = imageWidth.value
  const height = imageHeight.value
  if (!width || !height) return undefined
  return { aspectRatio: `${width} / ${height}` }
})
</script>

<style scoped>
.article-block-image {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 0.35);
  width: min(100%, var(--max-image-block-width));
  max-width: var(--max-image-block-width);
}

.article-block-image__frame {
  position: relative;
  width: 100%;
}

.article-block-image__frame :deep(.app-image) {
  position: relative;
  width: 100%;
}

.article-block-image__frame :deep(.app-image__img) {
  width: 100%;
  height: auto;
  display: block;
}

.article-block-image__shadow {
  position: absolute;
  inset: 0;
  z-index: 0;
  transform: rotate(1.5deg);
  box-shadow: 0 12px 40px rgba(var(--black-rgb), 0.25);
}

.article-block-image__frame--tilted :deep(.app-image) {
  z-index: 1;
  transform: rotate(1.5deg);
}
</style>
