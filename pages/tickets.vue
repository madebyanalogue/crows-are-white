<script setup lang="ts">
import { screenings } from '~/data/site'

const cityFilter = ref('')
const stateFilter = ref('')

const filtered = computed(() =>
  screenings.filter((s) => {
    const cityMatch =
      !cityFilter.value || s.city.toLowerCase().includes(cityFilter.value.toLowerCase())
    const stateMatch = !stateFilter.value || s.state === stateFilter.value
    return cityMatch && stateMatch
  }),
)
</script>

<template>
  <div class="page-section">
    <PageHeader
      title="Get Tickets"
      subtitle="Primary conversion page. City-by-city listings sorted by date, powered by Assemble or Powster."
    />

    <WireNote title="Primary conversion page" tone="warn" class="mb-8">
      Reference: andreisanidiot.film/tickets, blueheron.film, thelovethatremains.film
    </WireNote>

    <div class="mb-10 flex flex-wrap gap-4">
      <input
        v-model="cityFilter"
        type="search"
        placeholder="Filter by city"
        class="input-wire max-w-xs"
      />
      <select v-model="stateFilter" class="input-wire max-w-[160px]">
        <option value="">All states</option>
        <option value="CA">CA</option>
        <option value="NY">NY</option>
        <option value="IL">IL</option>
        <option value="TX">TX</option>
        <option value="WA">WA</option>
      </select>
    </div>

    <div class="surface overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-stone-100 text-left label-caps">
          <tr>
            <th class="px-6 py-4 font-medium">Date</th>
            <th class="px-6 py-4 font-medium">City</th>
            <th class="px-6 py-4 font-medium">State</th>
            <th class="px-6 py-4 font-medium">Venue</th>
            <th class="px-6 py-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y-2 divide-wire-border">
          <tr v-for="s in filtered" :key="`${s.city}-${s.date}`" class="hover:bg-stone-50">
            <td class="px-6 py-5">{{ s.date }}</td>
            <td class="px-6 py-5">{{ s.city }}</td>
            <td class="px-6 py-5">{{ s.state }}</td>
            <td class="px-6 py-5">{{ s.venue }}</td>
            <td class="px-6 py-5 text-right">
              <span
                v-if="s.status === 'coming-soon'"
                class="border-2 border-amber-600 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-800"
              >
                Coming Soon
              </span>
              <button v-else type="button" class="btn-primary text-xs px-3 py-1.5">
                Buy Tickets
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
