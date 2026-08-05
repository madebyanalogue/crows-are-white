<script setup>
import { film as defaultFilm, streamingLinks as defaultStreamingLinks } from '~/data/site'

definePageMeta({
  removeHeaderPadding: true,
})

const WATCH_PAGE_COLORS = {
  pageColor: '#000000',
  pageTextColor: '#ffffff',
  menuBackgroundColor: '#0b0d0c',
  menuTextColor: '#ff555f',
  menuHighlightColor: '#ff555f',
  basketIconColor: '#ff555f',
}

const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Watch'

useHead({ title: 'Watch — Crows Are White' })
usePageColor(WATCH_PAGE_COLORS)

const { film } = useSiteContent()
const { watchNowDropdown } = useSiteSettings()

const title = computed(() => film.value?.title || defaultFilm.title)
const year = computed(() => film.value?.year || defaultFilm.year)
const runtime = computed(() => film.value?.runtime || defaultFilm.runtime)
const heroVideoId = computed(() => film.value?.heroVideoId || defaultFilm.heroVideoId)
const heroVideoSrc = computed(() => film.value?.heroVideoSrc || defaultFilm.heroVideoSrc || '')

const platformsLabel = computed(
  () => watchNowDropdown.value?.platformsLabel || 'Also available on',
)

const platforms = computed(() => {
  const fromSettings = watchNowDropdown.value?.platforms
  if (Array.isArray(fromSettings) && fromSettings.length) {
    return fromSettings.filter((link) => link?.label && link?.href)
  }
  return defaultStreamingLinks.filter((link) => !link.featured)
})

const priceLabel = 'Watch Now – £7.99'
</script>

<template>
  <div class="watch-page">
    <section class="watch-page__hero" aria-label="Film preview">
      <VideoLoopEmbed
        :video-id="heroVideoId"
        :video-src="heroVideoSrc || undefined"
        aspect-class="watch-page__media"
        :title="`${title} — preview`"
      />
    </section>

    <section class="watch-page__info">
      <h1 class="watch-page__title serif">{{ title }}</h1>
      <div class="watch-page__meta-group">
        <p class="watch-page__meta">
          <span>{{ year }}</span>
          <span class="watch-page__meta-sep" aria-hidden="true">|</span>
          <span>{{ runtime }} mins</span>
        </p>
        <button type="button" class="watch-page__cta">
          {{ priceLabel }}
        </button>
      </div>
    </section>

    <section
      v-if="platforms.length"
      class="watch-page__platforms"
      aria-labelledby="watch-platforms-heading"
    >
      <h2
        id="watch-platforms-heading"
        class="watch-page__platforms-label handwritten"
      >
        {{ platformsLabel }}
      </h2>

      <ul class="watch-page__grid">
        <li
          v-for="link in platforms"
          :key="link.label"
          class="watch-page__grid-item"
        >
          <a
            :href="link.href"
            class="watch-page__grid-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.watch-page {
  --watch-accent: #ff555f;
  --watch-ink: #ffffff;
  --watch-muted: rgba(255, 255, 255, 0.38);
  --watch-line: rgba(255, 255, 255, 0.22);
  --watch-gutter: clamp(1.25rem, 3.5vw, 2.75rem);
  --watch-nav-clearance: calc(2rem + 50px + 1.25rem);
  --watch-content: min(100%, 1280px);
  min-height: 100dvh;
  padding:
    var(--watch-nav-clearance)
    var(--watch-gutter)
    clamp(3rem, 8vw, 6rem);
  color: var(--watch-ink);
  background: #000;
}

@media (min-width: 700px) {
  .watch-page {
    --watch-nav-clearance: calc(3.5rem + 50px + 1.5rem);
  }
}

.watch-page__hero {
  width: var(--watch-content);
  margin: 0 auto;
}

.watch-page__media {
  display: block;
  width: 100%;
  height: min(48vh, 520px);
  background: #000;
}

.watch-page__info {
  width: var(--watch-content);
  margin: 1.5rem auto 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.5rem;
}

.watch-page__title {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
  color: var(--watch-ink);
}

.watch-page__meta-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem 1.15rem;
  margin-left: auto;
}

.watch-page__meta {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  color: var(--watch-ink);
  white-space: nowrap;
}

.watch-page__meta-sep {
  opacity: 0.7;
}

.watch-page__cta {
  appearance: none;
  border: 0;
  margin: 0;
  padding: 0.85rem 1.15rem;
  background: var(--watch-accent);
  color: #000;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 0;
}

.watch-page__cta:hover {
  filter: brightness(1.05);
}

.watch-page__cta:focus-visible {
  outline: 2px solid var(--watch-ink);
  outline-offset: 3px;
}

.watch-page__platforms {
  width: var(--watch-content);
  margin: clamp(2.75rem, 6vw, 4.5rem) auto 0;
}

.watch-page__platforms-label {
  margin: 0 0 1.35rem;
  text-align: center;
  font-size: clamp(1.65rem, 3vw, 2.15rem);
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1;
  color: var(--watch-accent);
  text-transform: none;
}

.watch-page__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--watch-line);
  border-left: 1px solid var(--watch-line);
}

.watch-page__grid-item {
  min-width: 0;
  border-right: 1px solid var(--watch-line);
  border-bottom: 1px solid var(--watch-line);
}

.watch-page__grid-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 4.25rem;
  padding: 1rem 0.75rem;
  font-family: var(--sans);
  font-size: clamp(11px, 1.1vw, 13px);
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  color: var(--watch-muted);
  transition: color 0.18s ease;
}

.watch-page__grid-link:hover {
  color: var(--watch-ink);
}

.watch-page__grid-link:focus-visible {
  outline: 2px solid var(--watch-accent);
  outline-offset: -2px;
  color: var(--watch-ink);
}

@media (max-width: 699px) {
  .watch-page__info {
    flex-direction: column;
    align-items: flex-start;
  }

  .watch-page__meta-group {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }

  .watch-page__grid {
    grid-template-columns: 1fr;
  }

  .watch-page__grid-link {
    min-height: 3.5rem;
    justify-content: flex-start;
    padding-left: 1rem;
    padding-right: 1rem;
    text-align: left;
  }
}
</style>
