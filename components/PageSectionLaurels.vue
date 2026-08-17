<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'

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

const items = computed(() =>
  (props.section?.laurelsItems || [])
    .map((item, index) => {
      const imageUrl = resolveSanityAssetUrl(item?.image?.asset)
      if (!imageUrl) return null

      return {
        _key: item._key || `laurel-${index}`,
        imageUrl,
        alt: item?.alt?.trim() || item?.image?.alt?.trim() || '',
      }
    })
    .filter(Boolean),
)

const sectionPaddingStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.laurelsPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.laurelsPaddingBottom)],
}))
</script>

<template>
  <section
    v-if="items.length"
    class="page-section-laurels"
    :style="sectionPaddingStyle"
  >
    <div class="page-section-laurels__inner wrapper">
      <ul class="page-section-laurels__list">
        <li
          v-for="item in items"
          :key="item._key"
          class="page-section-laurels__item"
        >
          <img
            class="page-section-laurels__image"
            :src="item.imageUrl"
            :alt="item.alt"
            loading="lazy"
            draggable="false"
          >
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.page-section-laurels__inner {
  width: 100%;
}

.page-section-laurels__list {
  --laurels-gap: 20px;
  --laurels-columns: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: start;
  gap: var(--laurels-gap);
  list-style: none;
  margin: 0;
  padding: 0;
}

.page-section-laurels__item {
  flex: 0 0 auto;
  width: min(
    200px,
    calc(
      (100% - (var(--laurels-columns) - 1) * var(--laurels-gap))
      / var(--laurels-columns)
    )
  );
}

.page-section-laurels__image {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 700px) {
  .page-section-laurels__list {
    --laurels-columns: 3;
  }
}

@media (min-width: 1000px) {
  .page-section-laurels__list {
    --laurels-columns: 6;
  }

  .page-section-laurels__item {
    flex: 0 0 auto;
    width: min(
      320px,
      calc(
        (100% - (var(--laurels-columns) - 1) * var(--laurels-gap))
        / var(--laurels-columns)
      )
    );
  }
}
</style>
