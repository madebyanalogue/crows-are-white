<template>
  <div
    class="trustpilot-summary flex flex-col gap-gutter"
    :class="{ 'trustpilot-summary--center': centered }"
  >
    <TrustpilotStars
      :linked="Boolean(trustpilotUrl)"
      :light-wordmark="lightWordmark"
    />
    <MenuLink
      v-if="summaryText && trustpilotUrl"
      :item="metaLinkItem"
      arrow-variant="scale"
      class="trustpilot-summary__meta"
    />
    <p v-else-if="summaryText" class="trustpilot-summary__meta">
      {{ summaryText }}
    </p>
  </div>
</template>

<script setup>
import MenuLink from '~/components/MenuLink.vue'
import { formatTrustpilotSummaryText } from '~/utils/trustpilotSummary'

const props = defineProps({
  businessUnit: {
    type: Object,
    default: null,
  },
  fetchBusinessUnit: {
    type: Boolean,
    default: false,
  },
  lightWordmark: {
    type: Boolean,
    default: false,
  },
  centered: {
    type: Boolean,
    default: false,
  },
})

const { trustpilotUrl } = useSiteSettings()

const { data } = props.fetchBusinessUnit
  ? await useFetch('/api/trustpilot/reviews', {
      key: 'trustpilot-summary',
      query: { perPage: 1 },
      default: () => ({
        reviews: [],
        businessUnit: null,
        mock: true,
      }),
    })
  : { data: ref(null) }

const resolvedBusinessUnit = computed(() => (
  props.fetchBusinessUnit
    ? data.value?.businessUnit ?? null
    : props.businessUnit
))

const summaryText = computed(() => formatTrustpilotSummaryText(resolvedBusinessUnit.value))

const metaLinkItem = computed(() => ({
  text: summaryText.value,
  link: {
    type: 'url',
    url: trustpilotUrl.value,
  },
  isButton: true,
}))
</script>

<style scoped>
.trustpilot-summary--center {
  align-items: center;
  text-align: center;
}

.trustpilot-summary__meta {
  margin: 0;
}

.trustpilot-summary--center .trustpilot-summary__meta {
  width: fit-content;
}
</style>
