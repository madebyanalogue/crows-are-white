<script setup lang="ts">
import { film } from '~/data/site'
</script>

<template>
  <div class="aspect-video w-full overflow-hidden border-2 border-wire-ink bg-black">
    <iframe
      class="h-full w-full"
      :src="`https://www.youtube.com/embed/${film.trailerId}?rel=0`"
      title="Crows Are White — Official Trailer"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </div>
</template>
