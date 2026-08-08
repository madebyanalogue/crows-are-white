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
  limit: {
    type: Number,
    default: 0,
  },
})

const displayItems = computed(() => {
  const list = props.items ?? []
  if (!props.limit || props.limit <= 0) return list
  return list.slice(0, props.limit)
})

const openId = ref(null)

function openCard(id) {
  openId.value = id
}

function closeCard(id) {
  if (openId.value === id) {
    openId.value = null
  }
}
</script>

<template>
  <div
    class="reflection-wall"
    :class="{ 'reflection-wall--loading': pending && !displayItems.length }"
    aria-live="polite"
  >
    <div
      v-for="(item, index) in displayItems"
      :key="item._id"
      class="reflection-wall__cell"
    >
      <ReflectionCard
        :item="item"
        :index="index"
        :open="openId === item._id"
        @open="openCard"
        @close="closeCard"
      />
    </div>

    <p
      v-if="!pending && !displayItems.length"
      class="reflection-wall__empty"
    >
      No reflections yet. Be the first to leave one.
    </p>
  </div>
</template>

<style scoped>
.reflection-wall {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.75rem, 1.8vw, 1.15rem);
}

.reflection-wall__cell {
  aspect-ratio: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
