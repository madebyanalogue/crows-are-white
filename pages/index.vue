<script setup lang="ts">
import { film, pressQuotes, siteConfig } from '~/data/site'

const newsletterOpen = ref(false)
</script>

<template>
  <div>
    <section class="full-bleed mb-12 bg-stone-950 md:mb-16">
      <VideoLoopEmbed
        :video-id="film.heroVideoId"
        :video-src="film.heroVideoSrc || undefined"
        aspect-class="aspect-[16/7]"
        title="Crows Are White — hero loop"
      />
    </section>

    <div class="page-section pt-0">
      <div class="mb-12 flex flex-wrap gap-4 md:mb-16">
        <NuxtLink to="/#trailer" class="btn-secondary">Trailer</NuxtLink>
        <button type="button" class="btn-secondary" @click="newsletterOpen = true">
          Request a Screening
        </button>

        <WatchNowDropdown />
        <NuxtLink v-if="siteConfig.theatricalReleaseActive" to="/tickets" class="btn-secondary">
          Get Tickets
        </NuxtLink>
      </div>

      <section class="mb-16 md:mb-24">
        <h2 class="mb-6 text-3xl font-semibold text-wire-ink md:text-4xl">Logline</h2>
        <p class="max-w-4xl text-xl leading-relaxed text-wire-muted md:text-2xl md:leading-relaxed">
          {{ film.logline }}
        </p>
      </section>

      <section class="mb-16 md:mb-24">
        <p class="label-caps mb-8">Festival laurels</p>
        <div class="flex flex-wrap gap-4">
          <span
            v-for="laurel in film.laurels"
            :key="laurel"
            class="surface px-6 py-5 text-sm font-semibold text-wire-muted"
          >
            {{ laurel }}
          </span>
        </div>
      </section>

      <TrailerSection />

      <section class="mt-16 space-y-6 md:mt-24">
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
    </div>

    <Teleport to="body">
      <div v-if="newsletterOpen" class="modal-overlay" @click.self="newsletterOpen = false">
        <div class="modal-panel max-w-lg">
          <div class="mb-6 flex items-start justify-between gap-4">
            <h2 class="text-2xl font-semibold">Request a Screening</h2>
            <button type="button" class="text-2xl text-wire-muted" @click="newsletterOpen = false">&times;</button>
          </div>
          <p class="mb-8 text-base leading-relaxed text-wire-muted">
            Help us get the movie to you and show your local theater you want to see Crows Are White.
          </p>
          <form class="space-y-4" @submit.prevent="newsletterOpen = false">
            <input type="email" required placeholder="Email" class="input-wire" />
            <input placeholder="Country" class="input-wire" />
            <input placeholder="State" class="input-wire" />
            <input placeholder="Region" class="input-wire" />
            <input placeholder="City" class="input-wire" />
            <button type="submit" class="btn-primary w-full justify-center">Join the List</button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
