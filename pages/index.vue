<script setup lang="ts">
definePageMeta({
  transparentHeader: true,
})

const {film, pressQuotes} = useSiteContent()
const {open: openTrailer} = useTrailerPlayer()

const newsletterOpen = ref(false)
</script>

<template>
  <div>
    <section class="hero">
      <VideoLoopEmbed
        :video-id="film.heroVideoId"
        :video-src="film.heroVideoSrc || undefined"
        aspect-class="hero-img"
        title="Crows Are White — hero"
      />
      <div class="hero-scrim" />
      <div class="cta-group">
        <NuxtLink to="/screenings" class="btn-primary">Find a Screening</NuxtLink>
        <button type="button" class="btn-secondary" @click="openTrailer">Watch Trailer</button>
      </div>
    </section>

    <section class="film-info">
      <div class="film-info-inner">
        <div class="film-meta-row">
          <div class="film-director">
            <div class="film-credit-block">
              <div class="film-credit-label">Directed by</div>
              <div class="film-credit-names">{{ film.director }}</div>
            </div>
          </div>
          <div>
            <h2 class="film-tagline">A Fool's Guide to Enlightenment</h2>
            <p class="film-logline">{{ film.logline }}</p>
          </div>
        </div>
      </div>
    </section>

    <TrailerSection />

    <section class="press-quotes">
      <div
        v-for="(quote, index) in pressQuotes"
        :key="`${quote.pub}-${index}`"
        class="press-quote-row"
        :class="{ reverse: index % 2 === 1 }"
      >
        <WireBox :label="quote.pub" class="press-quote-img aspect-[4/3] min-h-[200px]" />
        <div class="press-quote-text">
          <div class="press-quote-words">"{{ quote.quote }}"</div>
          <div class="press-quote-source">— {{ quote.pub }}</div>
        </div>
      </div>
    </section>

    <div class="newsletter-wrap">
      <section class="newsletter">
        <div class="newsletter-img">
          <WireBox label="Newsletter image" class="h-full min-h-[220px]" />
        </div>
        <div class="newsletter-panel">
          <div class="newsletter-title">Newsletter</div>
          <div class="newsletter-heading">
            Help us get the movie to you and your local theater. You want to see Crows Are White!
          </div>
          <form class="newsletter-fields" @submit.prevent="newsletterOpen = false">
            <input type="email" placeholder="Your email" required>
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero :deep(.hero-img),
.hero :deep(video),
.hero :deep(iframe) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}
</style>
