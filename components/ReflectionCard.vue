<script setup>
import { getReflectionPaperStyle, formatReflectionLocation } from '~/utils/reflections'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['open', 'close'])

const paperColor = computed(() => props.item?.paperColor || 'peach')
const paperStyle = computed(() => getReflectionPaperStyle(paperColor.value))
const reflectionText = computed(() => props.item?.reflection || '')
const locationLabel = computed(() =>
  formatReflectionLocation({
    city: props.item?.city,
    country: props.item?.country,
  }),
)
const countryLabel = computed(() => props.item?.country?.trim() || '')
const isPending = computed(() => props.item?.isPending === true)

const paperTilt = computed(() => {
  const position = props.index + 1
  if (position % 4 !== 0 && position % 5 !== 0) return null

  const seed = String(props.item?._id ?? props.index)
  let hash = 0

  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }

  const magnitude = 1 + (Math.abs(hash) % 3)
  const sign = hash % 2 === 0 ? 1 : -1
  return `${sign * magnitude}deg`
})

const paperSurfaceStyle = computed(() =>
  paperTilt.value ? { transform: `rotate(${paperTilt.value})` } : undefined,
)

function openCard() {
  emit('open', props.item._id)
}

function closeCard() {
  emit('close', props.item._id)
}

function handleClick() {
  if (props.open) {
    closeCard()
  } else {
    openCard()
  }
}
</script>

<template>
  <article
    class="reflection-card"
    :class="[
      { 'reflection-card--open': open, 'reflection-card--pending': isPending },
    ]"
    :style="paperStyle"
  >
    <button
      type="button"
      class="reflection-card__toggle"
      :aria-expanded="open"
      :aria-label="open ? 'Fold reflection' : 'Unfold reflection'"
      @click="handleClick"
    >
      <div
        class="reflection-card__paper"
        :class="{ 'reflection-card__paper--open': open }"
        :style="paperSurfaceStyle"
      >
        <div
          v-if="!open"
          class="reflection-card__folded"
        >
          <span
            class="reflection-card__fold-crease"
            aria-hidden="true"
          />
          <p
            v-if="countryLabel"
            class="reflection-card__country"
          >
            {{ countryLabel }}
          </p>
        </div>

        <div
          v-else
          class="reflection-card__inside"
        >
          <p class="reflection-card__quote serif">
            {{ reflectionText }}
          </p>
          <footer
            v-if="locationLabel"
            class="reflection-card__attribution"
          >
            {{ locationLabel }}
          </footer>
          <p
            v-if="isPending"
            class="reflection-card__pending-note"
          >
            Visible to you while we review
          </p>
        </div>
      </div>
    </button>
  </article>
</template>

<style scoped>
.reflection-card {
  --reflection-paper-bg: #f1c1ae;
  --reflection-paper-text: #3a2a22;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  --reflection-paper-bg: #eee !important;
}

.reflection-card__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
}

.reflection-card__paper {
  position: relative;
  width: 96%;
  aspect-ratio: 2 / 1;
  border-radius: 2px;
  background: var(--reflection-paper-bg);
  box-shadow: none;
  overflow: hidden;
  container-type: size;
}

.reflection-card__paper--open {
  aspect-ratio: 1 / 1;
  box-shadow: none;
}

.reflection-card__paper--open::before,
.reflection-card__paper--open::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
  border-top: 1px dotted color-mix(in srgb, var(--reflection-paper-text) 14%, transparent);
  pointer-events: none;
}

.reflection-card__paper--open::before {
  top: 25%;
}

.reflection-card__paper--open::after {
  top: 75%;
}

.reflection-card__folded {
  position: relative;
  height: 100%;
  color: var(--reflection-paper-text);
}

.reflection-card__fold-crease {
  position: absolute;
  inset: 0 0 50%;
  border-bottom: 1px solid color-mix(in srgb, var(--reflection-paper-text) 18%, transparent);
  /* border-radius: 0 0 18px 18px;
  corner-shape: bevel; */
  pointer-events: none;
}

.reflection-card__country {
  position: absolute;
  z-index: 1;
  inset: 50% 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 8%;
  font-size: 14cqmin;
  font-family: var(--serif);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: 0.04em;
  text-align: center;
}

.reflection-card__inside {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  min-height: 0;
  padding: 8%;
  color: var(--reflection-paper-text);
  overflow-y: auto;
}

.reflection-card__quote {
  margin: 0;
  font-size: 8cqmin;
  font-weight: 300;
  line-height: 1.3;
  letter-spacing: 0.01em;
  text-align: center;
}

.reflection-card__attribution {
  position: absolute;
  right: 8%;
  bottom: 8%;
  margin: 0;
  font-size: 5cqmin;
  font-family: var(--serif-body);
  line-height: 1.2;
  letter-spacing: 0.01em;
  text-transform: none;
  color: inherit;
  text-align: right;
}

.reflection-card__pending-note {
  margin: 0;
  font-size: 7cqmin;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--reflection-paper-text) 58%, transparent);
}

.reflection-card--pending .reflection-card__paper {
  outline: 1px dashed color-mix(in srgb, var(--reflection-paper-text) 24%, transparent);
  outline-offset: -4px;
}
</style>
