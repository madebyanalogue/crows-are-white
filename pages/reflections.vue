<script setup>
import { extractPageChromeColors } from '~/utils/pageColors'

definePageMeta({
  removeHeaderPadding: false,
})

const REFLECTIONS_PAGE_COLORS_FALLBACK = {
  pageColor: 'crema',
  pageTextColor: 'obsidian',
  menuBackgroundColor: 'crema',
  menuTextColor: 'obsidian',
  menuHighlightColor: 'obsidian',
  basketIconColor: 'obsidian',
}

const { data: page } = await useCmsPage('reflections')

const pageTitle = useState('pageTitle', () => '')

watchEffect(() => {
  pageTitle.value = page.value?.title || 'Reflections'
})

usePageSeo(page)

usePageColor(computed(() =>
  page.value ? extractPageChromeColors(page.value) : REFLECTIONS_PAGE_COLORS_FALLBACK,
))

const modalOpen = ref(false)
const { items, pending } = useReflections(500)

const hasBackgroundVideo = computed(() => page.value?.pageBackgroundMediaType === 'video')

function openModal() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}
</script>

<template>
  <article
    class="reflections-page"
    :class="{ 'reflections-page--has-background': hasBackgroundVideo }"
  >
    <PageFixedBackground
      :page="page"
      title="Reflections background"
    />

    <div class="reflections-page__content">
      <div class="wrapper">
        <header class="reflections-page__header">
          <div class="reflections-page__intro">
            <h3 class="reflections-page__title h3 serif light">
              {{ page?.title || 'Reflections' }}
            </h3>
          </div>

          <button
            type="button"
            class="reflections-page__submit serif"
            @click="openModal"
          >
            Leave a reflection
          </button>
        </header>
      </div>

    <div class="wrapper reflections-page__wall">
      <ReflectionWall
        :items="items"
        :pending="pending"
      />
    </div>

    <ReflectionSubmitModal
      :open="modalOpen"
      @close="closeModal"
    />
    </div>
  </article>
</template>

<style scoped>
.reflections-page {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  background: var(--background-color, #fff);
  color: var(--text-color, #111010);
  padding-bottom: var(--section-padding);
}

.reflections-page--has-background {
  background: transparent;
}

.reflections-page__content {
  position: relative;
  z-index: 1;
}

.reflections-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: clamp(1rem, 3vw, 2rem);
  padding-top: var(--page-top-offset);
}

.reflections-page__intro {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
}

.reflections-page__title {
  margin: 0;
}

.reflections-page__submit {
  flex-shrink: 0;
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

.reflections-page__submit:hover {
  opacity: 0.65;
}

.reflections-page__submit:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.reflections-page__wall {
  padding-top: clamp(1rem, 2.5vw, 1.75rem);
}
</style>
