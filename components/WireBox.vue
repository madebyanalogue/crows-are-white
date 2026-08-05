<template>
  <div
    class="wire-box"
    :style="boxStyle"
  >
    <span v-if="label" class="wire-box__label">{{ label }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  minHeight: {
    type: String,
    default: '',
  },
})

const boxStyle = computed(() => {
  if (!props.minHeight) return undefined
  return { minHeight: props.minHeight }
})
</script>

<style scoped>
.wire-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1px dashed color-mix(in srgb, currentColor 24%, transparent);
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 8px,
    color-mix(in srgb, currentColor 6%, transparent) 8px,
    color-mix(in srgb, currentColor 6%, transparent) 9px
  );
  text-align: center;
}

.wire-box__label {
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.55;
}
</style>
