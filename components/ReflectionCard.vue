<script setup>
import { getReflectionPaperStyle, formatReflectionNameCity } from '~/utils/reflections'

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
  readonly: {
    type: Boolean,
    default: false,
  },
  paperTiltMax: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['open', 'close'])

const paperColor = computed(() => props.item?.paperColor || 'paleRicePaper')
const paperStyle = computed(() => getReflectionPaperStyle(paperColor.value))
const reflectionText = computed(() => props.item?.reflection || '')
const attributionLabel = computed(() =>
  formatReflectionNameCity({
    name: props.item?.name,
    city: props.item?.city,
    country: props.item?.country,
  }),
)
const isOpen = computed(() => props.readonly || props.open)

const paperTilt = computed(() => {
  const seed = String(props.item?._id ?? props.index)
  let hash = 0

  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }

  if (props.paperTiltMax > 0) {
    const tiltSeed = `${seed}:${props.index}`
    let tiltHash = 0

    for (let i = 0; i < tiltSeed.length; i += 1) {
      tiltHash = ((tiltHash << 5) - tiltHash) + tiltSeed.charCodeAt(i)
      tiltHash |= 0
    }

    const normalized = (Math.abs(tiltHash) % 1000) / 1000
    const degrees = (normalized * 2 * props.paperTiltMax) - props.paperTiltMax
    return `${degrees.toFixed(2)}deg`
  }

  const position = props.index + 1
  if (position % 4 !== 0 && position % 5 !== 0) return null

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

const isPending = computed(() => props.item?.isPending === true)

const canHoverOpen = ref(false)
let hoverOpenMediaQuery = null

function handleHoverOpenMediaChange(event) {
  canHoverOpen.value = event.matches
}

function openOnHover() {
  if (props.readonly || !canHoverOpen.value || props.open) return
  openCard()
}

function closeOnHover() {
  if (props.readonly || !canHoverOpen.value || !props.open) return
  closeCard()
}

function handleClick(event) {
  if (props.readonly) return

  if (canHoverOpen.value && event.detail !== 0) return

  if (props.open) {
    closeCard()
  } else {
    openCard()
  }
}

onMounted(() => {
  if (!import.meta.client) return

  hoverOpenMediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  canHoverOpen.value = hoverOpenMediaQuery.matches
  hoverOpenMediaQuery.addEventListener('change', handleHoverOpenMediaChange)
})

onBeforeUnmount(() => {
  hoverOpenMediaQuery?.removeEventListener('change', handleHoverOpenMediaChange)
  hoverOpenMediaQuery = null
})
</script>

<template>
  <article
    class="reflection-card"
    :class="[
      {
        'reflection-card--open': isOpen,
        'reflection-card--pending': isPending,
        'reflection-card--readonly': readonly,
        'reflection-card--hover-open': canHoverOpen,
      },
    ]"
    :style="paperStyle"
    @mouseenter="openOnHover"
    @mouseleave="closeOnHover"
  >
    <component
      :is="readonly ? 'div' : 'button'"
      class="reflection-card__toggle"
      :type="readonly ? undefined : 'button'"
      :aria-expanded="readonly ? undefined : isOpen"
      :aria-label="readonly ? undefined : (isOpen ? 'Fold reflection' : 'Unfold reflection')"
      @click="handleClick"
    >
      <div
        class="reflection-card__paper"
        :class="{ 'reflection-card__paper--open': isOpen }"
        :style="paperSurfaceStyle"
      >
        <div
          v-if="!isOpen"
          class="reflection-card__folded"
        >
          <div
            class="reflection-card__flap reflection-card__flap--bottom"
            aria-hidden="true"
          />
          <div
            class="reflection-card__flap reflection-card__flap--top"
            aria-hidden="true"
          />
        </div>

        <div
          v-else
          class="reflection-card__inside"
        >
          <p class="reflection-card__quote serif">
            {{ reflectionText }}
          </p>
          <cite
            v-if="attributionLabel"
            class="reflection-card__attribution"
          >
            {{ attributionLabel }}
          </cite>
          <p
            v-if="isPending"
            class="reflection-card__pending-note"
          >
            Visible to you while we review
          </p>
        </div>
      </div>
    </component>
  </article>
</template>

<style scoped>
.reflection-card {
  --reflection-paper-bg: #f7f6f4;
  --reflection-paper-text: #4a4844;
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  /* --reflection-paper-bg: #f7f6f4 !important; */
}

.reflection-card--open {
  z-index: 1;
  align-items: center;
}

.reflection-card--open .reflection-card__toggle {
  align-items: center;
  justify-content: center;
  height: 100%;
}

.reflection-card--readonly .reflection-card__toggle {
  cursor: default;
}

.reflection-card__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
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
  border-radius: 1px;
  background: var(--reflection-paper-bg);
  box-shadow: none;
  overflow: hidden;
  container-type: size;
  border: var(--reflection-card-border, 1px solid var(--mid-border));
  /* --reflection-flap-crease-shift: 7%; */
  /* --reflection-flap-edge: color-mix(in srgb, var(--reflection-paper-text) 22%, transparent); */
}

.reflection-card__paper--open {
  width: min(96%, 100%);
  max-height: 100%;
  aspect-ratio: 1 / 1;
  box-shadow: none;
  overflow: hidden;
}

.reflection-card__paper--open::before,
.reflection-card__paper--open::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
  border-top: 0.035em dashed color-mix(in srgb, var(--reflection-paper-text) 40%, transparent);
  pointer-events: none;
  opacity: 0;
}

.reflection-card__paper--open::before {
  top: 25%;
}

.reflection-card__paper--open::after {
  top: 75%;
}

.reflection-card__folded {
  position: absolute;
  inset: 0;
  color: var(--reflection-paper-text);
}

.reflection-card__flap {
  position: absolute;
  left: 0;
  right: 0;
  background: var(--reflection-paper-bg);
  pointer-events: none;
}

.reflection-card__flap--bottom {
  inset: 50% 0 0;
  z-index: 0;
}

.reflection-card__flap--top {
  inset: 0 0 50%;
  z-index: 1;
  background: var(--reflection-paper-bg);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  border-bottom: 1px solid color-mix(in srgb, var(--reflection-paper-text) 18%, transparent);
  box-shadow: none;
}

/*
.reflection-card:not(.reflection-card--open):not(.reflection-card--readonly)
  .reflection-card__paper:hover
  .reflection-card__flap--top,
.reflection-card:not(.reflection-card--open):not(.reflection-card--readonly)
  .reflection-card__toggle:focus-visible
  .reflection-card__flap--top {
  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    var(--reflection-flap-crease-shift) 100%
  );
  box-shadow: -1px 0 0 0 var(--reflection-flap-edge);
  filter: drop-shadow(0 0.35rem 0.45rem color-mix(in srgb, var(--reflection-paper-text) 12%, transparent));
}
*/

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
  font-style: normal;
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
