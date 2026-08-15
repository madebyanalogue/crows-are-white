<template>
  <section v-if="hasContent">
    <div
      class="contact-information-content"
      :style="sectionStyle"
    >
      <div class="wrapper">
        <div class="grid-1 gap-section">
          <div
            v-if="titleBlocks.length || subtitle"
            class="contact-information__header grid-1 gap-3 text-center"
          >
            <div v-if="titleBlocks.length" class="serif h2">
              <SanityContent :blocks="titleBlocks" />
            </div>

            <p v-if="subtitle" class="h5 contact-information__subtitle serif">
              {{ subtitle }}
            </p>
          </div>

          <div
            v-if="items.length"
            class="contact-information__table"
            role="table"
          >
            <div
              class="contact-information__table-head"
              role="row"
            >
              <span
                class="contact-information__cell contact-information__cell--title"
                role="columnheader"
              >
                Contact
              </span>
              <span
                class="contact-information__cell contact-information__cell--description"
                role="columnheader"
              >
                Details
              </span>
              <span
                class="contact-information__cell contact-information__cell--link"
                role="columnheader"
              >
                <span class="sr-only">Link</span>
              </span>
            </div>

            <div
              v-for="item in items"
              :key="item._key"
              class="contact-information__table-row"
              role="row"
            >
              <div
                class="contact-information__cell contact-information__cell--title"
                role="cell"
              >
                <h3 v-if="item.title" class="contact-information__item-title handwritten">
                  {{ item.title }}
                </h3>
              </div>

              <div
                class="contact-information__cell contact-information__cell--description"
                role="cell"
              >
                <SanityContent
                  v-if="Array.isArray(item.description) && item.description.length"
                  :blocks="item.description"
                />
                <p
                  v-else-if="item.description"
                  class="contact-information__item-description"
                >
                  {{ item.description }}
                </p>
              </div>

              <div
                class="contact-information__cell contact-information__cell--link"
                role="cell"
              >
                <MenuLink
                  v-if="hasContactLink(item)"
                  :item="toMenuItem(item)"
                  :show-arrow="false"
                  class="menu-link--underline contact-information__link"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'

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

const sectionStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.contactInformationPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.contactInformationPaddingBottom)],
}))

const { whatsappUrl } = useSiteSettings()
const { getMenuItemUrl } = useMenuLinks()

const titleBlocks = computed(() => props.section?.contactInformationTitle ?? [])
const subtitle = computed(() => props.section?.contactInformationSubtitle?.trim() || '')
const items = computed(() => props.section?.contactInformationItems ?? [])

const hasContent = computed(
  () => titleBlocks.value.length > 0 || Boolean(subtitle.value) || items.value.length > 0,
)

function toMenuItem(item) {
  return {
    _key: item._key,
    text: item.linkText,
    link: item.link,
  }
}

function hasContactLink(item) {
  if (!item?.linkText || !item?.link?.type) return false
  if (item.link.type === 'whatsapp') return Boolean(whatsappUrl.value)
  if (item.link.type === 'contactForm') return true

  const href = getMenuItemUrl(toMenuItem(item))
  return Boolean(href && href !== '#')
}
</script>

<style scoped>
.contact-information__subtitle {
  margin: 0;
}

.contact-information__table {
  --contact-information-title-font-size: clamp(24px, 4vw, 40px);
  --contact-information-description-font-size: clamp(16px, 2vw, 18px);
  --contact-information-link-font-size: var(--contact-information-description-font-size);
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
}

.contact-information__table-head,
.contact-information__table-row {
  display: grid;
  grid-template-columns: minmax(7rem, 0.9fr) minmax(0, 1.6fr) minmax(0, 0.8fr);
  gap: clamp(1rem, 2vw, 2rem);
  align-items: start;
  padding: clamp(1rem, 2vw, 1.35rem) 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
}

.contact-information__table-head {
  display: none;
  font-family: var(--sans);
  font-size: clamp(11px, 0.95vw, 13px);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.58;
}

.contact-information__cell {
  min-width: 0;
}

.contact-information__item-title {
  margin: 0;
  font-size: var(--contact-information-title-font-size);
}

.contact-information__item-description {
  margin: 0;
  font-size: var(--contact-information-description-font-size);
}

.contact-information__cell--description :deep(p),
.contact-information__cell--description :deep(li) {
  font-size: var(--contact-information-description-font-size);
}

.contact-information__cell--link :deep(.contact-information__link) {
  font-size: var(--contact-information-link-font-size);
}

.contact-information__cell--link :deep(.contact-information__link .menu-link__underline) {
  bottom: -0.05em;
}

.contact-information__cell--link {
  justify-self: start;
}

.contact-information__cell :deep(p) {
  margin: 0;
}

.contact-information__cell :deep(p + p) {
  margin-top: 0.65rem;
}

@media (min-width: 700px) {
  .contact-information__table-head {
    display: grid;
  }

  .contact-information__table-row {
    align-items: center;
  }

  .contact-information__cell--link {
    justify-self: end;
    text-align: right;
  }
}

@media (max-width: 699px) {
  .contact-information__table-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .contact-information__cell--link {
    padding-top: 0.15rem;
  }
}
</style>
