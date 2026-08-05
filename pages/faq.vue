<script setup lang="ts">
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'FAQ'

usePageColor(ref(null))

const { faqItems } = useSiteContent()
</script>

<template>
  <DefaultPage
    title="FAQ"
    subtitle="Frequently asked questions about screenings, press, and streaming."
  >
    <div class="faq-list">
      <details
        v-for="(item, i) in faqItems"
        :key="item.q"
        class="faq-item"
        :open="i === 0"
      >
        <summary class="faq-item__question">
          {{ item.q }}
          <span class="faq-item__chevron" aria-hidden="true">▾</span>
        </summary>
        <p class="faq-item__answer">{{ item.a }}</p>
      </details>
    </div>
  </DefaultPage>
</template>

<style scoped>
.faq-list {
  display: grid;
  gap: 0.75rem;
}

.faq-item {
  border: 1px solid color-mix(in srgb, var(--text-color, #111010) 14%, transparent);
  background: #fff;
}

.faq-item__question {
  display: flex;
  cursor: pointer;
  list-style: none;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  font-weight: 600;
}

.faq-item__question::-webkit-details-marker {
  display: none;
}

.faq-item__chevron {
  flex-shrink: 0;
  color: color-mix(in srgb, var(--text-color, #111010) 58%, transparent);
  transition: transform 0.2s ease;
}

.faq-item[open] .faq-item__chevron {
  transform: rotate(180deg);
}

.faq-item__answer {
  margin: 0;
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid color-mix(in srgb, var(--text-color, #111010) 14%, transparent);
  padding-top: 1rem;
  color: color-mix(in srgb, var(--text-color, #111010) 72%, transparent);
}
</style>
