<script setup>
const props = defineProps({
  section: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: 'Reflections',
  },
  intro: {
    type: String,
    default: 'Visitors from around the world have left their reflections.\nRead a few, or leave one of your own.',
  },
  limit: {
    type: Number,
    default: 0,
  },
  showViewAll: {
    type: Boolean,
    default: false,
  },
  paddingTop: {
    type: String,
    default: 'large',
  },
  paddingBottom: {
    type: String,
    default: 'large',
  },
})

const SECTION_PADDING_VALUES = {
  none: '0',
  small: 'var(--section-padding-small)',
  large: 'var(--section-padding)',
  xlarge: 'calc(var(--section-padding) * 1.5)',
}

function resolveSectionPadding(value) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }
  if (value === false) return 'none'
  return 'large'
}

const resolvedTitle = computed(() =>
  props.section?.reflectionsTitle?.trim() || props.title,
)

const resolvedIntro = computed(() =>
  props.section?.reflectionsIntro?.trim() || props.intro,
)

const resolvedLimit = computed(() => {
  if (props.limit > 0) return props.limit
  const value = Number(props.section?.reflectionsMaxItems)
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(Math.max(Math.round(value), 1), 100)
})

const resolvedShowViewAll = computed(() => {
  if (props.section) {
    return props.section.reflectionsShowViewAll !== false
  }
  return props.showViewAll
})

const fetchLimit = computed(() => {
  if (resolvedLimit.value > 0) return resolvedLimit.value
  return 500
})

const sectionStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(
    props.section?.reflectionsPaddingTop ?? props.paddingTop,
  )],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(
    props.section?.reflectionsPaddingBottom ?? props.paddingBottom,
  )],
}))

const introParagraphs = computed(() =>
  resolvedIntro.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
)

const modalOpen = ref(false)
const { items, pending } = useReflections(fetchLimit.value)

function openModal() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}
</script>

<template>
  <section
    class="page-section-reflections"
    aria-label="Reflections"
    :style="sectionStyle"
  >
    <div class="page-section-reflections__header wrapper">
      <h2 class="page-section-reflections__title serif">
        {{ resolvedTitle }}
      </h2>
      <div class="page-section-reflections__intro">
        <p
          v-for="(paragraph, index) in introParagraphs"
          :key="index"
        >
          {{ paragraph }}
        </p>
      </div>

      <div class="page-section-reflections__actions">
        <button
          type="button"
          class="page-section-reflections__button"
          @click="openModal"
        >
          Leave a reflection
        </button>
        <NuxtLink
          v-if="resolvedShowViewAll"
          to="/reflections"
          class="page-section-reflections__link"
        >
          View all
        </NuxtLink>
      </div>
    </div>

    <div class="page-section-reflections__wall wrapper">
      <ReflectionWall
        :items="items"
        :pending="pending"
        :limit="resolvedLimit || 0"
      />
    </div>

    <ReflectionSubmitModal
      :open="modalOpen"
      @close="closeModal"
    />
  </section>
</template>

<style scoped>
.page-section-reflections {
  color: inherit;
}

.page-section-reflections__header {
  display: grid;
  gap: 0.85rem;
  margin-bottom: clamp(1rem, 2.5vw, 1.75rem);
  text-align: center;
}

.page-section-reflections__title {
  margin: 0;
  padding: 0 clamp(1rem, 3vw, 2rem);
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  font-weight: 300;
  letter-spacing: 0.03em;
}

.page-section-reflections__intro {
  max-width: 42rem;
  margin-inline: auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
  color: color-mix(in srgb, var(--text-color, #111010) 72%, transparent);
}

.page-section-reflections__intro p {
  margin: 0;
}

.page-section-reflections__intro p + p {
  margin-top: 0.45rem;
}

.page-section-reflections__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem 1rem;
  padding-top: 0.25rem;
}

.page-section-reflections__button,
.page-section-reflections__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0.65rem 1.1rem;
  border-radius: 999px;
  font: inherit;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.page-section-reflections__button {
  border: 1px solid var(--text-color, #111010);
  background: var(--text-color, #111010);
  color: var(--background-color, #fff);
  cursor: pointer;
}

.page-section-reflections__link {
  border: 1px solid color-mix(in srgb, var(--text-color, #111010) 18%, transparent);
  color: inherit;
}
</style>
