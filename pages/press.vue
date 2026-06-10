<script setup lang="ts">
import { film, pressPhotos, pressQuotes } from '~/data/site'
</script>

<template>
  <div class="page-section">
    <PageHeader
      title="Press"
      subtitle="Press kit, stills, quotes, laurels, and contact."
    />

    <section class="mb-16 space-y-6 md:mb-24">
      <h2 class="label-caps">Synopsis</h2>
      <p class="max-w-3xl leading-relaxed text-stone-700">{{ film.logline }}</p>
      <dl class="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-xs uppercase tracking-wide text-wire-muted">Director</dt>
          <dd class="mt-1">{{ film.director }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-wire-muted">Writers</dt>
          <dd class="mt-1">{{ film.writers }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-wire-muted">Cinematography</dt>
          <dd class="mt-1">{{ film.cinematography }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-wire-muted">IMDb</dt>
          <dd class="mt-1">
            <a :href="film.imdb" target="_blank" rel="noopener" class="underline hover:text-stone-500">
              tt10332620
            </a>
          </dd>
        </div>
      </dl>
      <button type="button" class="btn-secondary">Download Press Kit PDF</button>
    </section>

    <hr class="mb-16 border-t-2 border-wire-border md:mb-24" />

    <section class="mb-16 space-y-6 md:mb-24">
      <h2 class="label-caps">Production stills</h2>
      <PhotoGallery :photos="pressPhotos" />
    </section>

    <section class="mb-12 grid gap-10 md:grid-cols-2">
      <div class="space-y-4">
        <h2 class="label-caps">Poster</h2>
        <WireBox label="Downloadable poster asset" class="aspect-[2/3]" />
        <button type="button" class="btn-secondary">Download Poster</button>
      </div>
      <div class="space-y-4">
        <h2 class="label-caps">Festival laurels</h2>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="n in 5"
            :key="n"
            class="surface flex h-20 items-center justify-center text-xs font-semibold text-wire-muted"
          >
            Laurel {{ n }}
          </div>
        </div>
      </div>
    </section>

    <section class="mb-16 space-y-6 md:mb-24">
      <h2 class="label-caps">Press quotes</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <blockquote
          v-for="q in pressQuotes"
          :key="q.pub"
          class="surface-card"
        >
          <p class="text-sm italic text-stone-700">"{{ q.quote }}"</p>
          <footer class="mt-3 text-xs text-wire-muted">
            — {{ q.reviewer }}, {{ q.pub }}
          </footer>
        </blockquote>
      </div>
    </section>

    <section class="surface-card max-w-md">
      <h2 class="label-caps mb-4">Press contact</h2>
      <p class="font-semibold">Anne Takahashi</p>
      <p class="mt-1 text-sm text-wire-muted">anne@takapr.com</p>
      <button type="button" class="btn-secondary mt-4">Email Press Contact</button>
    </section>
  </div>
</template>
