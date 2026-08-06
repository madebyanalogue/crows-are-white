<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  runtime: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="cinematic-video-overlay">
    <p class="cinematic-video-overlay__title serif">
      {{ title }}
    </p>
    <span
      class="cinematic-video-overlay__play"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 14.5v19l16-9.5-16-9.5z"
          stroke="currentColor"
          stroke-width=".7"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <p
      v-if="runtime"
      class="cinematic-video-overlay__runtime serif"
    >
      {{ runtime }}
    </p>
  </div>
</template>

<style scoped>
.cinematic-video-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 5%;
  pointer-events: none;
  color: var(--background-color, #f0f0ed);
}

.cinematic-video-overlay__title,
.cinematic-video-overlay__runtime {
  margin: 0;
  font-size: clamp(20px, 1.75vw, 100px);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}

.cinematic-video-overlay__title {
  justify-self: start;
  text-align: left;
}

.cinematic-video-overlay__runtime {
  justify-self: end;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cinematic-video-overlay__play {
  justify-self: center;
  display: grid;
  place-items: center;
  width: clamp(42px, 12vw, 155px);
  height: clamp(42px, 12vw, 155px);
  color: inherit;
}

.cinematic-video-overlay__play svg {
  width: 100%;
  height: 100%;
}

@media (max-width: 699px) {
  .cinematic-video-overlay__title,
  .cinematic-video-overlay__runtime {
    max-width: 12ch;
  }
}
</style>
