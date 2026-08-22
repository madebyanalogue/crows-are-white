<script setup>
const props = defineProps({
  artist: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: 'About the Artist',
  },
})

const sectionTitle = computed(() => props.title?.trim() || 'About the Artist')
const bioBlocks = computed(() => props.artist?.bio || [])
const hasBio = computed(() => bioBlocks.value.length > 0)
const whyWeChoseBlocks = computed(() => props.artist?.whyWeChoseThisArtist || [])
const hasWhyWeChose = computed(() => whyWeChoseBlocks.value.length > 0)

const headshot = computed(() => props.artist?.headshot || props.artist?.portrait || null)
const headshotSrc = computed(() => headshot.value?.asset?._id || '')
const headshotWidth = computed(() => headshot.value?.asset?.metadata?.dimensions?.width)
const headshotHeight = computed(() => headshot.value?.asset?.metadata?.dimensions?.height)
const headshotAlt = computed(() => {
  const alt = headshot.value?.alt
  if (typeof alt === 'string' && alt.trim()) return alt.trim()
  const name = props.artist?.name?.trim()
  return name ? `Headshot of ${name}` : 'Artist headshot'
})

const galleryItems = computed(() =>
  (props.artist?.gallery || [])
    .map((item, index) => {
      const image = item?.image
      const src = image?.asset?._id || ''
      if (!src) return null

      const caption = item?.caption?.trim() || ''
      const alt = image?.alt?.trim()
        || (caption || (props.artist?.name ? `Work by ${props.artist.name}` : 'Artist gallery image'))

      return {
        _key: item._key || `artist-gallery-${index}`,
        src,
        width: image?.asset?.metadata?.dimensions?.width,
        height: image?.asset?.metadata?.dimensions?.height,
        alt,
        caption,
      }
    })
    .filter(Boolean),
)

const hasGallery = computed(() => galleryItems.value.length > 0)

const websiteUrl = computed(() => normalizeExternalUrl(props.artist?.website))
const instagramUrl = computed(() => normalizeExternalUrl(props.artist?.instagram))
const hasLinks = computed(() => Boolean(websiteUrl.value || instagramUrl.value))

const hasIntroColumn = computed(() =>
  Boolean(
    headshotSrc.value
    || hasBio.value
    || hasLinks.value
    || props.artist?.name
    || props.artist?.subtitle,
  ),
)

const whyWeChoseTitle = computed(() => {
  const name = props.artist?.name?.trim()
  return name ? `Why we chose ${name}` : 'Why we chose this artist'
})

const hasContent = computed(
  () => Boolean(
    props.artist?.name
    && (hasIntroColumn.value || hasWhyWeChose.value || hasGallery.value),
  ),
)

function normalizeExternalUrl(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
</script>

<template>
  <section
    v-if="hasContent"
    class="page-section-about-artist shop-products-section"
    aria-labelledby="about-artist-title"
  >
    <div class="wrapper">
      <div class="page-section-about-artist__header">
        <h2
          id="about-artist-title"
          class="page-section-about-artist__title h2 serif light"
        >
          {{ sectionTitle }}
        </h2>
      </div>

      <div
        class="page-section-about-artist__grid"
        :class="{ 'page-section-about-artist__grid--no-gallery': !hasGallery }"
      >
        <div
          v-if="hasIntroColumn"
          class="page-section-about-artist__col page-section-about-artist__col--start"
        >
          <div class="page-section-about-artist__identity">
            <figure
              v-if="headshotSrc"
              class="page-section-about-artist__headshot"
            >
              <AppImage
                :src="headshotSrc"
                :width="headshotWidth"
                :height="headshotHeight"
                :alt="headshotAlt"
                class="page-section-about-artist__headshot-image"
                sizes="320px"
              />
            </figure>

            <div class="page-section-about-artist__identity-body">
              <h3 class="page-section-about-artist__name serif">
                {{ artist.name }}
              </h3>
              <p
                v-if="artist.subtitle"
                class="page-section-about-artist__subtitle"
              >
                {{ artist.subtitle }}
              </p>
              <div
                v-if="hasLinks"
                class="page-section-about-artist__links"
              >
                <a
                  v-if="websiteUrl"
                  :href="websiteUrl"
                  class="page-section-about-artist__link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit artist website"
                >
                  <SocialIcon platform="website" />
                </a>
                <a
                  v-if="instagramUrl"
                  :href="instagramUrl"
                  class="page-section-about-artist__link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <SocialIcon platform="instagram" />
                </a>
              </div>
            </div>
          </div>

          <SanityContent
            v-if="hasBio"
            :blocks="bioBlocks"
            class="page-section-about-artist__bio rich-text underline-links"
          />
        </div>

        <div
          v-if="hasGallery"
          class="page-section-about-artist__col page-section-about-artist__col--center"
        >
          <SynopsisImageCarousel
            class="page-section-about-artist__gallery"
            :items="galleryItems"
            aspect-ratio="4 / 5"
            image-sizes="480px"
            aria-label="Artist gallery"
          />
        </div>

        <div
          v-if="hasWhyWeChose"
          class="page-section-about-artist__col page-section-about-artist__col--end"
        >
          <h3 class="page-section-about-artist__curation-title serif">
            {{ whyWeChoseTitle }}
          </h3>
          <SanityContent
            :blocks="whyWeChoseBlocks"
            class="page-section-about-artist__curation-copy rich-text underline-links"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-section-about-artist {
  padding: var(--shop-section-padding) 0;
  background: var(--shop-bg);
  color: var(--shop-text);
  --shop-line: #ddd;
  border-bottom: 1px solid var(--shop-line);
}
.page-section-about-artist .wrapper {
  padding: 0 var(--shop-x-padding);
}
.page-section-about-artist__header {
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.page-section-about-artist__title {
  margin: 0;
  padding: 0;
  font-weight: 300;
  font-size: clamp(2rem, 4.5vw, 2.75rem);
}

.page-section-about-artist__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 900px) {
  .page-section-about-artist__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(1.5rem, 4vw, 6rem);
  }

  .page-section-about-artist__grid--no-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.page-section-about-artist__col {
  min-width: 0;
}

.page-section-about-artist__col--start,
.page-section-about-artist__col--end {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.page-section-about-artist__col--center {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  grid-column: 1;
}

@media (min-width: 900px) {
  .page-section-about-artist__col--start {
    grid-column: 1;
  }

  .page-section-about-artist__col--center {
    grid-column: 2;
  }

  .page-section-about-artist__col--end {
    grid-column: 3;
  }

  .page-section-about-artist__grid--no-gallery .page-section-about-artist__col--start {
    grid-column: 1;
  }

  .page-section-about-artist__grid--no-gallery .page-section-about-artist__col--end {
    grid-column: 2;
  }
}

.page-section-about-artist__gallery {
  width: 100%;
  padding-bottom: clamp(3rem, 8vw, 4.5rem);
}

.page-section-about-artist__identity {
  display: flex;
  gap: 40px;
}

.page-section-about-artist__identity-body {
  display: flex;
  flex-direction: column;
  gap: clamp(0.65rem, 2vw, 1rem);
  min-width: 0;
  flex: 1 1 auto;
}

.page-section-about-artist__headshot {
  flex: 0 0 auto;
  margin: 0;
  width: min(100%, 120px);
}

.page-section-about-artist__headshot-image {
  display: block;
  width: 100%;
  height: auto;
}

.page-section-about-artist__name {
  margin: 0;
  font-size: clamp(19px, 3.5vw, 2.1rem);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.page-section-about-artist__subtitle {
  margin: 0;
  font-size: clamp(0.95rem, 1.5vw, 1.05rem);
  color: color-mix(in srgb, currentColor 62%, transparent);
}

.page-section-about-artist__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.page-section-about-artist__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.page-section-about-artist__link :deep(.social-icon) {
  width: 1rem;
  height: 1rem;
}

.page-section-about-artist__link:hover,
.page-section-about-artist__link:focus-visible {
  opacity: 0.65;
}

.page-section-about-artist__bio,
.page-section-about-artist__curation-copy {
  margin: 0;
}

.page-section-about-artist__curation-title {
  margin: 0;
  font-size: clamp(1.15rem, 2vw, 1.35rem);
  font-weight: 300;
  line-height: 1.25;
}
</style>
