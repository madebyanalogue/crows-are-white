<script setup>
defineProps({
  depth: {
    type: Number,
    default: 0,
  },
  maxDepth: {
    type: Number,
    default: 25,
  },
  segmentHeight: {
    type: Number,
    default: 7,
  },
})

const localSegmentPoints = '96.35 7 99.05 7 100.7 5.35 100.7 0 94.7 0 94.7 5.35 96.35 7'
</script>

<template>
  <g :transform="depth > 0 ? `translate(0 ${segmentHeight})` : undefined">
    <g class="tear-segment">
      <polygon
        class="section-stack__cover-segment"
        :points="localSegmentPoints"
      />
      <StackCoverTearStrip
        v-if="depth + 1 < maxDepth"
        :depth="depth + 1"
        :max-depth="maxDepth"
        :segment-height="segmentHeight"
      />
    </g>
  </g>
</template>
