<template>
  <svg
    class="trustpilot-star-rating"
    viewBox="0 0 100 20"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="`${normalizedRating} out of 5 stars`"
    role="img"
  >
    <polygon
      v-for="index in 5"
      :key="index"
      :points="STAR_POINTS"
      :fill="index <= normalizedRating ? '#00B67A' : '#DCDCE6'"
      :transform="`translate(${(index - 1) * 20}, 0)`"
    />
  </svg>
</template>

<script setup>
const STAR_POINTS = '10,1.5 12.2,7.4 18.5,7.4 13.2,11.1 15.4,17 10,13.4 4.6,17 6.8,11.1 1.5,7.4 7.8,7.4'

const props = defineProps({
  rating: {
    type: Number,
    default: 0,
  },
})

const normalizedRating = computed(() => {
  const value = Number(props.rating)
  if (!Number.isFinite(value)) return 0
  return Math.min(5, Math.max(0, Math.round(value)))
})
</script>

<style scoped>
.trustpilot-star-rating {
  display: block;
  width: auto;
  height: 1.25rem;
  shape-rendering: geometricPrecision;
}
</style>
