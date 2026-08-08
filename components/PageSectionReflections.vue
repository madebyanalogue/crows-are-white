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
  paddingTop: {
    type: String,
    default: 'large',
  },
  paddingBottom: {
    type: String,
    default: 'large',
  },
  isFirstSection: {
    type: Boolean,
    default: false,
  },
  fullPage: {
    type: Boolean,
    default: false,
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

const initialVisibleCount = computed(() => {
  const value = Number(props.section?.reflectionsMaxItems)
  if (!Number.isFinite(value) || value <= 0) return 10
  return Math.min(Math.max(Math.round(value), 1), 100)
})

const hasBackgroundVideo = computed(() =>
  props.section?.reflectionsBackgroundMediaType === 'video',
)

const sectionStyle = computed(() => ({
  paddingTop: props.isFirstSection
    ? 'var(--page-top-offset)'
    : SECTION_PADDING_VALUES[resolveSectionPadding(
      props.section?.reflectionsPaddingTop ?? props.paddingTop,
    )],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(
    props.section?.reflectionsPaddingBottom ?? props.paddingBottom,
  )],
}))

const modalOpen = ref(false)
const { items, pending } = useReflections(500)
const columns = useReflectionWallColumns()
const visibleCount = ref(initialVisibleCount.value)

watch(initialVisibleCount, (value) => {
  visibleCount.value = value
})

const rowLoadCount = computed(() => columns.value * 2)

const visibleItems = computed(() => {
  const list = items.value ?? []
  return list.slice(0, visibleCount.value)
})

const hasMore = computed(() => visibleCount.value < (items.value?.length ?? 0))

function loadMore() {
  visibleCount.value = Math.min(
    visibleCount.value + rowLoadCount.value,
    items.value?.length ?? 0,
  )
}

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
    :class="{
      'page-section-reflections--full-page': fullPage,
      'page-section-reflections--has-background': hasBackgroundVideo,
    }"
    aria-label="Reflections"
    :style="sectionStyle"
  >
    <PageFixedBackground
      :source="section"
      prefix="reflectionsBackground"
      :title="`${resolvedTitle} background`"
      :fixed="fullPage"
    />

    <div class="page-section-reflections__content">
      <div class="page-section-reflections__header wrapper">
        <h3 class="page-section-reflections__title h3 serif light">
          {{ resolvedTitle }}
        </h3>
      </div>

      <div class="page-section-reflections__wall wrapper">
        <ReflectionWall
          :items="visibleItems"
          :pending="pending"
        />
      </div>

      <div class="page-section-reflections__footer wrapper">
        <button
          v-if="hasMore"
          type="button"
          class="page-section-reflections__action serif"
          @click="loadMore"
        >
          View more
        </button>
        <button
          type="button"
          class="page-section-reflections__action serif"
          @click="openModal"
        >
          Leave a reflection
        </button>
      </div>
    </div>

    <ReflectionSubmitModal
      :open="modalOpen"
      @close="closeModal"
    />
  </section>
</template>

<style scoped>
.page-section-reflections {
  position: relative;
  isolation: isolate;
  color: inherit;
}

.page-section-reflections--full-page {
  min-height: 100dvh;
}

.page-section-reflections--has-background {
  background: transparent;
}

.page-section-reflections__content {
  position: relative;
  z-index: 1;
}

.page-section-reflections__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: clamp(1rem, 3vw, 2rem);
}

.page-section-reflections__title {
  margin: 0;
  text-align: left;
}

.page-section-reflections__wall {
  padding-top: clamp(1rem, 2.5vw, 1.75rem);
}

.page-section-reflections__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding-top: clamp(1.25rem, 3vw, 2rem);
}

.page-section-reflections__action {
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.page-section-reflections__action:hover {
  opacity: 0.65;
}

.page-section-reflections__action:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
