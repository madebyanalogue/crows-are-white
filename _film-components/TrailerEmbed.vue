<script setup lang="ts">
const {film} = useSiteContent()
</script>

<template>
  <div class="aspect-video w-full overflow-hidden border border-wire-ink bg-black">
    <iframe
      class="h-full w-full"
      :src="`https://www.youtube.com/embed/${film.trailerId}?rel=0`"
      title="Crows Are White — Official Trailer"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </div>
</template>
