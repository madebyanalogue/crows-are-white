<script setup lang="ts">
import gsap from 'gsap'

const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Screenings'
useHead({ title: 'Screenings — Crows Are White' })

usePageColor({
  pageColor: '#ffffff',
  pageTextColor: '#111010',
  menuBackgroundColor: '#ffffff',
  menuTextColor: '#111010',
  menuHighlightColor: '#ff9944',
  basketIconColor: '#111010',
})

const { screenings } = useSiteContent()

const cityFilter = ref('')
const stateFilter = ref('')
const listRef = ref<HTMLElement | null>(null)

let listTween: gsap.core.Tween | null = null

const TICKET_STUBS = [
  '/images/screenings/stub-red.png',
  '/images/screenings/stub-gold.png',
] as const

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
  if (filtered.value.length) animateRows({ pageLoad: true })
})

watch(filtered, () => {
  animateRows()
})

onBeforeUnmount(() => {
  listTween?.kill()
})
</script>

<template>
  <div class="screenings-page">
    <header class="screenings-page__intro">
      <h1 class="screenings-page__title serif">Screenings</h1>
      <p class="screenings-page__lede">
        Find a theatrical screening near you — ticket links go straight to each venue’s box office.
      </p>
    </header>

    <div class="screenings-toolbar">
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
    </div>

    <div
      v-if="filtered.length === 0"
      class="screenings-empty"
    >
      <p class="screenings-empty__title serif">No screenings found</p>
      <p class="screenings-empty__text">
        Try clearing your filters, or check back soon for new dates.
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

        <div
          class="screenings-row__stub"
          :class="{ 'screenings-row__stub--empty': s.status === 'coming-soon' }"
          aria-hidden="true"
        >
          <div
            v-if="s.status !== 'coming-soon'"
            class="screenings-row__stub-stack"
          >
            <img
              v-for="(stub, stubIndex) in TICKET_STUBS"
              :key="stub"
              :src="stub"
              alt=""
              class="screenings-row__stub-img"
              :class="`screenings-row__stub-img--${stubIndex}`"
              width="180"
              height="64"
              loading="lazy"
            >
          </div>
        </div>

        <div class="screenings-row__action">
          <span
            v-if="s.status === 'coming-soon'"
            class="screenings-book screenings-book--disabled"
            aria-disabled="true"
          >
            Coming soon
          </span>
          <a
            v-else
            :href="s.ticketUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="screenings-book"
          >
            Buy tickets
          </a>
        </div>
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
  --screenings-stub-width: clamp(3.25rem, 4.5vw, 4.75rem);
  --screenings-stub-size: clamp(2.85rem, 5.25vw, 5.25rem);
  min-height: 100dvh;
  padding:
    calc(var(--header-height, 112) * 1px + 1.5rem)
    clamp(1rem, 3vw, 2rem)
    3rem;
  background: #fff;
  color: var(--screenings-ink);
  max-width: 1600px;
  margin: 0 auto;
}

.screenings-page__intro {
  max-width: 36rem;
  margin: 0 0 2.5rem;
}

.screenings-page__title {
  margin: 0 0 0.85rem;
  font-size: clamp(36px, 5.5vw, 58px);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.05;
  text-transform: uppercase;
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
  gap: 1rem 1.5rem;
  padding-bottom: 1rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--screenings-line);
}

.screenings-filter {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: min(100%, 14rem);
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
  grid-template-columns: minmax(5rem, 0.7fr) minmax(6rem, 0.95fr) minmax(6rem, 1.6fr) 0 var(--screenings-action-width);
  column-gap: 2rem;
}

.screenings-row {
  --screenings-row-pad: var(--screenings-row-padding);
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  gap: 0 2rem;
  padding: var(--screenings-row-pad) 0;
  border-bottom: 1px solid var(--screenings-line);
  overflow: hidden;
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

.screenings-row__stub {
  grid-column: 4;
  position: relative;
  align-self: stretch;
  justify-self: stretch;
  width: var(--screenings-stub-width);
  margin-block: calc(-1 * var(--screenings-row-pad));
  overflow: hidden;
  pointer-events: none;
}

.screenings-row__stub--empty {
  display: none;
}

.screenings-row__stub-stack {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: calc(100% + (2 * var(--screenings-row-pad)));
}

.screenings-row__stub-img {
  position: absolute;
  left: 0;
  bottom: 0;
  display: block;
  height: var(--screenings-stub-size);
  width: auto;
  max-width: none;
  object-fit: contain;
  transform-origin: left bottom;
  transform: translateY(115%) rotate(0deg) scale(1);
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.screenings-row__stub-img--0 {
  z-index: 1;
}

.screenings-row__stub-img--1 {
  z-index: 2;
}

.screenings-row:has(.screenings-book:hover) .screenings-row__stub-img--0,
.screenings-row:has(.screenings-book:focus-visible) .screenings-row__stub-img--0 {
  transform: translateY(0) rotate(-10deg) scale(1.12);
}

.screenings-row:has(.screenings-book:hover) .screenings-row__stub-img--1,
.screenings-row:has(.screenings-book:focus-visible) .screenings-row__stub-img--1 {
  transform: translateY(-10%) rotate(8deg) scale(1.18);
}

.screenings-row__action {
  grid-column: 5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: var(--screenings-action-width);
  min-width: var(--screenings-action-width);
  overflow: visible;
}

.screenings-book {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 2.85rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--screenings-ink);
  font-family: var(--sans);
  font-size: var(--screenings-ui);
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  color: var(--screenings-ink);
  text-decoration: none;
  background: #fff;
  transition: opacity 0.15s ease;
}

.screenings-book:hover,
.screenings-book:focus-visible {
  opacity: 0.55;
}

.screenings-book--disabled {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none;
}

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

  .screenings-row {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .screenings-row__venue,
  .screenings-row__stub {
    grid-column: 1 / -1;
  }

  .screenings-row__stub:not(.screenings-row__stub--empty) {
    visibility: visible;
    width: 100%;
    margin-block: calc(-1 * var(--screenings-row-pad));
  }

  .screenings-row__stub--empty {
    display: none;
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
