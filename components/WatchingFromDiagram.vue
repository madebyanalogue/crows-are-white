<script setup>
import { WORLD_LAND_PATH } from '~/utils/worldMapOutline'
import {
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
  buildWatchingFromMapMarkers,
  formatWatchingFromMapMarkerTooltip,
} from '~/utils/watchingFrom'

const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
  activeLocationId: {
    type: String,
    default: '',
  },
  selectedMarkerId: {
    type: String,
    default: '',
  },
  lightStyle: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-marker'])

const diagramRef = ref(null)
const diagramSize = ref({ width: 0, height: 0 })
const hoveredMarker = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const mapMarkers = computed(() =>
  buildWatchingFromMapMarkers(props.locations, diagramSize.value),
)

function isActive(marker) {
  if (props.selectedMarkerId) {
    return marker.id === props.selectedMarkerId
  }

  if (!props.activeLocationId) return false

  return marker.locations.some((location) => location.id === props.activeLocationId)
}

function isSelected(marker) {
  return Boolean(props.selectedMarkerId) && marker.id === props.selectedMarkerId
}

function markerOpacity() {
  return 1
}

function markerRadius(marker) {
  if (marker.isCluster) {
    if (isSelected(marker)) return 3.6
    if (isActive(marker)) return 3.2
    return 2.6
  }

  if (isSelected(marker)) return 3.2
  if (isActive(marker)) return 2.8
  return 1.8
}

function markerHitRadius(marker) {
  return marker.isCluster ? 8 : 6
}

function selectMarker(marker) {
  emit('select-marker', marker)
}

function tooltipLines(marker) {
  return formatWatchingFromMapMarkerTooltip(marker)
}

function updateTooltipPosition(event) {
  const bounds = diagramRef.value?.getBoundingClientRect()
  if (!bounds) return

  tooltipPosition.value = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

function showTooltip(marker, event) {
  hoveredMarker.value = marker
  updateTooltipPosition(event)
}

function moveTooltip(event) {
  if (!hoveredMarker.value) return
  updateTooltipPosition(event)
}

function hideTooltip() {
  hoveredMarker.value = null
}

function updateDiagramSize() {
  const bounds = diagramRef.value?.getBoundingClientRect()
  if (!bounds) return

  diagramSize.value = {
    width: bounds.width,
    height: bounds.height,
  }
}

let resizeObserver = null

onMounted(() => {
  updateDiagramSize()

  if (!import.meta.client || !diagramRef.value) return

  resizeObserver = new ResizeObserver(() => {
    updateDiagramSize()
  })
  resizeObserver.observe(diagramRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.locations,
  () => nextTick(updateDiagramSize),
  { deep: true },
)
</script>

<template>
  <div
    ref="diagramRef"
    class="watching-from-diagram"
    :class="{ 'watching-from-diagram--light': lightStyle }"
    @mouseleave="hideTooltip"
  >
    <svg
      class="watching-from-diagram__svg"
      :viewBox="`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Map of places people are watching from"
    >
      <path
        :d="WORLD_LAND_PATH"
        class="watching-from-diagram__land"
      />

      <g class="watching-from-diagram__markers">
        <g
          v-for="marker in mapMarkers"
          :key="marker.id"
          class="watching-from-diagram__marker"
          :class="{
            'watching-from-diagram__marker--cluster': marker.isCluster,
            'watching-from-diagram__marker--active': isActive(marker),
            'watching-from-diagram__marker--selected': isSelected(marker),
          }"
          @mouseenter="showTooltip(marker, $event)"
          @mousemove="moveTooltip"
          @mouseleave="hideTooltip"
          @click="selectMarker(marker)"
        >
          <circle
            :cx="marker.x"
            :cy="marker.y"
            :r="markerHitRadius(marker)"
            class="watching-from-diagram__marker-hit"
          />

          <circle
            :cx="marker.x"
            :cy="marker.y"
            :r="markerRadius(marker)"
            class="watching-from-diagram__marker-dot"
            :opacity="markerOpacity()"
          />

          <circle
            v-if="marker.isCluster"
            :cx="marker.x"
            :cy="marker.y"
            :r="markerRadius(marker) + 1.8"
            class="watching-from-diagram__marker-ring"
            :opacity="isSelected(marker) || isActive(marker) ? 0.55 : 0.35"
          />

          <circle
            v-else-if="isActive(marker) || isSelected(marker)"
            :cx="marker.x"
            :cy="marker.y"
            r="5.5"
            class="watching-from-diagram__marker-ring"
            :opacity="0.35"
          />
        </g>
      </g>
    </svg>

    <div
      v-if="hoveredMarker"
      class="watching-from-diagram__tooltip serif"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }"
      role="tooltip"
    >
      <span class="watching-from-diagram__tooltip-line">{{ tooltipLines(hoveredMarker).primary }}</span>
      <span
        v-if="tooltipLines(hoveredMarker).secondary"
        class="watching-from-diagram__tooltip-line watching-from-diagram__tooltip-line--secondary"
      >
        {{ tooltipLines(hoveredMarker).secondary }}
      </span>
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

.watching-from-diagram--light .watching-from-diagram__land {
  stroke: #fff;
  opacity: 0.4;
}

.watching-from-diagram--light .watching-from-diagram__marker-dot {
  fill: #fff;
}

.watching-from-diagram--light .watching-from-diagram__marker-ring {
  stroke: #fff;
}

.watching-from-diagram__marker {
  cursor: pointer;
}

.watching-from-diagram__marker-hit {
  fill: transparent;
  pointer-events: all;
}

.watching-from-diagram__marker-dot {
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
  vector-effect: non-scaling-stroke;
  transition: opacity 0.25s ease;
}

.watching-from-diagram__tooltip {
  position: absolute;
  z-index: 2;
  transform: translate(-50%, calc(-100% - 10px));
  display: grid;
  gap: 0.2rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: color-mix(in srgb, var(--page-color, #f7f6f4) 92%, transparent);
  color: inherit;
  font-size: 0.72rem;
  font-weight: 300;
  letter-spacing: 0.03em;
  line-height: 1.35;
  max-width: min(16rem, 70vw);
  pointer-events: none;
}

.watching-from-diagram__tooltip-line {
  display: block;
  white-space: nowrap;
}

.watching-from-diagram__tooltip-line--secondary {
  opacity: 0.72;
  white-space: normal;
}
</style>
