<script setup lang="ts">
import { film } from '~/data/site'
</script>

<template>
  <div class="page-section">
    <PageHeader
      title="Trailer"
      subtitle="YouTube embed on a dedicated page, linked from the hamburger menu."
    />
    <TrailerEmbed class="mb-6" />
    <a
      :href="film.trailer"
      target="_blank"
      rel="noopener"
      class="btn-secondary"
    >
      Open on YouTube
    </a>
  </div>
</template>
