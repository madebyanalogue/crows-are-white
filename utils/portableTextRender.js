import { h } from 'vue'

const LINE_BREAK_TYPES = new Set(['lineBreak', 'break'])
const SOFT_BREAK_PATTERN = /\r?\n|\u2028/

function applyMarks(node, marks = [], markDefs = [], onLinkClick) {
  if (!marks?.length) return node

  return marks.reduce((current, mark) => {
    if (mark === 'strong') return h('strong', current)
    if (mark === 'em') return h('em', current)

    const def = markDefs.find((item) => item._key === mark)
    if (def?._type === 'link' && def.href) {
      return h('a', {
        href: def.href,
        onClick: (event) => onLinkClick?.(event, def.href),
      }, current)
    }

    return current
  }, node)
}

export function renderPortableTextChildren(children = [], {
  markDefs = [],
  onLinkClick,
} = {}) {
  const nodes = []

  children.forEach((child) => {
    if (LINE_BREAK_TYPES.has(child._type)) {
      nodes.push(h('br'))
      return
    }

    if (child._type && child._type !== 'span') {
      if (child.text) nodes.push(child.text)
      return
    }

    const text = child.text || ''
    if (!SOFT_BREAK_PATTERN.test(text)) {
      if (text) nodes.push(applyMarks(text, child.marks, markDefs, onLinkClick))
      return
    }

    const parts = text.split(SOFT_BREAK_PATTERN)

    parts.forEach((part, index) => {
      if (part) {
        nodes.push(applyMarks(part, child.marks, markDefs, onLinkClick))
      }

      if (index < parts.length - 1) {
        nodes.push(h('br'))
      }
    })
  })

  return nodes
}
