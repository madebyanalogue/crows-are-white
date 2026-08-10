<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const { screenings } = useSiteContent()

const title = computed(() => props.section?.screeningsTitle?.trim() || 'Screenings')
const lede = computed(() =>
  props.section?.screeningsLede?.trim()
  || 'Find a theatrical screening near you — ticket links go straight to each venue’s box office.',
)
const emptyTitle = computed(() => props.section?.screeningsEmptyTitle?.trim() || 'No screenings found')
const emptyText = computed(() =>
  props.section?.screeningsEmptyText?.trim()
  || 'Try clearing your filters, or check back soon for new dates.',
)

const cityFilter = ref('')
const stateFilter = ref('')
const listRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)
const toolbarRef = ref<HTMLElement | null>(null)

let listTween: gsap.core.Tween | null = null
let introTween: gsap.core.Tween | null = null

const availableStates = computed(() =>
  [...new Set(screenings.value.map((s) => s.state))].sort(),
)

const filtered = computed(() =>
  screenings.value.filter((s) => {
    const cityMatch =
      !cityFilter.value || s.city.toLowerCase().includes(cityFilter.value.toLowerCase())
    const stateMatch = !stateFilter.value || s.state === stateFilter.value
    return cityMatch && stateMatch
  }),
)

async function animateIntro({ pageLoad = false } = {}) {
  if (!import.meta.client) return

  await nextTick()

  const title = introRef.value?.querySelector('.screenings-page__title')
  const toolbar = toolbarRef.value
  const targets = [title, toolbar].filter(Boolean) as Element[]
  if (!targets.length) return

  introTween?.kill()
  gsap.set(targets, { autoAlpha: 0, y: 14 })

  introTween = gsap.to(targets, {
    autoAlpha: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.12,
    delay: pageLoad ? 0.55 : 0,
    ease: 'power2.out',
  })
}

async function animateRows({ pageLoad = false } = {}) {
  if (!import.meta.client) return

  await nextTick()

  const rows = listRef.value?.querySelectorAll('.screenings-row')
  if (!rows?.length) return

  listTween?.kill()
  gsap.set(rows, { autoAlpha: 0, y: 18 })

  listTween = gsap.to(rows, {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.14,
    delay: pageLoad ? 1 : 0,
    ease: 'power2.out',
  })
}

onMounted(() => {
  animateIntro({ pageLoad: true })
  if (filtered.value.length) animateRows({ pageLoad: true })
})

watch(filtered, () => {
  animateRows()
})

onBeforeUnmount(() => {
  listTween?.kill()
  introTween?.kill()
})
</script>

<template>
  <div class="screenings-page">
    <header ref="introRef" class="screenings-page__intro">
      <h1 class="screenings-page__title serif">{{ title }}</h1>
    </header>

    <div class="screenings-page__content">
        <!-- <p class="screenings-page__lede">
            {{ lede }}
          </p>
        <div ref="toolbarRef" class="screenings-toolbar">
          <label class="screenings-filter">
            <span class="screenings-filter__label">City</span>
            <input
              v-model="cityFilter"
              type="search"
              placeholder="Filter by city"
              class="screenings-filter__input"
            >
          </label>

          <label class="screenings-filter">
            <span class="screenings-filter__label">State</span>
            <select v-model="stateFilter" class="screenings-filter__select">
              <option value="">All states</option>
              <option
                v-for="state in availableStates"
                :key="state"
                :value="state"
              >
                {{ state }}
              </option>
            </select>
          </label>
        </div> -->
      </div>

    <div
      v-if="filtered.length === 0"
      class="screenings-empty"
    >
      <p class="screenings-empty__title serif">{{ emptyTitle }}</p>
      <p class="screenings-empty__text">
        {{ emptyText }}
      </p>
    </div>

    <ul
      v-else
      ref="listRef"
      class="screenings-list"
      aria-label="Theatrical screenings"
    >
      <li
        v-for="s in filtered"
        :key="`${s.city}-${s.date}-${s.venue}`"
        class="screenings-row"
        :class="{ 'screenings-row--disabled': s.status === 'coming-soon' }"
      >
        <component
          :is="s.status === 'coming-soon' ? 'div' : 'a'"
          class="screenings-row__link"
          :href="s.status === 'coming-soon' ? undefined : s.ticketUrl"
          :target="s.status === 'coming-soon' ? undefined : '_blank'"
          :rel="s.status === 'coming-soon' ? undefined : 'noopener noreferrer'"
          :aria-disabled="s.status === 'coming-soon' ? 'true' : undefined"
          :aria-label="s.status === 'coming-soon'
            ? `${s.venue}, ${s.city} — coming soon`
            : `Buy tickets for ${s.venue}, ${s.city} on ${s.date}`"
        >
          <div class="screenings-row__date">
            <span class="screenings-row__label">Date</span>
            <span class="screenings-row__value">{{ s.date }}</span>
          </div>

          <div class="screenings-row__location">
            <span class="screenings-row__label">Location</span>
            <span class="screenings-row__value">
              {{ s.city }}, {{ s.state }}
            </span>
          </div>

          <div class="screenings-row__venue">
            <span class="screenings-row__label">Venue</span>
            <span class="screenings-row__value">{{ s.venue }}</span>
          </div>

          <div class="screenings-row__action">
            <span
              class="screenings-book"
              :class="{ 'screenings-book--disabled': s.status === 'coming-soon' }"
            ><span></span>
              <span>{{ s.status === 'coming-soon' ? 'Coming soon' : 'Buy tickets' }}</span>
            </span>
          </div>
        </component>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.screenings-page {
  --screenings-ink: #111010;
  --screenings-muted: color-mix(in srgb, var(--screenings-ink) 58%, transparent);
  --screenings-line: color-mix(in srgb, var(--screenings-ink) 14%, transparent);
  --screenings-accent: var(--arancio, #ff9944);
  --screenings-label: 12px;
  --screenings-body: clamp(16px, 1.5vw, 40px);
  --screenings-ui: 14px;
  --screenings-row-padding: 1.35rem;
  --screenings-action-width: 11rem;
  --screenings-row-gap:0 2rem;
  /* min-height: 100dvh; */
  padding:
    calc(var(--header-height, 112) * 1px + 1.5rem)
    var(--wrapper-padding);
  background: #fff;
  color: var(--screenings-ink);
  max-width: 1600px;
  margin: 0 auto;

  min-height: 75vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.screenings-page__intro {
  margin: 0 0 1rem;
  gap:2rem;
  display: flex;
  flex-direction: column;
}

.screenings-page__content {
  display: flex;
  flex-direction: column;
  gap:2rem;
  padding-bottom: 3rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--screenings-line);
}
@media (min-width: 1000px) {
.screenings-page__content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: bottom;
}

}

.screenings-page__title {
  font-size: clamp(36px, 5.5vw, 53px);
  font-weight: 300;
  letter-spacing: 0.02em;
  line-height: 1.05;
}

.screenings-page__lede {
  margin: 0;
  max-width: 34rem;
  font-family: var(--sans);
  font-size: clamp(13px, 1.1vw, 15px);
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.6;
  text-transform: uppercase;
  color: var(--screenings-muted);
}

.screenings-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: flex-end;
  flex:1;
  gap: 1rem 1.5rem;
}

.screenings-filter {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: min(100%, 14rem);
}
@media (min-width: 1000px) {
.screenings-filter {
 margin-top:-15px;
}
}

.screenings-filter__label {
  font-family: var(--sans);
  font-size: var(--screenings-label);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--screenings-muted);
}

.screenings-filter__input,
.screenings-filter__select {
  width: 100%;
  margin: 0;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--screenings-line);
  border-radius: 0;
  background: #fff;
  color: var(--screenings-ink);
  font-family: var(--sans);
  font-size: var(--screenings-ui);
  letter-spacing: 0.02em;
  appearance: none;
}

.screenings-filter__select {
  padding-right: 2rem;
  background-image:
    linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 16px) calc(50% - 2px),
    calc(100% - 11px) calc(50% - 2px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.screenings-filter__input:focus,
.screenings-filter__select:focus {
  outline: 2px solid var(--screenings-accent);
  outline-offset: 1px;
}

.screenings-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(5rem, 0.7fr) minmax(6rem, 0.95fr) minmax(6rem, 1.6fr) var(--screenings-action-width);
  column-gap: 2rem;
}

.screenings-row {
  --screenings-row-pad: var(--screenings-row-padding);
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  padding: 0;
  border-bottom: 1px solid var(--screenings-line);
  overflow: hidden;
}

.screenings-row__link {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  gap: 0 2rem;
  padding: var(--screenings-row-pad) 0;
  color: inherit;
  text-decoration: none;
}

.screenings-row--disabled .screenings-row__link {
  cursor: default;
}

.screenings-row:not(.screenings-row--disabled) .screenings-row__link {
  cursor: default;
}

.screenings-row:not(.screenings-row--disabled) .screenings-row__action {
  cursor: pointer;
}

.screenings-row:not(.screenings-row--disabled) .screenings-row__action .screenings-book,
.screenings-row:not(.screenings-row--disabled) .screenings-row__link:focus-visible .screenings-row__action .screenings-book {
  background-color: var(--screenings-ink);
  color: #fff;
}

.screenings-row__label {
  display: block;
  margin-bottom: 0.3rem;
  font-family: var(--sans);
  font-size: var(--screenings-label);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--screenings-muted);
}

.screenings-row__value {
  display: block;
  font-family: var(--serif);
  font-size: var(--screenings-body);
  font-weight: 300;
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.screenings-row--disabled .screenings-row__action {
  opacity: 0.3;
}

/* .screenings-row--disabled .screenings-row__value {
  opacity: 0.6;
} */

.screenings-row__date {
  grid-column: 1;
}

.screenings-row__location {
  grid-column: 2;
}

.screenings-row__venue {
  grid-column: 3;
}

.screenings-row__date,
.screenings-row__location,
.screenings-row__venue {
  align-self: start;
}

.screenings-row__action {
  grid-column: 4;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: var(--screenings-action-width);
  min-width: var(--screenings-action-width);
}

.screenings-book {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 2.85rem;
  padding: 0.6rem 0.75rem .5rem;
  border: 3px double var(--screenings-ink);
  font-family: var(--sans);
  font-size: var(--screenings-ui);
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  color: var(--screenings-ink);
  border-radius: 0px;
    corner-shape: rounded;
  transition: background-color 0.15s ease, color 0.15s ease;
  pointer-events: none;
}


/* .screenings-book {
  background:transparent !important;
  display:flex !important;
  border:none !important;
  border-radius: 0;
}
.screenings-row__action {
  --screenings-action-width: 13rem !important;
}
.screenings-book span {
  border:1px double var(--screenings-ink);
  color: var(--screenings-ink);
  border-radius: 7px;
    corner-shape: scoop;
    min-width: 40px;
    padding: 15px;
    height:50px;
}
.screenings-book span:first-child {
  border-right:1px dashed var(--screenings-ink);
}
.screenings-book span:last-child {
  border-left:0px dashed var(--screenings-ink);
} */




.screenings-empty {
  padding: 3rem 0;
  text-align: center;
}

.screenings-empty__title {
  margin: 0 0 0.5rem;
  font-size: clamp(26px, 3vw, 34px);
  text-transform: uppercase;
}

.screenings-empty__text {
  margin: 0;
  font-family: var(--sans);
  font-size: var(--screenings-ui);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--screenings-muted);
}

@media (max-width: 799px) {
  .screenings-list {
    grid-template-columns: 1fr 1fr;
  }

  .screenings-row__link {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .screenings-row__venue {
    grid-column: 1 / -1;
  }

  .screenings-row__action {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
    max-width: none;
    justify-content: flex-start;
  }
}
</style>
