<template>
  <component :is="inlineRoot" />
</template>

<script setup>
import { h, computed } from 'vue'
import { renderPortableTextChildren } from '~/utils/portableTextRender'

const props = defineProps({
  blocks: {
    type: Array,
    default: () => [],
  },
})

function renderChildren(children = [], markDefs = []) {
  return renderPortableTextChildren(children, { markDefs })
}

const inlineNodes = computed(() => {
  if (!props.blocks?.length) return []

  const nodes = []

  props.blocks.forEach((block, blockIndex) => {
    if (block._type !== 'block') return

    if (blockIndex > 0) {
      nodes.push(h('br'))
    }

    nodes.push(...renderChildren(block.children, block.markDefs))
  })

  return nodes
})

const inlineRoot = computed(() => {
  if (!inlineNodes.value.length) return null
  return h('span', { class: 'sanity-inline' }, inlineNodes.value)
})
</script>
