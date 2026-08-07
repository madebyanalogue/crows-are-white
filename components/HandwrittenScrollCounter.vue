<script setup>
import gsap from 'gsap'

const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  frameWidthVar: {
    type: String,
    default: '--video-frame-width',
  },
  placement: {
    type: String,
    default: 'center-right',
    validator: (value) => ['center-right', 'bottom-right'].includes(value),
  },
})

const reelRef = ref(null)
let reelTween = null
let reelOffset = 0
let previousIndex = 0

const currentLabel = computed(() => String(props.index + 1))
const totalLabel = computed(() => String(props.total || 0))

const reelMidLoop = computed(() => Math.floor(5 / 2))

const reelEntries = computed(() => {
  const total = props.total
  if (!total) return []
  const loops = 5
  const entries = []
  for (let loop = 0; loop < loops; loop += 1) {
    for (let i = 0; i < total; i += 1) {
      entries.push({
        key: `${loop}-${i}`,
        label: String(i + 1),
      })
    }
  }
  return entries
})

function reelUnit() {
  const el = reelRef.value?.querySelector?.('.handwritten-scroll-counter__num')
  return el?.getBoundingClientRect?.().height || 18
}

function setReelToIndex(index, { animate = true, direction = 1 } = {}) {
  const total = props.total
  const reel = reelRef.value
  if (!total || !reel) return

  const unit = reelUnit()
  const midBase = reelMidLoop.value * total
  let targetSlot = midBase + index

  if (animate) {
    const currentSlot = Math.round(reelOffset / unit)
    const currentMod = ((currentSlot % total) + total) % total
    let delta = index - currentMod
    if (direction > 0 && delta <= 0) delta += total
    if (direction < 0 && delta >= 0) delta -= total
    if (delta === 0) delta = direction > 0 ? total : -total
    targetSlot = currentSlot + delta
  }

  const y = -targetSlot * unit
  reelOffset = -y

  if (reelTween) reelTween.kill()

  if (!animate) {
    gsap.set(reel, { y })
    return
  }

  reelTween = gsap.to(reel, {
    y,
    duration: 0.7,
    ease: 'power4.out',
    onComplete: () => {
      const centered = -(midBase + index) * unit
      reelOffset = -centered
      gsap.set(reel, { y: centered })
      reelTween = null
    },
  })
}

function directionForIndex(nextIndex) {
  const total = props.total
  const prev = previousIndex
  if (total <= 1 || nextIndex === prev) return 1
  if (prev === total - 1 && nextIndex === 0) return 1
  if (prev === 0 && nextIndex === total - 1) return -1
  return nextIndex > prev ? 1 : -1
}

watch(
  () => props.index,
  (nextIndex, prevIndex) => {
    if (prevIndex === undefined) {
      previousIndex = nextIndex
      nextTick(() => setReelToIndex(nextIndex, { animate: false }))
      return
    }
    const direction = directionForIndex(nextIndex)
    previousIndex = nextIndex
    setReelToIndex(nextIndex, { animate: true, direction })
  },
  { immediate: true },
)

watch(
  () => props.total,
  () => {
    nextTick(() => setReelToIndex(props.index, { animate: false }))
  },
)

onBeforeUnmount(() => {
  if (reelTween) reelTween.kill()
})
</script>

<template>
  <aside
    v-if="total > 1"
    class="handwritten-scroll-counter handwritten"
    :class="`is-${placement}`"
    :style="{ '--counter-frame-width': `var(${frameWidthVar})` }"
    aria-live="polite"
    :aria-label="`${currentLabel} of ${totalLabel}`"
  >
    <div
      class="handwritten-scroll-counter__window"
      aria-hidden="true"
    >
      <div
        ref="reelRef"
        class="handwritten-scroll-counter__reel"
      >
        <span
          v-for="entry in reelEntries"
          :key="entry.key"
          class="handwritten-scroll-counter__num"
        >
          {{ entry.label }}
        </span>
      </div>
    </div>
    <span class="handwritten-scroll-counter__total">/ {{ totalLabel }}</span>
  </aside>
</template>

<style scoped>
.handwritten-scroll-counter {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  font-family: var(--handwritten);
  font-size: clamp(20px, 1.65vw, 40px);
  font-style: normal;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1;
  pointer-events: none;
  color: var(--obsidian, #111);
  opacity: 0.75;
}

.handwritten-scroll-counter.is-center-right {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 5;
  width: calc(calc(100% - var(--counter-frame-width, 1420px)) / 2);
  transform: translateY(-50%);
  justify-content: center;
}

.handwritten-scroll-counter.is-bottom-right {
  position: relative;
  width: 100%;
  margin-top: 40px;
  justify-content: flex-end;
}

.handwritten-scroll-counter__window {
  height: 1em;
  overflow: hidden;
}

.handwritten-scroll-counter__reel {
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;
}

.handwritten-scroll-counter__num,
.handwritten-scroll-counter__total {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1em;
  line-height: 1;
}

@media (max-width: 699px) {
  .handwritten-scroll-counter.is-center-right {
    right: 10px;
  }
}
</style>
