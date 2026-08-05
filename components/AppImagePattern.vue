<template>
  <div
    ref="rootEl"
    class="app-image-pattern"
    :class="{
      'app-image-pattern--inline': inline,
      'app-image-pattern--apr': name === 'apr',
      'app-image-pattern--bottom-right': patternPosition === 'bottom-right',
    }"
    :style="patternStyle"
    aria-hidden="true"
  >
    <AppImagePatternApr
      v-if="name === 'apr'"
      class="app-image-pattern__svg"
    />
    <img
      v-else
      :src="patternSrc"
      alt=""
      class="app-image-pattern__img"
    >
  </div>
</template>

<script setup>
import AppImagePatternApr from '~/components/patterns/AppImagePatternApr.vue'
import {
  getAppImagePatternAspectRatio,
  getAppImagePatternPosition,
  getAppImagePatternSrc,
  getAppImagePatternWidth,
} from '~/utils/appImagePatterns'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  patternWidth: {
    type: String,
    default: null,
  },
})

const rootEl = ref(null)
const patternSrc = computed(() => getAppImagePatternSrc(props.name))
const patternPosition = computed(() => getAppImagePatternPosition(props.name))

const patternStyle = computed(() => ({
  '--app-image-pattern-width': props.patternWidth || getAppImagePatternWidth(props.name) || undefined,
  '--app-image-pattern-aspect-ratio': getAppImagePatternAspectRatio(props.name),
}))

defineExpose({ el: rootEl })
</script>

<style scoped>
.app-image-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: var(--app-image-pattern-width, 32%);
  aspect-ratio: var(--app-image-pattern-aspect-ratio, 1 / 2);
  overflow: hidden;
  pointer-events: none;
}

.app-image-pattern__img,
.app-image-pattern__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.app-image-pattern__img {
  object-fit: cover;
  object-position: left bottom;
}

.app-image-pattern--bottom-right {
  left: auto;
  right: 0;
}

.app-image-pattern--bottom-right .app-image-pattern__img {
  object-fit: contain;
  object-position: right bottom;
}

.app-image-pattern--inline {
  position: relative;
  bottom: auto;
  left: auto;
  right: auto;
  z-index: auto;
  flex-shrink: 0;
  align-self: flex-end;
}
</style>
