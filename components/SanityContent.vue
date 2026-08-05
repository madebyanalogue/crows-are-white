<template>
  <div class="sanity-content">
    <component
      v-for="(block, index) in renderedBlocks"
      :key="index"
      :is="block"
    />
  </div>
</template>

<script setup>
import { h, computed } from 'vue'
import { renderPortableTextChildren } from '~/utils/portableTextRender'

const props = defineProps({
  blocks: {
    type: Array,
    required: true,
  },
})

const { isSamePageHref, scrollToTop } = useMenuLinks()

function onRichTextLinkClick(event, href) {
  if (!isSamePageHref(href)) return
  event.preventDefault()
  scrollToTop()
}

function renderChildren(children = [], markDefs = []) {
  return renderPortableTextChildren(children, {
    markDefs,
    onLinkClick: onRichTextLinkClick,
  })
}

const HEADING_CLASSES = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
}

function getBlockTag(block) {
  if (block.style === 'h1') return 'h1'
  if (block.style === 'h2') return 'h2'
  if (block.style === 'h3') return 'h3'
  if (block.style === 'h4') return 'h4'
  if (block.style === 'h5') return 'h5'
  if (block.style === 'h6') return 'h6'
  if (block.style === 'blockquote') return 'blockquote'
  return 'p'
}

function renderBlock(block, index) {
  if (block._type !== 'block') return null

  const tag = getBlockTag(block)
  const children = renderChildren(block.children, block.markDefs)

  return h(tag, { key: `block-${index}`, class: HEADING_CLASSES[tag] }, children)
}

function parseListGroup(blocks, startIndex) {
  const first = blocks[startIndex]
  const listTag = first.listItem === 'number' ? 'ol' : 'ul'
  const level = first.level || 1
  const listItems = []
  let index = startIndex

  while (index < blocks.length) {
    const block = blocks[index]
    if (block._type !== 'block' || !block.listItem) break
    if ((block.level || 1) < level) break

    if ((block.level || 1) === level) {
      const itemChildren = [renderChildren(block.children, block.markDefs)]
      index++

      if (
        index < blocks.length
        && blocks[index].listItem
        && (blocks[index].level || 1) > level
      ) {
        const [nestedList, nextIndex] = parseListGroup(blocks, index)
        itemChildren.push(nestedList)
        index = nextIndex
      }

      listItems.push(h('li', { key: `li-${index}` }, itemChildren))
      continue
    }

    break
  }

  return [h(listTag, { key: `list-${startIndex}` }, listItems), index]
}

const renderedBlocks = computed(() => {
  if (!props.blocks || !Array.isArray(props.blocks)) return []

  const nodes = []
  let index = 0

  while (index < props.blocks.length) {
    const block = props.blocks[index]

    if (block._type === 'divider') {
      nodes.push(h('hr', {
        key: `divider-${block._key || index}`,
        class: 'page-content__divider',
      }))
      index++
      continue
    }

    if (block._type === 'spacer') {
      nodes.push(h('div', {
        key: `spacer-${block._key || index}`,
        class: 'page-content__spacer',
      }))
      index++
      continue
    }

    if (block._type === 'block' && block.listItem) {
      const [listNode, nextIndex] = parseListGroup(props.blocks, index)
      nodes.push(listNode)
      index = nextIndex
      continue
    }

    const node = renderBlock(block, index)
    if (node) nodes.push(node)
    index++
  }

  return nodes
})
</script>

<style scoped>
.sanity-content :deep(p + p),
.sanity-content :deep(blockquote + p),
.sanity-content :deep(ul + p),
.sanity-content :deep(ol + p),
.sanity-content :deep(p + ul),
.sanity-content :deep(p + ol) {
  margin-top: 1em;
}

.sanity-content :deep(ul ul),
.sanity-content :deep(ol ol),
.sanity-content :deep(ul ol),
.sanity-content :deep(ol ul) {
  margin-top: calc(var(--unit) * 0.25);
}

.sanity-content :deep(.page-content__divider) {
  width: 100%;
  height: 1px;
  margin: calc(var(--unit) * 4) 0;
  border: 0;
  background: currentColor;
  opacity: 0.2;
}

.sanity-content :deep(.page-content__spacer) {
  display: block;
  min-height: 3em;
}
</style>
