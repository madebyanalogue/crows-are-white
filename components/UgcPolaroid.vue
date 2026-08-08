<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  rotation: {
    type: Number,
    default: 0,
  },
})

const signOff = computed(() =>
  props.item.signOff
  || [props.item.city, props.item.country].filter(Boolean).join(', '),
)

const altText = computed(() =>
  props.item.alt
  || (signOff.value ? `Merch photo from ${signOff.value}` : 'Community merch photo'),
)
</script>

<template>
  <figure
    class="ugc-polaroid"
    :class="{ 'is-pending': item.isPending }"
    :style="{ '--ugc-rotation': `${rotation}deg` }"
  >
    <div class="ugc-polaroid__frame">
      <div class="ugc-polaroid__image-wrap">
        <img
          class="ugc-polaroid__image"
          :src="item.imageUrl"
          :alt="altText"
          loading="lazy"
          draggable="false"
        >
      </div>
      <figcaption
        v-if="signOff"
        class="ugc-polaroid__sign-off handwritten"
      >
        {{ signOff }}
      </figcaption>
    </div>
  </figure>
</template>

<style scoped>
.ugc-polaroid {
  --ugc-frame-bg: #faf8f4;
  --ugc-frame-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
  margin: 0;
  transform: rotate(var(--ugc-rotation, 0deg));
  transition: transform 0.25s ease;
}

.ugc-polaroid__frame {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.85rem 0.85rem 1.35rem;
  background: var(--ugc-frame-bg);
  box-shadow: var(--ugc-frame-shadow);
}

.ugc-polaroid__image-wrap {
  aspect-ratio: 1;
  overflow: hidden;
  background: #ece7df;
}

.ugc-polaroid__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ugc-polaroid__sign-off {
  min-height: 1.6em;
  padding: 0 0.15rem;
  font-size: clamp(1rem, 2.4vw, 1.35rem);
  line-height: 1.2;
  text-align: center;
  color: color-mix(in srgb, currentColor 82%, transparent);
}

.ugc-polaroid.is-pending .ugc-polaroid__frame {
  outline: 1px dashed color-mix(in srgb, currentColor 18%, transparent);
  outline-offset: 4px;
}

@media (hover: hover) {
  .ugc-polaroid:hover {
    transform: rotate(0deg) scale(1.02);
  }
}
</style>
