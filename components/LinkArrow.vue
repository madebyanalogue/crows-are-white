<template>
  <span
    class="link-arrow"
    :class="{ 'link-arrow--scale': variant === 'scale' }"
    aria-hidden="true"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 13 12">
      <path
        stroke="currentColor"
        d="m7.304 10.919 5.007-5.08m0 0L7.304.76m5.007 5.08H.93"
      />
    </svg>
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'rotate',
    validator: (value) => ['rotate', 'scale'].includes(value),
  },
})
</script>

<style scoped>
.link-arrow {
  margin-bottom: 0;
  margin-left: 0;
  pointer-events: none;
  transition: transform 0.7s cubic-bezier(0, 0, 0, 1);
  width: .8em;
  flex-shrink: 0;
  transform-origin: left bottom;
  display: inline-block;
}

.link-arrow:not(.link-arrow--scale) {
  transform: rotate(-45deg) translate(0.1em, 0.4em);
}

.link-arrow--scale {
  transform: scale(0);
  transition-duration: 0.35s;
}

.link-arrow svg {
  display: block;
  width: 100%;
  height: auto;
}

.link-arrow--scale svg {
  transform: rotate(-45deg) translateY(20%);
}

.link-arrow path {
  stroke-width: 1;
}
</style>
