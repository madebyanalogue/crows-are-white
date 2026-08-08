<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
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

const title = computed(() =>
  props.section?.ugcTitle?.trim() || 'The Journey Continues',
)

const limit = computed(() => {
  const value = Number(props.section?.ugcMaxItems)
  if (!Number.isFinite(value) || value <= 0) return 24
  return Math.min(Math.max(Math.round(value), 1), 100)
})

const sectionStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.ugcPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.ugcPaddingBottom)],
}))

const { items, pending } = useUgcSubmissions(limit.value)
</script>

<template>
  <section
    class="page-section-ugc"
    aria-label="Community photos"
    :style="sectionStyle"
  >
    <div class="page-section-ugc__header wrapper">
      <h2 class="page-section-ugc__title serif">
        {{ title }}
      </h2>
    </div>

    <UgcPolaroidCarousel
      :items="items"
      :pending="pending"
      aria-label="Community polaroid carousel"
    />
  </section>
</template>

<style scoped>
.page-section-ugc {
  color: inherit;
}

.page-section-ugc__header {
  margin-bottom: clamp(0.5rem, 2vw, 1.25rem);
}

.page-section-ugc__title {
  margin: 0;
  padding: 0 clamp(1rem, 3vw, 2rem);
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  font-weight: 300;
  letter-spacing: 0.03em;
  text-align: center;
}
</style>
