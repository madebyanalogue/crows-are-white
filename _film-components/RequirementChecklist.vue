<script setup lang="ts">
const props = defineProps<{
  items: string[]
  storageKey: string
}>()

const checked = useCookie<Record<string, boolean>>(`caw-req-${props.storageKey}`, {
  default: () => ({}),
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})

function isChecked(index: number) {
  return !!checked.value[String(index)]
}

function toggle(index: number) {
  const key = String(index)
  checked.value = {
    ...checked.value,
    [key]: !checked.value[key],
  }
}
</script>

<template>
  <ul class="space-y-3 text-sm leading-relaxed">
    <li
      v-for="(item, index) in items"
      :key="index"
      class="flex items-start gap-3"
    >
      <input
        :id="`${storageKey}-${index}`"
        type="checkbox"
        class="req-checkbox mt-0.5 shrink-0"
        :checked="isChecked(index)"
        @change="toggle(index)"
      />
      <label
        :for="`${storageKey}-${index}`"
        class="cursor-pointer"
        :class="isChecked(index) ? 'text-stone-500 line-through' : 'text-stone-800'"
      >
        <RequirementRichText :text="item" />
      </label>
    </li>
  </ul>
</template>

<style scoped>
.req-checkbox {
  @apply h-4 w-4 cursor-pointer appearance-none border border-wire-ink bg-white;
}

.req-checkbox:checked {
  @apply bg-wire-ink;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M12.2 4.2 6.8 10.2 3.8 7.2l-1.2 1.4 4.2 4.2 6.8-7.4z'/%3E%3C/svg%3E");
  background-size: 12px;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
