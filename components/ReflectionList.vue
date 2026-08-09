<script setup>
import { formatReflectionNameCity } from '~/utils/reflections'

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

const listItems = computed(() =>
  props.items.map((item) => ({
    ...item,
    attribution: formatReflectionNameCity({
      name: item?.name,
      city: item?.city,
      country: item?.country,
    }),
  })),
)
</script>

<template>
  <div
    class="reflection-list-wrap"
    :class="{ 'reflection-list-wrap--loading': pending && !items.length }"
    aria-live="polite"
  >
    <ol
      v-if="listItems.length"
      class="reflection-list"
    >
      <li
        v-for="item in listItems"
        :key="item._id"
        class="reflection-list__item"
      >
        <h2 class="reflection-list__quote h2 serif light">
          {{ item.reflection }}
        </h2>
        <cite
          v-if="item.attribution"
          class="reflection-list__cite serif"
        >
          {{ item.attribution }}
        </cite>
      </li>
    </ol>

    <p
      v-if="!pending && !items.length"
      class="reflection-list__empty"
    >
      No reflections yet. Be the first to leave one.
    </p>
  </div>
</template>

<style scoped>
.reflection-list-wrap {
  min-width: 0;
}

.reflection-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.reflection-list__item {
  display: flex;
  flex-direction: column;
  gap: clamp(0.65rem, 1.5vw, 0.85rem);
  margin: 0;
  padding: 0;
  background: none;
  border: 0;
  text-align: center;
    padding: 3rem 2rem;
    border: 1px solid var(--light-border);
    margin-bottom: -1px;
}

.reflection-list__quote {
  margin: 0;
  font-weight: 300;
  line-height: 1.25;
  letter-spacing: 0.01em;
}

.reflection-list__cite {
  margin: 0;
  font-family: var(--serif-body);
  font-size: clamp(0.95rem, 1.25vw, 1.05rem);
  font-style: normal;
  font-weight: 300;
  line-height: 1.45;
  letter-spacing: 0.01em;
  opacity: 0.72;
}

.reflection-list-wrap--loading {
  min-height: 12rem;
}

.reflection-list__empty {
  margin: 0;
  padding: 2rem 0;
  text-align: center;
  color: color-mix(in srgb, var(--text-color, #111010) 62%, transparent);
}
</style>
