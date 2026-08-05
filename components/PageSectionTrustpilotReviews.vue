<template>
  <section
    v-if="hasContent"
    class="section-trustpilot section-padding"
    :class="{ 'section-trustpilot--no-pad-top': !paddingTop }"
  >
    <div class="wrapper grid-1 gap-section">
      <div v-if="titleBlocks.length" class="serif h2 text-center">
        <SanityInline :blocks="titleBlocks" />
      </div>

      <TrustpilotSummary
        :business-unit="businessUnit"
        centered
      />

      <div v-if="pending" class="section-trustpilot__status" aria-live="polite">
        Loading reviews…
      </div>

      <div v-else-if="error" class="section-trustpilot__status" role="alert">
        Reviews are unavailable right now.
      </div>

      <div
        v-else-if="reviews.length"
        class="section-trustpilot__reviews grid-1 gap-section"
      >
        <article
          v-for="(review, index) in reviews"
          :key="review.id || index"
          class="section-trustpilot__card"
        >
          <div>
            <div class="review-grid gap-2">
              <TrustpilotStarRating :rating="review.stars" />
              <div class="grid-1 gap-15">
                <h3 v-if="review.title" class="h5 section-trustpilot__title">
                  {{ review.title }}
                </h3>
                <p v-if="review.text" class="section-trustpilot__text">
                  {{ review.text }}
                </p>
                <footer class="section-trustpilot__footer">
                  <span v-if="reviewAuthor(review)" class="section-trustpilot__author">
                    {{ reviewAuthor(review) }}
                  </span>
                  <span v-if="reviewDate(review)" class="section-trustpilot__date">
                    {{ reviewDate(review) }}
                  </span>
                </footer>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-if="trustpilotUrl" class="section-trustpilot__link text-center pad-2 pad-top-bottom">
        <a
          :href="trustpilotUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="section-trustpilot__cta h4 serif"
        >
          <span class="section-trustpilot__cta-label">Read all reviews on Trustpilot</span>
          <LinkArrow variant="scale" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { trustpilotUrl } = useSiteSettings()

const paddingTop = computed(() => props.section?.trustpilotReviewsPaddingTop === true)
const titleBlocks = computed(() => props.section?.trustpilotReviewsTitle ?? [])
const reviewCount = computed(() => {
  const value = Number(props.section?.trustpilotReviewsCount)
  if (!Number.isFinite(value)) return 4
  return Math.min(Math.max(value, 1), 30)
})
const minStars = computed(() => {
  const value = Number(props.section?.trustpilotReviewsMinStars)
  if (!Number.isFinite(value)) return undefined
  return Math.min(Math.max(value, 1), 5)
})

const { data, pending, error } = await useFetch('/api/trustpilot/reviews', {
  query: computed(() => ({
    perPage: reviewCount.value,
    stars: minStars.value,
  })),
  default: () => ({
    reviews: [],
    businessUnit: null,
    mock: true,
  }),
})

const reviews = computed(() => data.value?.reviews ?? [])
const businessUnit = computed(() => data.value?.businessUnit ?? null)

const hasContent = computed(
  () => titleBlocks.value.length > 0
    || reviews.value.length > 0
    || Boolean(trustpilotUrl.value)
    || pending.value,
)

function reviewAuthor(review) {
  const name = review?.consumer?.displayName?.trim()
  const location = review?.consumer?.displayLocation?.trim()

  if (name && location) return `${name}, ${location}`
  return name || location || ''
}

function reviewDate(review) {
  const value = review?.createdAt
  if (!value) return ''

  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<style scoped>
.h5 {
    line-height: 1.35;
}
.wrapper {
  max-width: 1100px;
}
.section-trustpilot--no-pad-top {
  padding-top: 0;
}

.section-trustpilot__status {
  text-align: center;
}

.section-trustpilot__title,
.section-trustpilot__text,
.section-trustpilot__footer {
  margin: 0;
}

.section-trustpilot__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  opacity: 0.7;
}

.section-trustpilot__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  text-decoration: none;
  color: inherit;
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 1000px) {
  .review-grid {
    grid-template-columns: 200px 1fr;
  }
}

.section-trustpilot__cta :deep(.link-arrow) {
  width: 0.5em;
}

.section-trustpilot__cta-label {
  position: relative;
  display: inline-block;
}

.section-trustpilot__cta-label::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.2em;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  opacity: 0.2;
  pointer-events: none;
}

.section-trustpilot__cta-label::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.2em;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  will-change: transform;
}

.section-trustpilot__cta:hover .section-trustpilot__cta-label::after,
.section-trustpilot__cta:focus-visible .section-trustpilot__cta-label::after {
  transform: scaleX(1);
}

.section-trustpilot__cta:hover :deep(.link-arrow--scale) {
  transform: scale(1);
}
</style>
