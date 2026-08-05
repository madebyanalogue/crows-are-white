<template>
  <div
    class="crows-colour-wall"
    aria-hidden="true"
  >
    <div
      v-for="(panel, index) in panels"
      :key="index"
      class="crows-colour-wall__panel"
      :class="{ 'crows-colour-wall__panel--split': panel.colors }"
    >
      <template v-if="panel.colors">
        <div
          v-for="(color, colorIndex) in panel.colors"
          :key="colorIndex"
          class="crows-colour-wall__half"
          :style="{ backgroundColor: `var(--${color})` }"
        />
      </template>
      <template v-else>
        <div
          class="crows-colour-wall__fill"
          :style="{ backgroundColor: `var(--${panel.color})` }"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
const panels = [
  { color: 'obsidian' },
  { colors: ['racing-green', 'aintree'] },
  { color: 'crema' },
  { color: 'fuji' },
  { color: 'crayon' },
  { colors: ['verdea', 'arancio'] },
]
</script>

<style scoped>
.crows-colour-wall {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  width: 100%;
  aspect-ratio: 14 / 1;
  min-height: 2.75rem;
}

.crows-colour-wall__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.crows-colour-wall__panel--split {
  display: grid;
  grid-template-rows: 1fr 1fr;
}

.crows-colour-wall__fill,
.crows-colour-wall__half {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
