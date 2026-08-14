<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const title = computed(() => props.section?.synopsisTitle?.trim() || '')
const introBlocks = computed(() => props.section?.synopsisIntro || [])

const linkGroupLayout = computed(() =>
  buildSynopsisLinkGroupLayout(props.section?.synopsisLinkGroups || []),
)

const linkGroupColumns = computed(() => linkGroupLayout.value.columns)
const legacyLinkGroupRows = computed(() => linkGroupLayout.value.legacyRows)

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

const synopsisAutoplayIntervalMs = computed(() => {
  const seconds = Number(props.section?.synopsisGalleryAutoplayInterval)
  if (!Number.isFinite(seconds) || seconds <= 0) return 5000
  return Math.min(60, Math.max(2, seconds)) * 1000
})

const hasContent = computed(() =>
  title.value
  || introBlocks.value.length
  || linkGroupColumns.value.length
  || legacyLinkGroupRows.value.length
  || usefulLinks.value.length
  || buttons.value.length
  || galleryItems.value.length,
)

function normalizeSynopsisLink(entry, index) {
  const label = entry?.title?.trim() || ''
  const url = entry?.url?.trim() || ''
  if (!label) return null

  return {
    _key: entry._key || `synopsis-link-${index}`,
    label,
    url,
  }
}

function normalizeSynopsisLinkGroup(group, index) {
  const linkEntries = group.links?.length
    ? group.links
    : (group.items || []).filter((item) => item?.itemType !== 'columnBreak')

  const links = linkEntries
    .map((entry, linkIndex) => normalizeSynopsisLink(entry, linkIndex))
    .filter(Boolean)

  const titleValue = group.title?.trim() || ''
  if (!titleValue && !links.length) return null

  return {
    _key: group._key || `synopsis-link-group-${index}`,
    title: titleValue,
    links,
  }
}

function buildSynopsisLinkGroupLayout(entries) {
  if (!entries.length) return { columns: [], legacyRows: [] }

  const usesTopLevelColumnBreaks = entries.some((entry) =>
    entry?._type === 'synopsisLinkGroupColumnBreak',
  )

  if (usesTopLevelColumnBreaks) {
    const columnGroups = [[]]

    entries.forEach((entry, index) => {
      if (entry?._type === 'synopsisLinkGroupColumnBreak') {
        columnGroups.push([])
        return
      }

      const group = normalizeSynopsisLinkGroup(entry, index)
      if (group) columnGroups[columnGroups.length - 1].push(group)
    })

    return {
      columns: columnGroups
        .filter((groups) => groups.length)
        .map((groups, index) => ({
          _key: groups.map((group) => group._key).join('-') || `synopsis-link-group-column-${index}`,
          groups,
        })),
      legacyRows: [],
    }
  }

  return {
    columns: [],
    legacyRows: entries
      .map((group, index) => {
        const normalized = normalizeSynopsisLinkGroup(group, index)
        if (!normalized) return null

        return {
          _key: normalized._key,
          groups: [{
            ...normalized,
            columns: splitLegacyLinkGroupItems(group.items || []),
          }],
        }
      })
      .filter(Boolean),
  }
}

function splitLegacyLinkGroupItems(items) {
  const columns = [[]]

  for (const item of items) {
    if (item?.itemType === 'columnBreak') {
      columns.push([])
      continue
    }

    const link = normalizeSynopsisLink(item, columns.length)
    if (!link) continue

    columns[columns.length - 1].push(link)
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



      <div
        v-if="buttons.length"
        class="page-section-synopsis__buttons-row"
      >
        <div class="page-section-synopsis__buttons">
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
      </div>

      <!-- <div
        v-if="linkGroupColumns.length || legacyLinkGroupRows.length"
        class="page-section-synopsis__link-groups"
      >
        <div
          v-if="linkGroupColumns.length"
          class="page-section-synopsis__link-group-row page-section-synopsis__link-group-row--columns"
        >
          <div
            v-for="column in linkGroupColumns"
            :key="column._key"
            class="page-section-synopsis__link-group-column"
          >
            <section
              v-for="group in column.groups"
              :key="group._key"
              class="page-section-synopsis__link-group"
            >
              <h3
                v-if="group.title"
                class="page-section-synopsis__link-group-title serif"
              >
                {{ group.title }}
              </h3>

              <ul
                v-if="group.links?.length"
                class="page-section-synopsis__link-list"
              >
                <li
                  v-for="link in group.links"
                  :key="link._key"
                >
                  <a
                    v-if="link.url"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="page-section-synopsis__external-link"
                  >
                    {{ link.label }}
                  </a>
                  <span
                    v-else
                    class="page-section-synopsis__link-label"
                  >
                    {{ link.label }}
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <template v-else>
          <div
            v-for="row in legacyLinkGroupRows"
            :key="row._key"
            class="page-section-synopsis__link-group-row"
          >
          <section
            v-for="group in row.groups"
            :key="group._key"
            class="page-section-synopsis__link-group"
          >
            <h3
              v-if="group.title"
              class="page-section-synopsis__link-group-title serif"
            >
              {{ group.title }}
            </h3>

            <div
              v-if="group.columns?.length"
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
                    v-if="link.url"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="page-section-synopsis__external-link"
                  >
                    {{ link.label }}
                  </a>
                  <span
                    v-else
                    class="page-section-synopsis__link-label"
                  >
                    {{ link.label }}
                  </span>
                </li>
              </ul>
            </div>

            <ul
              v-else-if="group.links?.length"
              class="page-section-synopsis__link-list"
            >
              <li
                v-for="link in group.links"
                :key="link._key"
              >
                <a
                  v-if="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="page-section-synopsis__external-link"
                >
                  {{ link.label }}
                </a>
                <span
                  v-else
                  class="page-section-synopsis__link-label"
                >
                  {{ link.label }}
                </span>
              </li>
            </ul>
          </section>
          </div>
        </template>
      </div> -->

      <div
        v-if="title || introBlocks.length || usefulLinks.length || galleryItems.length"
        class="page-section-synopsis__body"
      >
        <SynopsisImageCarousel
          v-if="galleryItems.length"
          class="page-section-synopsis__gallery"
          :items="galleryItems"
          :autoplay="section.synopsisGalleryAutoplay === true"
          :autoplay-interval-ms="synopsisAutoplayIntervalMs"
        />

        <div
          v-if="title || introBlocks.length || usefulLinks.length"
          class="page-section-synopsis__copy"
          :class="{ 'page-section-synopsis__copy--full': !galleryItems.length }"
        >
          <div
            v-if="title || introBlocks.length"
            class="page-section-synopsis__text"
          >
            <h2
              v-if="title"
              class="page-section-synopsis__title serif light"
            >
              {{ title }}
            </h2>

            <SanityContent
              v-if="introBlocks.length"
              :blocks="introBlocks"
              class="page-section-synopsis__intro serif light"
            />
          </div>

          <ul
            v-if="usefulLinks.length"
            class="page-section-synopsis__useful-links"
          >
            <li
              v-for="link in usefulLinks"
              :key="link._key"
            >
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="page-section-synopsis__useful-link underline-links"
              >
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-section-synopsis {
  --synopsis-text-size: 22px;
  --synopsis-text-line-height: 1.5;
  --synopsis-link-group-gap: 2.7em;
  padding: 65px 0 240px;
  letter-spacing: 0.04em;
}

.page-section-synopsis__inner {
  display: grid;
  gap:180px;
}

.page-section-synopsis__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.5rem, 0vw, 10rem);
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.page-section-synopsis__title {
  margin: 0;
  font-size: var(--synopsis-text-size);
  font-weight: 300;
  line-height: var(--synopsis-text-line-height);
}

.page-section-synopsis__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: var(--synopsis-text-size);
  line-height: var(--synopsis-text-line-height);
  max-width: 510px;
  gap: 3rem;
  margin: 0 auto;
}

.page-section-synopsis__text {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 0.5em;
}

.page-section-synopsis__copy--full {
  grid-column: 1 / -1;
}

.page-section-synopsis__gallery {
  width: 100%;
  min-width: 0;
}

.page-section-synopsis__intro {
  letter-spacing: 0.025em;
  opacity: 0.65;
}

.page-section-synopsis__intro :deep(p),
.page-section-synopsis__intro :deep(li),
.page-section-synopsis__intro :deep(blockquote),
.page-section-synopsis__intro :deep(h1),
.page-section-synopsis__intro :deep(h2),
.page-section-synopsis__intro :deep(h3),
.page-section-synopsis__intro :deep(h4),
.page-section-synopsis__intro :deep(h5),
.page-section-synopsis__intro :deep(h6) {
  font-size: inherit;
  line-height: inherit;
}

.page-section-synopsis__intro :deep(p) {
  margin: 0;
}

.page-section-synopsis__intro :deep(p + p) {
  margin-top: 0.85rem;
}

@media (max-width: 699px) {
  .page-section-synopsis__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .page-section-synopsis__copy--full {
    grid-column: auto;
  }
}

.page-section-synopsis__link-groups {
  display: grid;
  gap: var(--synopsis-link-group-gap);
}

.page-section-synopsis__link-group-row {
  display: grid;
  gap: var(--synopsis-link-group-gap);
}

.page-section-synopsis__link-group-row--columns {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  gap: var(--synopsis-link-group-gap);
}

.page-section-synopsis__link-group-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--synopsis-link-group-gap);
  flex: 1 1 calc(50% - var(--synopsis-link-group-gap) / 2);
  max-width: calc(50% - var(--synopsis-link-group-gap) / 2);
  min-width: 0;
}

@media (min-width: 700px) {
  .page-section-synopsis__link-group-column {
    flex: 1 1 calc(33.333% - (var(--synopsis-link-group-gap) * 2 / 3));
    max-width: calc(33.333% - (var(--synopsis-link-group-gap) * 2 / 3));
  }
}

@media (min-width: 1000px) {
  .page-section-synopsis__link-group-column {
    flex: 1 1 0;
    max-width: none;
  }
}

.page-section-synopsis__link-group {
  display: grid;
  gap: 0;
  width: 100%;
  text-align: center;
}

.page-section-synopsis__link-group-title {
  margin: 0;
  width: 100%;
  text-align: center;
  font-family: var(--serif);
  font-size: var(--synopsis-text-size);
  font-weight: 300;
  line-height: var(--synopsis-text-line-height);
}

.page-section-synopsis__link-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem clamp(1.5rem, 4vw, 3rem);
  width: 100%;
  text-align: center;
}

.page-section-synopsis__link-columns--single {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 699px) {
  .page-section-synopsis__link-columns:not(.page-section-synopsis__link-columns--single) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.page-section-synopsis__link-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  text-align: center;
}

.page-section-synopsis__external-link,
.page-section-synopsis__link-label {
  display: inline-block;
  font-family: var(--serif);
  font-size: var(--synopsis-text-size);
  font-weight: 300;
  line-height: var(--synopsis-text-line-height);
  color: inherit;
  text-decoration: none;
  opacity: 0.65;
  transition: opacity 0.3s ease;
}

.page-section-synopsis__external-link:hover,
.page-section-synopsis__external-link:focus-visible {
  opacity: 1;
}

.page-section-synopsis__useful-links {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.65rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.page-section-synopsis__useful-link {
  display: inline-block;
  font-family: var(--serif);
  font-size: var(--synopsis-text-size);
  font-weight: inherit;
  line-height: var(--synopsis-text-line-height);
  color: inherit;
  font-weight: 300;
  text-decoration: underline;
  text-underline-offset: 0.3em;
  text-decoration-thickness: 0.5px;
  transition: opacity 0.3s ease;
  opacity: 1;
}
.page-section-synopsis__useful-link:hover {
  opacity: 0.65;
  text-decoration-thickness: 0px;
}
.page-section-synopsis__buttons-row {
  display: flex;
  justify-content: center;
}

.page-section-synopsis__buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px 25px;
  width: min(100%, var(--site-header-panel-width-closed, 680px));
}

.page-section-synopsis__buttons :deep(.menu-link) {
  display: flex;
  width: 100%;
  padding: 0;
  line-height: 1;
  font-size: 17px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 300;
  min-width: 290px;
}

.page-section-synopsis__buttons :deep(.menu-link__content),
.page-section-synopsis__buttons :deep(.menu-link__label) {
  display: block;
  width: 100%;
}

.page-section-synopsis__buttons :deep(.menu-link__underline) {
  display: none;
}

.page-section-synopsis__button {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 50px;
  padding: 0.85rem 1.25rem;
  border-radius: 0;
  font-family: var(--serif);
  font-size: var(--header);
  line-height: 1.1;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    filter 0.25s ease;
}

.page-section-synopsis__button--primary {
  background-color: var(--text-color, #111010);
  border: 1px solid var(--text-color, #111010);
  color: var(--background-color, #fff);
}

.page-section-synopsis__button--primary:hover {
  filter: brightness(1.05);
}

.page-section-synopsis__button--secondary {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--text-color, #111010);
  color: var(--text-color, #111010);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(20px);
}

.page-section-synopsis__button--secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

@media (min-width: 700px) {
  .page-section-synopsis__buttons {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: auto;
    max-width: 100%;
  }

  .page-section-synopsis__buttons :deep(.menu-link) {
    width: auto;
  }

  .page-section-synopsis__buttons :deep(.menu-link__content),
  .page-section-synopsis__buttons :deep(.menu-link__label) {
    width: auto;
  }

  .page-section-synopsis__button {
    width: auto;
    min-width: 12rem;
  }
}
</style>
