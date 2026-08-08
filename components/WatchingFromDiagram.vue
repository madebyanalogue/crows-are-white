<script setup>
import { WORLD_LAND_PATH } from '~/utils/worldMapOutline'

const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
  activeLocationId: {
    type: String,
    default: '',
  },
})

const diagramRef = ref(null)
const hoveredLocation = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

function isActive(location) {
  return Boolean(props.activeLocationId) && location.id === props.activeLocationId
}

function markerRadius(location) {
  if (isActive(location)) return 2.8
  return 1.8
}

function markerOpacity(location) {
  if (!props.activeLocationId) return 0.82
  return isActive(location) ? 1 : 0.28
}

function tooltipLabel(location) {
  const count = location.countryCount || location.count || 0
  const suffix = count === 1 ? 'reflection' : 'reflections'
  return `${location.country} · ${count} ${suffix}`
}

function updateTooltipPosition(event) {
  const bounds = diagramRef.value?.getBoundingClientRect()
  if (!bounds) return

  tooltipPosition.value = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

function showTooltip(location, event) {
  hoveredLocation.value = location
  updateTooltipPosition(event)
}

function moveTooltip(event) {
  if (!hoveredLocation.value) return
  updateTooltipPosition(event)
}

function hideTooltip() {
  hoveredLocation.value = null
}
</script>

<template>
  <div
    ref="diagramRef"
    class="watching-from-diagram"
    @mouseleave="hideTooltip"
  >
    <svg
      class="watching-from-diagram__svg"
      viewBox="0 0 360 180"
      role="img"
      aria-label="Map of places people are watching from"
    >
      <path
        :d="WORLD_LAND_PATH"
        class="watching-from-diagram__land"
      />

      <g class="watching-from-diagram__markers">
        <g
          v-for="location in locations"
          :key="location.id"
          class="watching-from-diagram__marker"
          :class="{ 'watching-from-diagram__marker--active': isActive(location) }"
          @mouseenter="showTooltip(location, $event)"
          @mousemove="moveTooltip"
        >
          <circle
            :cx="location.x"
            :cy="location.y"
            r="5"
            class="watching-from-diagram__marker-hit"
          />
          <circle
            :cx="location.x"
            :cy="location.y"
            :r="markerRadius(location)"
            :opacity="markerOpacity(location)"
          />
          <circle
            v-if="isActive(location)"
            :cx="location.x"
            :cy="location.y"
            r="5.5"
            class="watching-from-diagram__marker-ring"
          />
        </g>
      </g>
    </svg>

    <div
      v-if="hoveredLocation"
      class="watching-from-diagram__tooltip serif"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }"
      role="tooltip"
    >
      {{ tooltipLabel(hoveredLocation) }}
    </div>
  </div>
</template>

<style scoped>
.watching-from-diagram {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  border: 1px dashed color-mix(in srgb, currentColor 24%, transparent);
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.watching-from-diagram__svg {
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
}

.watching-from-diagram__land {
  fill: none;
  stroke: currentColor;
  stroke-width: 0.55;
  vector-effect: non-scaling-stroke;
  opacity: 0.34;
}

.watching-from-diagram__marker {
  cursor: pointer;
}

.watching-from-diagram__marker-hit {
  fill: transparent;
  pointer-events: all;
}

.watching-from-diagram__marker circle:nth-child(2) {
  fill: currentColor;
  pointer-events: none;
  transition:
    opacity 0.25s ease,
    r 0.25s ease;
}

.watching-from-diagram__marker-ring {
  fill: none;
  stroke: currentColor;
  stroke-width: 0.55;
  pointer-events: none;
  opacity: 0.35;
}

.watching-from-diagram__tooltip {
  position: absolute;
  z-index: 2;
  transform: translate(-50%, calc(-100% - 10px));
  padding: 0.35rem 0.55rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: color-mix(in srgb, var(--page-color, #f7f6f4) 92%, transparent);
  color: inherit;
  font-size: 0.72rem;
  font-weight: 300;
  letter-spacing: 0.03em;
  white-space: nowrap;
  pointer-events: none;
}
</style>
