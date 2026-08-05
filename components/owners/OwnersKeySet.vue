<template>
  <div
    class="owners-key-set"
    :class="{ 'owners-key-set--static': staticKeys }"
  >
    <div class="owners-key-set__cluster">
      <img
        :src="OWNERS_KEYRING_IMAGE"
        class="owners-key-set__ring owners-key-set__ring--back"
        width="1024"
        height="1011"
        alt=""
        aria-hidden="true"
      >

      <div
        v-for="(key, keyIndex) in resolvedKeys"
        :key="key._key"
        class="owners-key-set__key"
        :style="{
          '--key-left': `${key.left}px`,
          '--key-top': `${key.top}px`,
          '--key-scale': key.scale,
          '--key-rest-angle': `${key.restAngle}deg`,
          '--key-color': ownersKeyColorCss(key.color),
          '--key-z': key.zIndex,
        }"
        aria-hidden="true"
      >
        <div
          :ref="staticKeys ? undefined : (el) => emit('key-ref', keyIndex, el)"
          class="owners-key-set__key-pivot"
        >
          <div
            class="owners-key-set__key-surface"
            :class="{ 'owners-key-set__key-surface--photo': ownersKeyLocalSrc(setIndex, keyIndex) || ownersKeyImageSrc(key) }"
          >
            <AppImage
              v-if="ownersKeyImageSrc(key)"
              :src="ownersKeyImageSrc(key)"
              :width="ownersKeyImageWidth(key)"
              :height="ownersKeyImageHeight(key)"
              alt=""
              class="owners-key-set__key-img"
              sizes="240px"
            />
            <img
              v-else-if="ownersKeyLocalSrc(setIndex, keyIndex)"
              :src="ownersKeyLocalSrc(setIndex, keyIndex)"
              :width="ownersKeyLocalDimensions(setIndex, keyIndex).width"
              :height="ownersKeyLocalDimensions(setIndex, keyIndex).height"
              alt=""
              class="owners-key-set__key-photo"
            >
            <div
              v-else
              class="owners-key-set__key-solid"
            />
          </div>
        </div>
      </div>

      <img
        :src="OWNERS_KEYRING_IMAGE"
        class="owners-key-set__ring owners-key-set__ring--front-top"
        width="1024"
        height="1011"
        alt=""
        aria-hidden="true"
      >

      <img
        :src="OWNERS_KEYRING_IMAGE"
        class="owners-key-set__ring owners-key-set__ring--front-bottom"
        width="1024"
        height="1011"
        alt=""
        aria-hidden="true"
      >
    </div>
  </div>
</template>

<script setup>
import {
  OWNERS_KEYRING_IMAGE,
  ownersKeyColorCss,
  ownersKeyImageHeight,
  ownersKeyImageSrc,
  ownersKeyImageWidth,
  ownersKeyLocalDimensions,
  ownersKeyLocalSrc,
  resolveOwnersKeys,
} from '~/utils/ownersKeys'

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  setIndex: {
    type: Number,
    required: true,
  },
  idPrefix: {
    type: String,
    default: 'owners',
  },
  staticKeys: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['key-ref'])

const resolvedKeys = computed(() => resolveOwnersKeys(props.item, props.setIndex))
</script>

<style scoped>
.owners-key-set {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: var(--owners-set-width);
  min-height: var(--owners-set-height);
}

.owners-key-set__cluster {
  position: relative;
  width: var(--owners-ring-size);
  min-height: calc(var(--owners-ring-size) + var(--owners-key-width) * 2.4);
}

.owners-key-set__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: var(--owners-ring-size);
  object-fit: contain;
  object-position: center top;
  pointer-events: none;
}

.owners-key-set__ring--back {
  z-index: 1;
}

/* Top arc passes in front of key holes */
.owners-key-set__ring--front-top {
  z-index: 4;
  clip-path: inset(-8% -8% 48% -8%);
}

/* Bottom arc passes in front of keys — full band with only a small split gap */
.owners-key-set__ring--front-bottom {
  z-index: 4;
  clip-path: inset(72% 0 0 0);
  -webkit-mask-image: radial-gradient(
    ellipse 5.5% 9% at 50% 97%,
    transparent 42%,
    #000 58%
  );
  mask-image: radial-gradient(
    ellipse 5.5% 9% at 50% 97%,
    transparent 42%,
    #000 58%
  );
}

.owners-key-set__key {
  position: absolute;
  top: var(--key-top);
  left: var(--key-left);
  width: var(--owners-key-width);
  transform: translateX(-50%);
  z-index: var(--key-z, 2);
  pointer-events: none;
}

.owners-key-set__key-pivot {
  transform: scale(var(--key-scale));
  transform-origin: 50% calc(100% / 6);
  will-change: transform;
}

.owners-key-set__key-surface {
  width: 100%;
  aspect-ratio: 1 / 3;
  background-color: transparent;
  /* Shank hangs below the ring — clip at the hole line */
  clip-path: inset(calc(100% / 6) 0 0 0);
  -webkit-mask-image: radial-gradient(
    circle at 50% 0,
    transparent var(--owners-key-hole-radius),
    #000 calc(var(--owners-key-hole-radius) + 1px)
  );
  mask-image: radial-gradient(
    circle at 50% 0,
    transparent var(--owners-key-hole-radius),
    #000 calc(var(--owners-key-hole-radius) + 1px)
  );
}

.owners-key-set__key-surface--photo {
  clip-path: inset(calc(100% / 3) 0 0 0);
}

.owners-key-set__key-solid {
  width: 100%;
  height: 100%;
  background-color: var(--key-color, var(--crema));
}

.owners-key-set__key-img {
  width: 100%;
  height: 100%;
}

.owners-key-set__key-img :deep(.app-image),
.owners-key-set__key-img :deep(.app-image__media),
.owners-key-set__key-img :deep(img) {
  width: 100%;
  height: 100%;
  display: block;
}

.owners-key-set__key-img :deep(img) {
  object-fit: cover;
  object-position: center top;
}

.owners-key-set__key-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
  mix-blend-mode: lighten;
}

.owners-key-set--static .owners-key-set__key-pivot {
  transform: scale(var(--key-scale)) rotate(var(--key-rest-angle, 0deg));
}
</style>
