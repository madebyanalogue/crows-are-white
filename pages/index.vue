<script setup lang="ts">
import { film } from '~/data/site'

const newsletterOpen = ref(false)
const trailerOpen = ref(false)
</script>

<template>
  <div>
    <section class="full-bleed mb-12 bg-stone-950 md:mb-16">
      <WireBox
        dark
        label="Hero — full-bleed cinematic still or 10–40 sec video loop"
        class="aspect-[16/7] rounded-none border-x-0 border-t-0"
      />
    </section>

    <div class="page-section pt-0">
    <div class="mb-12 flex flex-wrap gap-4 md:mb-16">
      <button type="button" class="btn-secondary" @click="trailerOpen = true">Trailer</button>
      <button type="button" class="btn-secondary" @click="newsletterOpen = true">
        Request a Screening
      </button>

      <WatchNowDropdown />
      <NuxtLink to="/tickets" class="btn-secondary">Get Tickets</NuxtLink>
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

    <section class="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
      <div class="surface-card text-center">
        <p class="text-4xl font-bold text-wire-ink md:text-5xl">{{ film.runtime }}</p>
        <p class="label-caps mt-4">Minutes</p>
      </div>
      <div class="surface-card text-center">
        <p class="text-4xl font-bold text-wire-ink md:text-5xl">{{ film.rottenTomatoes }}</p>
        <p class="label-caps mt-4">Rotten Tomatoes</p>
      </div>
      <div class="surface-card text-center">
        <p class="text-4xl font-bold text-wire-ink md:text-5xl">{{ film.festivals }}</p>
        <p class="label-caps mt-4">Festivals</p>
      </div>
      <div class="surface-card text-center">
        <p class="text-4xl font-bold text-wire-ink md:text-5xl">{{ film.awards }}</p>
        <p class="label-caps mt-4">Awards</p>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="trailerOpen" class="modal-overlay" @click.self="trailerOpen = false">
        <div class="modal-panel max-w-4xl">
          <div class="mb-6 flex items-start justify-between gap-4">
            <h2 class="text-2xl font-semibold">Trailer</h2>
            <button type="button" class="text-2xl text-wire-muted" @click="trailerOpen = false">&times;</button>
          </div>
          <TrailerEmbed class="mb-6" />
          <a :href="film.trailer" target="_blank" rel="noopener" class="btn-secondary">
            Open on YouTube
          </a>
        </div>
      </div>
    </Teleport>

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
  </div>
</template>
