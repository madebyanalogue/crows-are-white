<script setup lang="ts">
const pageTitle = useState('pageTitle', () => '')
pageTitle.value = 'Host a Screening'

useHead({ title: 'Host a Screening — Crows Are White' })

usePageColor({
  pageColor: '#141414',
  pageTextColor: '#4f4f4e',
  menuBackgroundColor: '#ffffff',
  menuTextColor: '#1a1a1a',
  menuHighlightColor: '#ff59d0',
  basketIconColor: '#1a1a1a',
})

const orgTypes = [
  'College / University',
  'Buddhist or Meditation Center',
  'Interfaith or Religious Organization',
  'Cultural Institution',
  'Community Cinema',
  'Other',
]

const audienceSizes = [
  'Under 25',
  '25–50',
  '50–100',
  '100–250',
  '250+',
]

const form = reactive({
  name: '',
  email: '',
  organizationName: '',
  organizationType: '',
  expectedAudience: '',
  city: '',
  state: '',
  preferredDates: '',
  notes: '',
})

function onSubmit() {
  // Wire to bookings@crowsarewhite.com / API later
}
</script>

<template>
  <div class="host-screening">
    <div class="host-screening__inner">
      <div class="host-screening__form-container">
        <h1 class="host-screening__title serif">Host a Screening</h1>
        <p class="host-screening__intro">
          We’re excited you’re interested in screening our film. Fill out the form and we’ll be in touch soon.
        </p>

        <form class="host-form" @submit.prevent="onSubmit">
          <div class="host-form__rule host-form__rule--double" aria-hidden="true" />

          <div class="host-form__rows">
            <label class="host-form__row host-form__row--name">
              <span class="host-form__label">Name<span class="host-form__req" aria-hidden="true">*</span></span>
              <input
                v-model="form.name"
                class="host-form__input handwritten"
                type="text"
                name="name"
                required
                autocomplete="name"
              >
            </label>

            <div class="host-form__rule host-form__rule--double" aria-hidden="true" />

            <label class="host-form__row">
              <span class="host-form__label">Email<span class="host-form__req" aria-hidden="true">*</span></span>
              <input
                v-model="form.email"
                class="host-form__input"
                type="email"
                name="email"
                required
                autocomplete="email"
              >
            </label>

            <label class="host-form__row">
              <span class="host-form__label">Organization name<span class="host-form__req" aria-hidden="true">*</span></span>
              <input
                v-model="form.organizationName"
                class="host-form__input"
                type="text"
                name="organizationName"
                required
                autocomplete="organization"
              >
            </label>

            <div class="host-form__row">
              <span class="host-form__label">Organization type<span class="host-form__req" aria-hidden="true">*</span></span>
              <HostFormDropdown
                v-model="form.organizationType"
                name="organizationType"
                label="Organization type"
                placeholder="Type..."
                :options="orgTypes"
                required
              />
            </div>

            <div class="host-form__row">
              <span class="host-form__label">Expected audience</span>
              <HostFormDropdown
                v-model="form.expectedAudience"
                name="expectedAudience"
                label="Expected audience"
                placeholder="Size..."
                :options="audienceSizes"
              />
            </div>

            <label class="host-form__row">
              <span class="host-form__label">City</span>
              <input
                v-model="form.city"
                class="host-form__input"
                type="text"
                name="city"
                autocomplete="address-level2"
              >
            </label>

            <label class="host-form__row">
              <span class="host-form__label">State</span>
              <input
                v-model="form.state"
                class="host-form__input"
                type="text"
                name="state"
                autocomplete="address-level1"
              >
            </label>

            <label class="host-form__row host-form__row--dates">
              <span class="host-form__label">Preferred date(s)</span>
              <textarea
                v-model="form.preferredDates"
                class="host-form__input host-form__textarea"
                name="preferredDates"
                rows="3"
              />
            </label>

            <label class="host-form__row host-form__row--notes">
              <span class="host-form__label">Notes</span>
              <textarea
                v-model="form.notes"
                class="host-form__input host-form__textarea"
                name="notes"
                rows="3"
              />
            </label>
          </div>

          <div class="host-form__rule host-form__rule--double" aria-hidden="true" />

          <div class="host-form__footer">
            <p class="host-form__legend">
              <span class="host-form__legend-dot" aria-hidden="true" />
              <span>= Required</span>
            </p>
            <button type="submit" class="host-form__submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.host-screening {
  --host-line: color-mix(in srgb, #4f4f4e 28%, transparent);
  --host-ink: #4f4f4e;
  --host-hand: #ff59d0;
  --host-form-bg: #ebe4eb;
  /* Nav sits at top: 2rem/3.5rem + 50px bar — clear it on both ends */
  --host-nav-clearance: calc(2rem + 50px + 1.5rem);
  box-sizing: border-box;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding:
    var(--host-nav-clearance)
    var(--wrapper-padding, 25px)
    var(--host-nav-clearance);
}

@media (min-width: 700px) {
  .host-screening {
    --host-nav-clearance: calc(3.5rem + 50px + 1.5rem);
  }
}

.host-screening__inner {
  width: min(100%, 580px);
  margin-top: auto;
  margin-bottom: auto;
  margin-left: auto;
  margin-right: auto;
}

.host-screening__form-container {
  background: var(--host-form-bg);
  color: var(--host-ink);
  padding: 35px;
}

.host-screening__title {
  margin: 0 0 1.25rem;
  text-align: center;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--host-ink);
}

.host-screening__intro {
  margin: 0 auto 2.5rem;
  max-width: 28rem;
  text-align: center;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.55;
  text-transform: uppercase;
  color: var(--host-ink);
}

.host-form {
  margin: 0;
}

.host-form__rule {
  height: 1px;
  background: var(--host-line);
}

.host-form__rule--double {
  box-shadow: 0 3px 0 var(--host-line);
  margin: 0;
  width: 100%;
  flex-shrink: 0;
}

.host-form__rows {
  display: flex;
  flex-direction: column;
}

.host-form__row {
  display: grid;
  grid-template-columns: minmax(8.5rem, 34%) 1fr;
  align-items: stretch;
  height: 50px;
  border-bottom: 1px solid var(--host-line);
  cursor: text;
  box-sizing: border-box;
}

.host-form__row--name {
  height: 72px;
  border-bottom: 0;
}

.host-form__row--dates {
  height: 100px;
}

.host-form__row--notes {
  height: 130px;
  border-bottom: 0;
}

.host-form__label {
  display: flex;
  align-items: center;
  padding: 0 1rem 0 0;
  border-right: 1px solid var(--host-line);
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: uppercase;
  color: var(--host-ink);
}

.host-form__row--dates .host-form__label,
.host-form__row--notes .host-form__label {
  align-items: flex-start;
  padding-top: 1.1rem;
}

.host-form__req {
  margin-left: 0.15em;
}

.host-form__input,
.host-form__textarea {
  width: 100%;
  height: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0 1.1rem;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: uppercase;
  color: var(--host-ink);
  outline: none;
  appearance: none;
  border-radius: 0;
  box-shadow: none;
}

.host-form__row--name .host-form__input {
  font-family: var(--handwritten);
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1.2;
  text-transform: none;
  color: var(--host-hand);
}

.host-form__input::placeholder,
.host-form__textarea::placeholder {
  color: color-mix(in srgb, var(--host-ink) 45%, transparent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.host-form__textarea {
  resize: none;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.host-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 1.35rem;
}

.host-form__legend {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
  color: var(--host-ink);
}

.host-form__legend-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e11d48;
  flex-shrink: 0;
}

.host-form__submit {
  border: 0;
  background: transparent;
  padding: 0;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--host-ink);
  cursor: pointer;
}

.host-form__submit:hover {
  opacity: 0.55;
}

@media (max-width: 699px) {
  .host-form__row,
  .host-form__row--name,
  .host-form__row--dates,
  .host-form__row--notes {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 50px;
  }

  .host-form__row--name {
    min-height: 72px;
  }

  .host-form__row--dates {
    min-height: 100px;
  }

  .host-form__row--notes {
    min-height: 130px;
  }

  .host-form__label {
    border-right: 0;
    padding: 0.85rem 0 0.15rem;
  }

  .host-form__row--dates .host-form__label,
  .host-form__row--notes .host-form__label {
    padding-top: 0.85rem;
  }

  .host-form__input,
  .host-form__textarea {
    padding-left: 0;
    height: auto;
    min-height: 2rem;
  }

  .host-form__textarea {
    min-height: 4rem;
  }

  .host-form__row :deep(.host-dropdown__trigger) {
    padding-left: 0;
  }
}
</style>
