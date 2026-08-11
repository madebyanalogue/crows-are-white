<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const title = computed(() => props.section?.synopsisTitle?.trim() || '')
const introBlocks = computed(() => props.section?.synopsisIntro || [])

const linkGroups = computed(() =>
  (props.section?.synopsisLinkGroups || [])
    .map((group, index) => ({
      _key: group._key || `synopsis-link-group-${index}`,
      title: group.title?.trim() || '',
      columns: splitLinkGroupItems(group.items || []),
    }))
    .filter((group) => group.title || group.columns.some((column) => column.length)),
)

const usefulLinks = computed(() =>
  (props.section?.synopsisUsefulLinks || [])
    .map((item, index) => ({
      _key: item._key || `synopsis-useful-link-${index}`,
      text: item.text?.trim() || '',
      url: item.url?.trim() || '',
    }))
    .filter((item) => item.text && item.url),
)

const buttons = computed(() =>
  (props.section?.synopsisButtons || [])
    .map((item, index) => ({
      _key: item._key || `synopsis-button-${index}`,
      text: item.linkTitle || '',
      link: {
        type: item.type,
        page: item.page,
        url: item.url,
      },
      isButton: item.style !== 'secondary',
      style: item.style === 'secondary' ? 'secondary' : 'primary',
    }))
    .filter((item) => item.text),
)

const galleryItems = computed(() =>
  (props.section?.synopsisGallery || [])
    .filter((item) => item?.image?.asset?._id)
    .map((item, index) => ({
      _key: item._key || `synopsis-gallery-${index}`,
      src: item.image.asset._id,
      width: item.image.asset.metadata?.dimensions?.width,
      height: item.image.asset.metadata?.dimensions?.height,
      alt: item.image.alt?.trim() || item.caption?.trim() || '',
      caption: item.caption?.trim() || '',
    })),
)

const hasContent = computed(() =>
  title.value
  || introBlocks.value.length
  || linkGroups.value.length
  || usefulLinks.value.length
  || buttons.value.length
  || galleryItems.value.length,
)

function splitLinkGroupItems(items) {
  const columns = [[]]

  for (const item of items) {
    if (item?.itemType === 'columnBreak') {
      columns.push([])
      continue
    }

    const label = item?.title?.trim() || ''
    const url = item?.url?.trim() || ''
    if (!label || !url) continue

    columns[columns.length - 1].push({
      _key: item._key,
      label,
      url,
    })
  }

  return columns.filter((column) => column.length)
}

function resolveButtonItem(button) {
  return {
    text: button.text,
    link: button.link,
    isButton: button.isButton,
  }
}
</script>

<template>
  <section
    v-if="hasContent"
    class="page-section-synopsis"
    aria-label="Synopsis"
  >
    <div class="page-section-synopsis__inner wrapper">
      <header
        v-if="title || introBlocks.length"
        class="page-section-synopsis__header"
      >
        <h2
          v-if="title"
          class="page-section-synopsis__title h2 serif light"
        >
          {{ title }}
        </h2>

        <SanityContent
          v-if="introBlocks.length"
          :blocks="introBlocks"
          class="page-section-synopsis__intro rich-text underline-links max-central-content"
        />
      </header>

      <div
        v-if="linkGroups.length"
        class="page-section-synopsis__link-groups"
      >
        <section
          v-for="group in linkGroups"
          :key="group._key"
          class="page-section-synopsis__link-group"
        >
          <h3
            v-if="group.title"
            class="page-section-synopsis__link-group-title h4 serif"
          >
            {{ group.title }}
          </h3>

          <div
            class="page-section-synopsis__link-columns"
            :class="{ 'page-section-synopsis__link-columns--single': group.columns.length === 1 }"
          >
            <ul
              v-for="(column, columnIndex) in group.columns"
              :key="`${group._key}-column-${columnIndex}`"
              class="page-section-synopsis__link-list"
            >
              <li
                v-for="link in column"
                :key="link._key"
              >
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="page-section-synopsis__external-link underline-links"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <div
        v-if="usefulLinks.length"
        class="page-section-synopsis__useful-links"
      >
        <h3 class="page-section-synopsis__useful-links-title h4 serif">
          Useful links
        </h3>

        <ul class="page-section-synopsis__useful-links-list">
          <li
            v-for="link in usefulLinks"
            :key="link._key"
          >
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="page-section-synopsis__external-link underline-links"
            >
              {{ link.text }}
            </a>
          </li>
        </ul>
      </div>

      <div
        v-if="buttons.length"
        class="page-section-synopsis__buttons"
      >
        <MenuLink
          v-for="button in buttons"
          :key="button._key"
          :item="resolveButtonItem(button)"
          :link-class="[
            'page-section-synopsis__button',
            button.style === 'secondary'
              ? 'page-section-synopsis__button--secondary'
              : 'page-section-synopsis__button--primary',
          ]"
          :show-arrow="false"
        />
      </div>

      <SynopsisImageCarousel
        v-if="galleryItems.length"
        class="page-section-synopsis__gallery"
        :items="galleryItems"
      />
    </div>
  </section>
</template>

<style scoped>
.page-section-synopsis {
  padding: var(--section-padding) 0;
}

.page-section-synopsis__inner {
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);
}

.page-section-synopsis__header {
  display: grid;
  gap: 1rem;
}

.page-section-synopsis__title {
  margin: 0;
}

.page-section-synopsis__intro :deep(p) {
  margin: 0;
}

.page-section-synopsis__intro :deep(p + p) {
  margin-top: 0.85rem;
}

.page-section-synopsis__link-groups {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.25rem);
}

.page-section-synopsis__link-group {
  display: grid;
  gap: 0.85rem;
}

.page-section-synopsis__link-group-title,
.page-section-synopsis__useful-links-title {
  margin: 0;
}

.page-section-synopsis__link-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem clamp(1.5rem, 4vw, 3rem);
}

.page-section-synopsis__link-columns--single {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 699px) {
  .page-section-synopsis__link-columns:not(.page-section-synopsis__link-columns--single) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.page-section-synopsis__link-list,
.page-section-synopsis__useful-links-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.page-section-synopsis__external-link {
  display: inline-block;
}

.page-section-synopsis__useful-links {
  display: grid;
  gap: 0.85rem;
}

.page-section-synopsis__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.page-section-synopsis__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  font: inherit;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.page-section-synopsis__button--primary {
  border: 1px solid var(--text-color, #111010);
  background: var(--text-color, #111010);
  color: var(--background-color, #fff);
}

.page-section-synopsis__button--secondary {
  border: 1px solid color-mix(in srgb, var(--text-color, #111010) 18%, transparent);
  color: inherit;
}

.page-section-synopsis__gallery {
  width: 100%;
}
</style>
