<script setup lang="ts">
import { faqItems } from '~/data/site'
</script>

<template>
  <div class="page-section max-w-3xl">
    <PageHeader title="FAQ" subtitle="Frequently asked questions about screenings, press, and streaming." />

    <div class="space-y-4">
      <details
        v-for="(item, i) in faqItems"
        :key="item.q"
        class="group surface"
        :open="i === 0"
      >
        <summary class="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-base font-semibold">
          {{ item.q }}
          <span class="text-wire-muted transition-transform group-open:rotate-180">▾</span>
        </summary>
        <p class="border-t-2 border-wire-border px-6 pb-6 pt-4 text-base leading-relaxed text-wire-muted">{{ item.a }}</p>
      </details>
    </div>
  </div>
</template>
