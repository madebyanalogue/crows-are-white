<script setup lang="ts">
import { film } from '~/data/site'

const expanded = ref(false)
const playerReady = ref(false)

function open() {
  expanded.value = true
  playerReady.value = true
}

function close() {
  expanded.value = false
  setTimeout(() => {
    playerReady.value = false
  }, 500)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && expanded.value) close()
}

watch(expanded, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <section id="trailer" class="scroll-mt-28">
    <h2 class="mb-8 text-3xl font-semibold text-wire-ink md:text-4xl">Trailer</h2>

    <button
      type="button"
      class="group relative block w-full overflow-hidden border-2 border-wire-ink bg-black text-left"
      aria-label="Play trailer"
      @click="open"
    >
      <VideoLoopEmbed
        :video-id="film.trailerId"
        title="Crows Are White — trailer loop"
      />
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35"
      >
        <span
          class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-black/50 text-white transition-transform group-hover:scale-105"
        >
          <svg class="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </button>

    <p class="mt-4 text-sm text-wire-muted">
      Loops on the page. Click to expand — reference:
      <a
        href="https://www.sandboxfilms.org/films/fire-of-love"
        target="_blank"
        rel="noopener"
        class="underline underline-offset-2 hover:text-wire-ink"
      >
        Fire of Love
      </a>
    </p>

    <Teleport to="body">
      <Transition name="trailer-modal">
        <div
          v-if="expanded"
          class="fixed inset-0 z-[80] flex items-center justify-center bg-black px-4 py-16 sm:px-8"
          role="dialog"
          aria-modal="true"
          aria-label="Trailer player"
        >
          <button
            type="button"
            class="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center text-white/80 transition-colors hover:text-white sm:right-8 sm:top-8"
            aria-label="Close trailer"
            @click="close"
          >
            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="trailer-modal__inner w-full max-w-6xl">
            <ClientOnly>
              <TrailerPlayer v-if="playerReady" :video-id="film.trailerId" />
            </ClientOnly>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
