<template>
  <DefaultPage
    title="Credits"
    subtitle="Crows Are White — cast and crew."
  >
    <dl class="credits-list">
      <div>
        <dt>Director</dt>
        <dd>Ahsen Nadeem</dd>
      </div>
      <div>
        <dt>Writers</dt>
        <dd>Ahsen Nadeem, Matt H. Mayes, Dawn Light Blackman</dd>
      </div>
      <div>
        <dt>Cinematography</dt>
        <dd>Matthew Nauser</dd>
      </div>
      <div>
        <dt>Runtime</dt>
        <dd>98 minutes</dd>
      </div>
    </dl>
  </DefaultPage>
</template>

<script setup>
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Credits'

usePageColor(ref(null))
</script>

<style scoped>
.credits-list {
  margin: 0;
  display: grid;
  gap: 1.5rem;
}

.credits-list dt {
  font-family: var(--sans);
  font-size: clamp(12px, 1vw, 14px);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--text-color, #111010) 58%, transparent);
}

.credits-list dd {
  margin: 0.35rem 0 0;
}
</style>
