<template>
  <svg
    class="crows-icon"
    :class="{ 'crows-icon--stroke': variant === 'stroke' }"
    viewBox="0 0 90 29.74"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      ref="shapeRef"
      class="crows-icon__shape"
      :d="resolvedPath"
    />
  </svg>
</template>

<script setup>
const iconPathDefault = 'M45 12.1 .67 .22 5.99 9.44 16.43 12.24 19.04 16.76 37.87 21.8 27.03 24.71 45 29.52 62.96 24.71 52.13 21.8 70.96 16.76 73.58 12.24 84 9.44 89.33 .22 Z'
const iconPathReverse = 'M.67 .22 45 12.1 89.33 .22 84 9.44 73.58 12.24 70.96 16.76 52.13 21.8 62.96 24.71 45 29.52 27.03 24.71 37.87 21.8 19.04 16.76 16.43 12.24 5.99 9.44 Z'

const props = defineProps({
  variant: {
    type: String,
    default: 'fill',
    validator: (value) => ['fill', 'stroke'].includes(value),
  },
  reverse: {
    type: Boolean,
    default: false,
  },
})

const resolvedPath = computed(() => (
  props.reverse ? iconPathReverse : iconPathDefault
))

const shapeRef = ref(null)

defineExpose({
  shapeRef,
})
</script>

<style scoped>
.crows-icon--stroke {
  fill: none;
}

.crows-icon__shape {
  fill: currentColor;
}

.crows-icon--stroke .crows-icon__shape {
  fill: none;
  stroke: currentColor;
  stroke-width: 0.85;
  vector-effect: non-scaling-stroke;
}
</style>
