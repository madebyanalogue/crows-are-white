<script setup>
import { resolveSanityAssetUrl } from '~/utils/sanity'
import { resolveSpotifyPlaylistEmbed } from '~/utils/spotifyEmbed'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const SECTION_PADDING_VALUES = {
  none: '0',
  small: 'var(--section-padding-small)',
  large: 'var(--section-padding)',
  xlarge: 'calc(var(--section-padding) * 1.5)',
}

function resolveSectionPadding(value) {
  if (value === 'none' || value === 'small' || value === 'large' || value === 'xlarge') {
    return value
  }
  if (value === false) return 'none'
  return 'large'
}

const title = computed(() => props.section?.playlistTitle?.trim() || '')

const titleClass = computed(() => {
  const style = props.section?.playlistTitleStyle
  return style === 'condensed'
    ? 'page-section-playlist__title h2 condensed'
    : 'page-section-playlist__title h2 serif light'
})

const backgroundImageUrl = computed(() =>
  resolveSanityAssetUrl(props.section?.playlistBackgroundImage?.asset) || '',
)

const backgroundImageAlt = computed(() =>
  props.section?.playlistBackgroundImage?.alt?.trim() || title.value || '',
)

const hasBackground = computed(() => Boolean(backgroundImageUrl.value))

const embed = computed(() =>
  resolveSpotifyPlaylistEmbed(
    props.section?.playlistUrl,
    props.section?.playlistView === 'compact' ? 'compact' : 'full',
  ),
)

const sectionStyle = computed(() => ({
  paddingTop: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.playlistPaddingTop)],
  paddingBottom: SECTION_PADDING_VALUES[resolveSectionPadding(props.section?.playlistPaddingBottom)],
}))
</script>

<template>
  <section
    v-if="embed"
    class="page-section-playlist"
    :class="{ 'page-section-playlist--has-background': hasBackground }"
    :style="sectionStyle"
    aria-label="Spotify playlist"
  >
    <div class="wrapper page-section-playlist__inner">
      <h2
        v-if="title"
        :class="titleClass"
      >
        {{ title }}
      </h2>

      <div
        v-if="hasBackground"
        class="page-section-playlist__columns"
      >
        <div class="page-section-playlist__media-column">
          <img
            class="page-section-playlist__background-image"
            :src="backgroundImageUrl"
            :alt="backgroundImageAlt"
            draggable="false"
            loading="lazy"
          >
        </div>

        <div class="page-section-playlist__content-column">
          <div
            class="page-section-playlist__embed"
            :class="{
              'page-section-playlist__embed--compact': section.playlistView === 'compact',
              'page-section-playlist__embed--full': section.playlistView !== 'compact',
            }"
          >
            <iframe
              :src="embed.src"
              :height="embed.height"
              width="100%"
              frameborder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              :title="title || 'Spotify playlist'"
            />
          </div>
        </div>
      </div>

      <div
        v-else
        class="page-section-playlist__content-column"
      >
        <div
          class="page-section-playlist__embed"
          :class="{
            'page-section-playlist__embed--compact': section.playlistView === 'compact',
            'page-section-playlist__embed--full': section.playlistView !== 'compact',
          }"
        >
          <iframe
            :src="embed.src"
            :height="embed.height"
            width="100%"
            frameborder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            :title="title || 'Spotify playlist'"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-section-playlist__inner {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 4rem);
}

.page-section-playlist__title {
  margin: 0;
  letter-spacing: 0.02em;
  text-align: center;
}

.page-section-playlist__columns {
  display: grid;
  gap: clamp(2rem, 4vw, 4rem);
  align-items: center;
  justify-items: center;
}

.page-section-playlist__media-column {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  overflow: hidden;
}

.page-section-playlist__background-image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.page-section-playlist__content-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.page-section-playlist__embed {
  width: 100%;
  max-width: 620px;
  margin-inline: auto;
}

.page-section-playlist__embed iframe {
  display: block;
  width: 100%;
  border: 0;
  border-radius: 12px;
}

@media (min-width: 900px) {
  .page-section-playlist__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: center;
    justify-items: stretch;
  }
}
</style>
