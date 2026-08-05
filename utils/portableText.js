export function plainTextFromBlocks(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map((block) => block.children?.map((child) => child.text).join('') || '')
    .join(' ')
    .trim()
}

export function splitDropCap(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) {
    return { letter: '', blocks: blocks || [] }
  }

  const firstBlock = blocks[0]
  if (firstBlock._type !== 'block' || !firstBlock.children?.length) {
    return { letter: '', blocks }
  }

  const firstChild = firstBlock.children[0]
  if (!firstChild?.text?.length) {
    return { letter: '', blocks }
  }

  const letter = firstChild.text[0]
  const rest = firstChild.text.slice(1)
  const modifiedBlocks = structuredClone(blocks)

  if (rest) {
    modifiedBlocks[0].children[0].text = rest
  } else if (modifiedBlocks[0].children.length > 1) {
    modifiedBlocks[0].children = modifiedBlocks[0].children.slice(1)
  } else {
    modifiedBlocks.shift()
  }

  return { letter, blocks: modifiedBlocks }
}
