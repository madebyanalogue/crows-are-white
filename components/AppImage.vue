<template>
  <div
    class="app-image"
    :class="{ 'app-image--inset': inset }"
    :style="imageScaleStyle"
  >
    <AppImagePattern
      v-if="patternInline && resolvedOverlay && resolvedOverlay !== 'wipe'"
      ref="overlayRef"
      :name="resolvedOverlay"
      :inline="true"
      :style="patternWidthStyle"
    />
    <div
      class="app-image__media"
      :class="{ 'app-image__media--inline': patternInline }"
    >
      <NuxtImg
        ref="imgEl"
        provider="sanity"
        :src="src"
        :width="width"
        :height="height"
        :alt="alt"
        :sizes="resolvedSizes"
        :class="imgClass"
        :data-animate="animate ? '' : undefined"
        v-bind="forwardedAttrs"
      />
      <div
        v-if="resolvedOverlay === 'wipe'"
        ref="overlayRef"
        class="app-image__wipe"
        aria-hidden="true"
      />
      <AppImagePattern
        v-else-if="resolvedOverlay && !patternInline"
        ref="overlayRef"
        :name="resolvedOverlay"
        :style="patternWidthStyle"
      />
    </div>
  </div>
</template>

<script setup>
import {
  APP_IMAGE_ANIMATION_DEFAULTS,
  APP_IMAGE_OVERLAYS,
  resolveAppImageOverlay,
  resolveAppImageSizes,
} from '~/utils/appImage'
import { isAppImagePattern } from '~/utils/appImagePatterns'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: undefined,
  },
  height: {
    type: [Number, String],
    default: undefined,
  },
  sizes: {
    type: String,
    default: 'full',
  },
  animate: {
    type: Boolean,
    default: false,
  },
  /** @deprecated Use `overlay="wipe"` instead. */
  wipe: {
    type: Boolean,
    default: false,
  },
  overlay: {
    type: String,
    default: null,
    validator: (value) => !value || value === APP_IMAGE_OVERLAYS.WIPE || isAppImagePattern(value),
  },
  patternWidth: {
    type: String,
    default: null,
  },
  patternInline: {
    type: Boolean,
    default: false,
  },
  inset: {
    type: Boolean,
    default: false,
  },
  animation: {
    type: Object,
    default: () => ({}),
  },
})

const attrs = useAttrs()
const imgEl = ref(null)
const overlayRef = ref(null)

const resolvedSizes = computed(() => resolveAppImageSizes(props.sizes))
const resolvedOverlay = computed(() => resolveAppImageOverlay(props.overlay, props.wipe))

const patternWidthStyle = computed(() => (
  props.patternWidth ? { '--app-image-pattern-width': props.patternWidth } : undefined
))

const imageScaleFrom = computed(() => (
  props.animation?.from ?? APP_IMAGE_ANIMATION_DEFAULTS.from
))

const imageScaleStyle = computed(() => (
  props.animate ? { '--image-scale-from': imageScaleFrom.value } : undefined
))

const imgClass = computed(() => {
  const classes = ['app-image__img']
  if (attrs.class) classes.push(attrs.class)
  return classes
})

const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const imageRef = computed(() => imgEl.value?.imgEl ?? imgEl.value)

if (props.animate) {
  useScrollImageScale(imageRef, {
    ...APP_IMAGE_ANIMATION_DEFAULTS,
    ...props.animation,
    overlay: props.patternInline ? null : resolvedOverlay.value,
    overlayRef: props.patternInline ? null : overlayRef,
  })
}

defineExpose({ imgEl: imageRef })
</script>

<style scoped>
.app-image__img[data-animate] {
  will-change: transform;
}

.app-image__img[data-animate]:not([data-scale-ready]) {
  opacity: 0;
  transform: scale(var(--image-scale-from, 1.1));
  transform-origin: center center;
}

.app-image--inset {
  position: relative;
  width: 100%;
  height: 100dvh;
}

.app-image--inset .app-image__media {
  position: absolute;
  inset: var(--section-padding);
  overflow: hidden;
}

.app-image--inset .app-image__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.app-image__media {
  position: relative;
  overflow: hidden;
}

.app-image__media--inline {
  flex: 1;
  min-width: 0;
  align-self: stretch;
}

.app-image__wipe {
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
