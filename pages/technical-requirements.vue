<script setup lang="ts">
import {
  requiredFromClient,
  requiredFromDesigner,
  suggestedOpenGraph,
  suggestedSeo,
  technicalRequirementGroups,
} from '~/data/technical-requirements'
</script>

<template>
  <div class="page-section">
    <PageHeader
      title="Technical Requirements"
      subtitle="Consolidated from the revised client brief and Ahsen's feedback (June 9, 2026)."
    />

    <div class="space-y-6">
      <section
        v-for="group in technicalRequirementGroups"
        :key="group.id"
        class="surface-card grid gap-8 md:grid-cols-[minmax(12rem,1fr)_2.5fr] md:gap-12"
      >
        <h2 class="text-xl font-semibold text-wire-ink md:pt-1">{{ group.title }}</h2>
        <RequirementChecklist :items="group.items" :storage-key="group.id" />
      </section>

      <section class="surface-card grid gap-8 md:grid-cols-[minmax(12rem,1fr)_2.5fr] md:gap-12">
        <h2 class="text-xl font-semibold text-wire-ink md:pt-1">Required from client</h2>
        <RequirementChecklist :items="requiredFromClient" storage-key="client" />
      </section>

      <section class="surface-card grid gap-8 md:grid-cols-[minmax(12rem,1fr)_2.5fr] md:gap-12">
        <h2 class="text-xl font-semibold text-wire-ink md:pt-1">Required from designer</h2>
        <RequirementChecklist :items="requiredFromDesigner" storage-key="designer" />
      </section>

      <section class="surface-card grid gap-8 md:grid-cols-[minmax(12rem,1fr)_2.5fr] md:gap-12">
        <h2 class="text-xl font-semibold text-wire-ink md:pt-1">Suggested SEO title &amp; description</h2>

        <div class="space-y-8 text-sm text-stone-800">
          <div class="space-y-4 border-b border-wire-border pb-8">
            <div>
              <p class="label-caps mb-2 text-wire-ink">Primary home page</p>
              <p class="font-semibold text-wire-ink">{{ suggestedSeo[0].title }}</p>
              <p class="mt-1 text-xs text-stone-600">{{ suggestedSeo[0].title.length }} characters</p>
            </div>
            <div>
              <p class="label-caps mb-2 text-wire-ink">Meta description</p>
              <p class="leading-relaxed">{{ suggestedSeo[0].description }}</p>
              <p class="mt-1 text-xs text-stone-600">{{ suggestedSeo[0].description.length }} characters</p>
            </div>
            <p v-if="suggestedSeo[0].notes">{{ suggestedSeo[0].notes }}</p>
          </div>

          <div class="space-y-4 border-b border-wire-border pb-8">
            <p class="label-caps text-wire-ink">Open Graph (social sharing)</p>
            <p class="font-semibold text-wire-ink">{{ suggestedOpenGraph.title }}</p>
            <p class="mt-2 leading-relaxed">{{ suggestedOpenGraph.description }}</p>
            <p class="mt-2 text-xs text-stone-600">{{ suggestedOpenGraph.imageNote }}</p>
          </div>

          <div class="space-y-6">
            <p class="label-caps text-wire-ink">Per-page suggestions</p>
            <div
              v-for="entry in suggestedSeo.slice(1)"
              :key="entry.path"
              class="border-t-2 border-wire-border pt-5 first:border-t-0 first:pt-0"
            >
              <p class="text-xs font-bold uppercase tracking-wider text-stone-600">{{ entry.page }} · {{ entry.path }}</p>
              <p class="mt-2 font-semibold text-wire-ink">{{ entry.title }}</p>
              <p class="mt-2 leading-relaxed">{{ entry.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
