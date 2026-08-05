<template>
  <section
    v-if="filmIds"
    class="section-assemble-widget"
    :style="sectionPaddingStyle"
  >
    <div class="wrapper">
      <ClientOnly>
        <AssembleWidget
          :film-ids="filmIds"
          :countries="countries"
          :tabs="tabs"
          :style-preset="stylePreset"
          :primary-color="primaryColor"
          :secondary-color="secondaryColor"
          :background-color="backgroundColor"
          :mx-id="mxId"
        />
      </ClientOnly>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const filmIds = computed(() => String(props.section?.assembleWidgetFilmIds || '').trim())
const countries = computed(() => props.section?.assembleWidgetCountries || [])
const tabs = computed(() => props.section?.assembleWidgetTabs || ['local', 'cities', 'playdates'])
const stylePreset = computed(() => props.section?.assembleWidgetStyle || 'basic')
const primaryColor = computed(() => props.section?.assembleWidgetPrimaryColor || '#00aacc')
const secondaryColor = computed(() => props.section?.assembleWidgetSecondaryColor || '#666666')
const backgroundColor = computed(() => props.section?.assembleWidgetBackgroundColor || '#ffffff')
const mxId = computed(() => String(props.section?.assembleWidgetMxId || '').trim())

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

const sectionPaddingStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.assembleWidgetPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.assembleWidgetPaddingBottom)],
}))
</script>
