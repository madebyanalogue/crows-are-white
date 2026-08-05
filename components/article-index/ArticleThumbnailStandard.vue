<template>
  <NuxtLink
    v-if="article"
    :to="`/articles/${article.slug}`"
    class="article-thumb-standard"
  >
    <div class="article-thumb-standard__image">
      <img
        ref="imageRef"
        :src="article.image"
        :alt="article.title"
        loading="lazy"
        decoding="async"
      >
      <div
        ref="wipeRef"
        class="article-thumb-standard__wipe"
        aria-hidden="true"
      />
    </div>
    <div class="caption">{{ article.title }}</div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const imageRef = ref(null)
const wipeRef = ref(null)

useScrollImageScale(imageRef, {
  from: 1.1,
  end: 'top center',
  wipeRef,
  wipeDuration: 2,
  wipeEase: 'power4.out',
})
</script>

<style scoped>
.article-thumb-standard {
  display: flex;
  flex-direction: column;
  color: inherit;
}
.caption {
  /* font-size: calc(var(--caption) * 1.5); */
}

.article-thumb-standard__image {
  position: relative;
  width: 100%;
  aspect-ratio: 7 / 6;
  overflow: hidden;
}

.article-thumb-standard__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

.article-thumb-standard__image img:not([data-scale-ready]) {
  opacity: 0;
  transform: scale(1.1);
  transform-origin: center center;
}

.article-thumb-standard__wipe {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--racing-green);
  transform: scaleY(1);
  transform-origin: bottom center;
  pointer-events: none;
  will-change: transform;
}
</style>
