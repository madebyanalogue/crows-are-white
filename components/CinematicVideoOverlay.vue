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
  boldTypography: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="cinematic-video-overlay"
    :class="{
      'cinematic-video-overlay--play-only': !showTitle && !showRuntime,
      'cinematic-video-overlay--bold': boldTypography,
    }"
  >
    <div
      v-if="boldTypography"
      class="cinematic-video-overlay__heading"
    >
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
            fill="currentColor"
          />
        </svg>
      </span>
      <p
        v-if="showTitle"
        class="cinematic-video-overlay__title"
      >
        {{ title }}
      </p>
    </div>

    <template v-else>
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
    </template>
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

.cinematic-video-overlay--bold {
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
}

.cinematic-video-overlay__heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  max-width: 100%;
}

.cinematic-video-overlay__title,
.cinematic-video-overlay__runtime {
  margin: 0;
  font-size: var(--video-title);
  letter-spacing: 0.03em;
  font-weight: 300;
  line-height: 1.1;
}

.cinematic-video-overlay__title {
  justify-self: start;
  text-align: left;
}

.cinematic-video-overlay--bold .cinematic-video-overlay__title {
  justify-self: center;
  text-align: center;
  font-family: var(--condensed);
  text-transform: uppercase;
  font-size: clamp(20px, 3.5vw, 80px);
  letter-spacing: 0;
  font-weight: 400;
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
  flex-shrink: 0;
}

.cinematic-video-overlay--bold .cinematic-video-overlay__play {
  width: clamp(36px, 8vw, 96px);
  height: clamp(36px, 8vw, 96px);
}

.cinematic-video-overlay__play svg {
  width: 90%;
  height: 100%;
  min-width: 80px;
}

.cinematic-video-overlay--bold .cinematic-video-overlay__play svg {
  min-width: 0;
}

@media (max-width: 999px) {
  .cinematic-video-overlay:not(.cinematic-video-overlay--bold) {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .cinematic-video-overlay__title,
  .cinematic-video-overlay__runtime {
    display: none;
  }

  .cinematic-video-overlay--bold .cinematic-video-overlay__title {
    display: none;
  }

  .cinematic-video-overlay--bold .cinematic-video-overlay__heading {
    flex-direction: row;
    justify-content: center;
  }

  .cinematic-video-overlay__play {
    justify-self: center;
    display: grid;
    place-items: center;
    width: clamp(80px, 15vw, 140px);
    height: clamp(80px, 15vw, 140px);
  }

  .cinematic-video-overlay__play svg {
    width: 100%;
    min-width: 0;
  }

  .cinematic-video-overlay--bold .cinematic-video-overlay__play {
    width: clamp(80px, 15vw, 140px);
    height: clamp(80px, 15vw, 140px);
  }
}

@media (max-width: 699px) {
  .cinematic-video-overlay:not(.cinematic-video-overlay--bold) .cinematic-video-overlay__title,
  .cinematic-video-overlay:not(.cinematic-video-overlay--bold) .cinematic-video-overlay__runtime {
    max-width: 12ch;
  }

  .cinematic-video-overlay--bold .cinematic-video-overlay__heading {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
