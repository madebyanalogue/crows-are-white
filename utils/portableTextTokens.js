export function getDefaultPortableTextTokens(date = new Date()) {
  return {
    '[year]': String(date.getFullYear()),
  }
}

export function applyPortableTextTokens(blocks, replacements = {}) {
  if (!Array.isArray(blocks) || !blocks.length) return blocks

  const entries = Object.entries(replacements)
  if (!entries.length) return blocks

  function replaceText(text) {
    if (!text) return text

    return entries.reduce(
      (result, [token, value]) => result.replaceAll(token, value),
      text,
    )
  }

  return blocks.map((block) => {
    if (block._type !== 'block' || !Array.isArray(block.children)) return block

    return {
      ...block,
      children: block.children.map((child) => {
        if (!child?.text) return child
        return {
          ...child,
          text: replaceText(child.text),
        }
      }),
    }
  })
}
