<script setup>
defineProps({
  isPlaying: {
    type: Boolean,
    default: false,
  },
  isMuted: {
    type: Boolean,
    default: false,
  },
  currentLabel: {
    type: String,
    default: '0:00',
  },
  totalLabel: {
    type: String,
    default: '0:00',
  },
  progressPct: {
    type: Number,
    default: 0,
  },
})

defineEmits(['toggle-play', 'toggle-sound', 'scrub-down', 'seek'])

const uiPlayRef = ref(null)
const uiProgressRef = ref(null)
const uiSoundRef = ref(null)

defineExpose({
  uiPlayRef,
  uiProgressRef,
  uiSoundRef,
})
</script>

<template>
  <div class="cinematic-video-controls">
    <button
      ref="uiPlayRef"
      type="button"
      class="cinematic-video-controls__playpause"
      :class="{ 'is-playing': isPlaying }"
      :aria-label="isPlaying ? 'Pause' : 'Play'"
      @click="$emit('toggle-play', $event)"
    >
      <span class="cinematic-video-controls__pause" aria-hidden="true">
        <span />
        <span />
      </span>
      <span class="cinematic-video-controls__play" aria-hidden="true">
        <svg viewBox="0 0 100 100" fill="none">
          <path
            fill="currentColor"
            d="M83.285 43.015c4.953 3.344 4.953 10.626 0 13.97L26.18 95.538C20.57 99.325 13 95.314 13 88.554V11.446c0-6.76 7.57-10.771 13.18-6.984l57.105 38.553Z"
          />
        </svg>
      </span>
    </button>

    <div
      ref="uiProgressRef"
      class="cinematic-video-controls__progress"
    >
      <span class="cinematic-video-controls__time">{{ currentLabel }}</span>
      <div
        class="cinematic-video-controls__scrub"
        role="slider"
        aria-label="Seek"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(progressPct)"
        @mousedown="$emit('scrub-down', $event)"
        @click.stop="$emit('seek', $event)"
      >
        <div class="cinematic-video-controls__scrub-track">
          <div
            class="cinematic-video-controls__scrub-fill"
            :style="{ width: `${progressPct}%` }"
          >
            <span class="cinematic-video-controls__scrub-dot" />
          </div>
        </div>
      </div>
      <span class="cinematic-video-controls__time">{{ totalLabel }}</span>
    </div>

    <button
      ref="uiSoundRef"
      type="button"
      class="cinematic-video-controls__sound"
      :class="{ 'is-muted': isMuted }"
      @click="$emit('toggle-sound', $event)"
    >
      {{ isMuted ? 'Sound Off' : 'Sound On' }}
    </button>
  </div>
</template>

<style scoped>
.cinematic-video-controls {
  --cinematic-ui: #f7f4ec;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.75rem, 2vw, 2rem);
  width: min(100%, 1100px);
  color: var(--cinematic-ui);
}

.cinematic-video-controls__playpause {
  position: relative;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.cinematic-video-controls__play,
.cinematic-video-controls__pause {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cinematic-video-controls__play svg {
  width: 1.35rem;
  height: 1.35rem;
}

.cinematic-video-controls__pause {
  gap: 0.3rem;
  opacity: 0;
}

.cinematic-video-controls__pause span {
  display: block;
  width: 0.28rem;
  height: 1.15rem;
  border-radius: 1px;
  background: currentColor;
}

.cinematic-video-controls__playpause.is-playing .cinematic-video-controls__play {
  opacity: 0;
}

.cinematic-video-controls__playpause.is-playing .cinematic-video-controls__pause {
  opacity: 1;
}

.cinematic-video-controls__progress {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: clamp(0.65rem, 1.5vw, 1.5rem);
  min-width: 0;
}

.cinematic-video-controls__time {
  flex: 0 0 auto;
  font-family: var(--sans);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.cinematic-video-controls__scrub {
  flex: 1 1 auto;
  min-width: 0;
  height: 2.75rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.cinematic-video-controls__scrub-track {
  position: relative;
  width: 100%;
  height: 1px;
  background: rgba(247, 244, 236, 0.35);
}

.cinematic-video-controls__scrub-fill {
  position: relative;
  height: 100%;
  width: 0;
  background: var(--cinematic-ui);
}

.cinematic-video-controls__scrub-dot {
  position: absolute;
  top: 50%;
  right: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cinematic-ui);
  transform: translate(50%, -50%);
}

.cinematic-video-controls__sound {
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: var(--sans);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
}

.cinematic-video-controls__sound:hover,
.cinematic-video-controls__sound:focus-visible {
  opacity: 0.75;
}

@media (max-width: 767px) {
  .cinematic-video-controls {
    gap: 0.55rem;
  }

  .cinematic-video-controls__sound,
  .cinematic-video-controls__time {
    font-size: 0.72rem;
  }
}
</style>
