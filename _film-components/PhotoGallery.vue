<script setup lang="ts">
type Photo = { id: number; alt: string }

defineProps<{
  photos: Photo[]
}>()

const activeIndex = ref<number | null>(null)

function open(index: number) {
  activeIndex.value = index
}

function close() {
  activeIndex.value = null
}

function prev() {
  if (activeIndex.value !== null && activeIndex.value > 0) {
    activeIndex.value--
  }
}

function next(total: number) {
  if (activeIndex.value !== null && activeIndex.value < total - 1) {
    activeIndex.value++
  }
}

function onKeydown(e: KeyboardEvent, total: number) {
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next(total)
}
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        type="button"
        class="group overflow-hidden border border-wire-border text-left transition-colors hover:border-wire-ink"
        @click="open(index)"
      >
        <WireBox :label="`Still ${photo.id}`" class="aspect-[4/3] rounded-none border-0" />
        <span class="sr-only">{{ photo.alt }}</span>
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="activeIndex !== null"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="close"
        @keydown="onKeydown($event, photos.length)"
      >
        <div class="modal-panel max-w-4xl">
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <p class="label-caps">Production still</p>
              <p class="mt-1 text-sm text-wire-muted">{{ photos[activeIndex].alt }}</p>
            </div>
            <button type="button" class="text-2xl text-wire-muted" @click="close">&times;</button>
          </div>

          <WireBox
            :label="`Still ${photos[activeIndex].id} — full resolution`"
            class="aspect-[4/3] rounded-none"
          />

          <div class="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              class="btn-secondary text-xs"
              :disabled="activeIndex === 0"
              @click="prev"
            >
              Previous
            </button>
            <span class="text-sm text-wire-muted">
              {{ activeIndex + 1 }} / {{ photos.length }}
            </span>
            <button
              type="button"
              class="btn-secondary text-xs"
              :disabled="activeIndex === photos.length - 1"
              @click="next(photos.length)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
