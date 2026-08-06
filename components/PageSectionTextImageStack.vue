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
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') return value
  if (value === false) return 'none'
  return 'large'
}

const textBlocks = computed(() => props.section?.textImageStackText || [])
const images = computed(() => (props.section?.textImageStackImages || []).filter((item) => item?.image?.asset?._id))
const reverseOrder = computed(() => props.section?.textImageStackReverseOrder === true)
const hasContent = computed(() => textBlocks.value.length > 0 || images.value.length > 0)

const sectionStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.textImageStackPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.textImageStackPaddingBottom)],
}))

function imageSrc(item) {
  return item?.image?.asset?._id || ''
}

function imageWidth(item) {
  return item?.image?.asset?.metadata?.dimensions?.width
}

function imageHeight(item) {
  return item?.image?.asset?.metadata?.dimensions?.height
}

function imageAlt(item) {
  const alt = item?.image?.alt
  if (typeof alt === 'string' && alt.trim()) return alt.trim()
  return item?.caption || ''
}
</script>

<template>
  <section
    v-if="hasContent"
    class="page-section-text-image-stack"
    :style="sectionStyle"
  >
    <div class="page-section-columns wrapper">
      <div
        class="page-section-columns__layout"
        :class="{ 'page-section-columns__layout--reversed': reverseOrder }"
      >
        <div
          v-if="textBlocks.length"
          class="page-section-columns__text"
        >
          <SanityContent
            :blocks="textBlocks"
            class="rich-text max-text-block-width"
          />
        </div>

        <div
          v-if="images.length"
          class="page-section-columns__images"
        >
          <figure
            v-for="item in images"
            :key="item._key"
            class="page-section-columns__figure"
          >
            <AppImage
              :src="imageSrc(item)"
              :width="imageWidth(item)"
              :height="imageHeight(item)"
              :alt="imageAlt(item)"
              class="page-section-columns__img"
              sizes="half"
            />
            <figcaption
              v-if="item.caption"
              class="page-section-columns__caption caption"
            >
              {{ item.caption }}
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>
</template>
