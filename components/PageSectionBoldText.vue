<script setup>
import { toCssColor } from '~/utils/pageColors'

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

function resolveTextStyle(style) {
  return style === 'condensed' ? 'condensed' : 'serif'
}

function resolveColumn(item, index) {
  if (!item) return null

  const textLines = (item.textLines || [])
    .map((line, lineIndex) => {
      const text = line?.text?.trim()
      if (!text) return null

      return {
        _key: line._key || `bold-text-line-${index}-${lineIndex}`,
        text,
        style: resolveTextStyle(line?.style),
      }
    })
    .filter(Boolean)

  if (!textLines.length) return null

  return {
    _key: item._key || `bold-text-column-${index}`,
    textColor: toCssColor(item.textColor, 'obsidian'),
    textLines,
  }
}

const columns = computed(() =>
  (props.section?.boldTextItems || [])
    .map((item, index) => resolveColumn(item, index))
    .filter(Boolean),
)

const hasContent = computed(() => columns.value.length > 0)
const useTwoUp = computed(() => columns.value.length >= 2)

const sectionStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.boldTextPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.boldTextPaddingBottom)],
}))

function lineClass(style) {
  return style === 'condensed'
    ? 'page-section-bold-text__line page-section-bold-text__line--condensed condensed'
    : 'page-section-bold-text__line page-section-bold-text__line--serif serif light'
}
</script>

<template>
  <section
    v-if="hasContent"
    class="page-section-bold-text"
    :style="sectionStyle"
  >
    <div class="page-section-bold-text__inner wrapper">
      <ul
        class="page-section-bold-text__grid"
        :class="{ 'page-section-bold-text__grid--two-up': useTwoUp }"
      >
        <li
          v-for="column in columns"
          :key="column._key"
          class="page-section-bold-text__column"
          :style="{ color: column.textColor }"
        >
          <div class="page-section-bold-text__lines">
            <p
              v-for="line in column.textLines"
              :key="line._key"
              :class="lineClass(line.style)"
            >
              {{ line.text }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.page-section-bold-text__inner {
  width: 100%;
}

.page-section-bold-text__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4rem);
  list-style: none;
  margin: 0;
  padding: 0;
}

.page-section-bold-text__grid--two-up {
  max-width: 1600px;
  margin: 0 auto;
}

.page-section-bold-text__column {
  min-width: 0;
}

.page-section-bold-text__lines {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  text-align: center;
  gap: 0rem;
}

.page-section-bold-text__line {
  margin: 0;
  white-space: pre-line;
}

.page-section-bold-text__line--condensed {
    font-size: clamp(38px, 5vw, 93px);
    line-height: 0.875;
    margin-bottom: .5rem;
}

.page-section-bold-text__line--serif {
  font-size: clamp(19px, 2vw, 33px);
    margin: 0.75em 0;
    letter-spacing: 0.01em;
}

.page-section-bold-text__line--serif:first-child {
  margin-top: 0;
}

@media (min-width: 700px) {
  .page-section-bold-text__grid--two-up {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
