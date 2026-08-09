<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true,
    validator: (value) => ['list', 'grid', 'map'].includes(value),
  },
  inline: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const tabs = [
  { id: 'list', label: 'List' },
  { id: 'grid', label: 'Grid' },
  { id: 'map', label: 'Map' },
]
</script>

<template>
  <div
    class="reflection-view-tabs"
    :class="{ 'reflection-view-tabs--inline': inline }"
    role="tablist"
    aria-label="Reflection views"
  >
    <template
      v-for="(tab, index) in tabs"
      :key="tab.id"
    >
      <span
        v-if="index > 0"
        class="reflection-view-tabs__divider"
        aria-hidden="true"
      >|</span>
      <button
        :id="`reflections-tab-${tab.id}`"
        type="button"
        role="tab"
        class="reflection-view-tabs__tab serif"
        :class="{ 'reflection-view-tabs__tab--active': activeTab === tab.id }"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`reflections-panel-${tab.id}`"
        @click="emit('select', tab.id)"
      >
        {{ tab.label }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.reflection-view-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(0.65rem, 1.5vw, 1rem);
  padding-top: clamp(0.25rem, 0.75vw, 0.5rem);
}

.reflection-view-tabs--inline {
  justify-content: flex-end;
  padding-top: 0;
}

.reflection-view-tabs__tab {
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font-size: clamp(0.95rem, 1.35vw, 1.05rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.reflection-view-tabs__tab--active {
  opacity: 1;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}

.reflection-view-tabs__tab:hover {
  opacity: 0.85;
}

.reflection-view-tabs__tab:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.reflection-view-tabs__divider {
  opacity: 0.35;
  font-weight: 300;
}
</style>
