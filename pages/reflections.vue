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

const introText = computed(() => {
  const richText = page.value?.richText
  if (Array.isArray(richText) && richText.length) return null
  return [
    'Visitors from around the world have left their reflections.',
    'Read a few, or leave one of your own.',
  ]
})

function openModal() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}
</script>

<template>
  <article class="reflections-page">
    <div class="wrapper">
      <header class="reflections-page__header page-content__intro page-content__intro--single grid-1">
        <div class="page-content__intro-title text-center">
          <h1 class="h1 serif light">
            {{ page?.title || 'Reflections' }}
          </h1>
        </div>

        <SanityContent
          v-if="page?.richText?.length"
          :blocks="page.richText"
          class="rich-text underline-links page-content__intro-copy max-central-content"
        />
        <div
          v-else-if="introText"
          class="reflections-page__intro max-central-content"
        >
          <p
            v-for="(paragraph, index) in introText"
            :key="index"
          >
            {{ paragraph }}
          </p>
        </div>

        <div class="reflections-page__actions">
          <button
            type="button"
            class="reflections-page__submit"
            @click="openModal"
          >
            Leave a reflection
          </button>
        </div>
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
  </article>
</template>

<style scoped>
.reflections-page {
  min-height: 100dvh;
  background: var(--background-color, #fff);
  color: var(--text-color, #111010);
  padding-bottom: var(--section-padding);
}

.reflections-page__intro {
  text-align: center;
  color: color-mix(in srgb, var(--text-color, #111010) 72%, transparent);
}

.reflections-page__intro p {
  margin: 0;
}

.reflections-page__intro p + p {
  margin-top: 0.45rem;
}

.reflections-page__actions {
  display: flex;
  justify-content: center;
  padding-top: 0.75rem;
}

.reflections-page__submit {
  border: 1px solid var(--text-color, #111010);
  border-radius: 999px;
  padding: 0.72rem 1.2rem;
  background: var(--text-color, #111010);
  color: var(--background-color, #fff);
  font: inherit;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.reflections-page__wall {
  padding-top: clamp(1rem, 2.5vw, 1.75rem);
}
</style>
