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
  showTitle: {
    type: Boolean,
    default: true,
  },
  showRuntime: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div
    class="cinematic-video-overlay"
    :class="{ 'cinematic-video-overlay--play-only': !showTitle && !showRuntime }"
  >
    <p
      v-if="showTitle"
      class="cinematic-video-overlay__title serif"
    >
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
      v-if="showRuntime && runtime"
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

.cinematic-video-overlay--play-only {
  grid-template-columns: 1fr;
  justify-items: center;
}

.cinematic-video-overlay__title,
.cinematic-video-overlay__runtime {
  margin: 0;
  font-size: clamp(20px, 2.5vw, 100px);
  letter-spacing: 0.03em;
  font-weight: 300;
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
  width: 90%;
  height: 100%;
  min-width: 80px;
}

@media (max-width: 699px) {
  .cinematic-video-overlay__title,
  .cinematic-video-overlay__runtime {
    max-width: 12ch;
  }
}
</style>
