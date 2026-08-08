<script setup>
import { getReflectionPaperStyle } from '~/utils/reflections'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open', 'close'])

const paperColor = computed(() => props.item?.paperColor || 'peach')
const paperStyle = computed(() => getReflectionPaperStyle(paperColor.value))
const reflectionText = computed(() => props.item?.reflection || '')
const attribution = computed(() => props.item?.attribution || 'Anonymous')
const isPending = computed(() => props.item?.isPending === true)

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
      >
        <div
          v-if="!open"
          class="reflection-card__folded"
          aria-hidden="true"
        >
          <span class="reflection-card__fold-line" />
          <span class="reflection-card__fold-corner" />
        </div>

        <div
          v-else
          class="reflection-card__inside"
        >
          <blockquote class="reflection-card__quote serif">
            “{{ reflectionText }}”
          </blockquote>
          <footer class="reflection-card__attribution">
            {{ attribution }}
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
  --reflection-paper-shadow: rgba(17, 16, 16, 0.12);
  --reflection-paper-text: #3a2a22;
  min-height: 0;
}

.reflection-card__toggle {
  display: block;
  width: 100%;
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
  min-height: clamp(7.5rem, 14vw, 9.5rem);
  border-radius: 2px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.28), transparent 42%),
    var(--reflection-paper-bg);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.45) inset,
    0 10px 24px -12px var(--reflection-paper-shadow);
  overflow: hidden;
  transition:
    min-height 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    transform 0.35s ease;
}

.reflection-card__paper--open {
  min-height: clamp(11rem, 22vw, 16rem);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.45) inset,
    0 18px 36px -16px var(--reflection-paper-shadow);
  transform: translateY(-2px);
}

.reflection-card__folded {
  position: absolute;
  inset: 0;
}

.reflection-card__fold-line {
  position: absolute;
  inset: 18% 12% auto;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--reflection-paper-text) 18%, transparent) 20%,
    color-mix(in srgb, var(--reflection-paper-text) 18%, transparent) 80%,
    transparent
  );
  transform: rotate(-8deg);
}

.reflection-card__fold-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 2.4rem;
  height: 2.4rem;
  background: linear-gradient(
    225deg,
    color-mix(in srgb, var(--reflection-paper-text) 8%, white) 0%,
    color-mix(in srgb, var(--reflection-paper-text) 14%, var(--reflection-paper-bg)) 100%
  );
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  box-shadow: -1px 1px 0 rgba(255, 255, 255, 0.35) inset;
}

.reflection-card__inside {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  min-height: inherit;
  padding: clamp(1rem, 2.2vw, 1.35rem);
  color: var(--reflection-paper-text);
  animation: reflection-unfold 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes reflection-unfold {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reflection-card__quote {
  margin: 0;
  font-size: clamp(0.95rem, 1.35vw, 1.08rem);
  font-weight: 300;
  line-height: 1.45;
  letter-spacing: 0.01em;
}

.reflection-card__attribution {
  margin: 0;
  font-size: clamp(0.72rem, 1vw, 0.82rem);
  letter-spacing: 0.04em;
  text-transform: none;
  color: color-mix(in srgb, var(--reflection-paper-text) 72%, transparent);
}

.reflection-card__pending-note {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--reflection-paper-text) 58%, transparent);
}

.reflection-card--pending .reflection-card__paper {
  outline: 1px dashed color-mix(in srgb, var(--reflection-paper-text) 24%, transparent);
  outline-offset: -4px;
}

@media (hover: hover) {
  .reflection-card__toggle:hover .reflection-card__paper {
    transform: translateY(-1px);
  }

  .reflection-card--open .reflection-card__toggle:hover .reflection-card__paper {
    transform: translateY(-3px);
  }
}
</style>
