<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  pending: {
    type: Boolean,
    default: false,
  },
})

const openId = ref(null)
const wallRef = ref(null)

function openCard(id) {
  openId.value = id
}

function closeOpenCard() {
  openId.value = null
}

function closeCard(id) {
  if (openId.value === id) {
    openId.value = null
  }
}

function handleDocumentClick(event) {
  if (!openId.value) return

  const openCardEl = wallRef.value?.querySelector('.reflection-card--open')
  if (!openCardEl || openCardEl.contains(event.target)) return

  closeOpenCard()
}

watch(openId, (id) => {
  if (!import.meta.client) return

  document.removeEventListener('click', handleDocumentClick)

  if (!id) return

  setTimeout(() => {
    document.addEventListener('click', handleDocumentClick)
  }, 0)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div
    ref="wallRef"
    class="reflection-wall"
    :class="{ 'reflection-wall--loading': pending && !items.length }"
    aria-live="polite"
  >
    <div
      v-for="(item, index) in items"
      :key="item._id"
      class="reflection-wall__cell"
      :class="{
        'reflection-wall__cell--open': openId === item._id,
        'reflection-wall__cell--longform': item.longform,
      }"
    >
      <ReflectionCard
        :item="item"
        :index="index"
        :open="openId === item._id"
        click-only
        show-folded-location
        disable-paper-tilt
        @open="openCard"
        @close="closeCard"
      />
    </div>

    <p
      v-if="!pending && !items.length"
      class="reflection-wall__empty"
    >
      No reflections yet. Be the first to leave one.
    </p>
  </div>
</template>

<style scoped>
.reflection-wall {
  --reflection-cell-aspect: 1;
  /* --reflection-card-border: 1px solid var(--light-border); */
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.reflection-wall__cell {
  position: relative;
  z-index: 0;
  aspect-ratio: var(--reflection-cell-aspect, 1);
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reflection-wall__cell :deep(.reflection-card) {
  height: 100%;
}

.reflection-wall__cell--open {
  z-index: 2;
  align-items: center;
}

.reflection-wall__cell--longform {
  grid-row: span 2;
  aspect-ratio: auto;
}

@media (min-width: 700px) {
  .reflection-wall {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1000px) {
  .reflection-wall {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.reflection-wall--loading {
  min-height: 12rem;
}

.reflection-wall__empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 2rem 0;
  text-align: center;
  color: color-mix(in srgb, var(--text-color, #111010) 62%, transparent);
}
</style>
