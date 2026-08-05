import { plainTextFromBlocks } from '~/utils/portableText'

const LINE_BREAK_TYPES = new Set(['lineBreak', 'break'])

function getTextLabel(element) {
  return element.textContent?.replace(/\s+/g, ' ').trim() || ''
}

function normalizePortableTextMarks(marks = []) {
  return marks.filter((mark) => mark === 'em' || mark === 'strong')
}

export function collectPortableTextTokens(blocks) {
  const tokens = []

  if (!Array.isArray(blocks)) return tokens

  blocks.forEach((block, blockIndex) => {
    if (block._type !== 'block') return

    if (blockIndex > 0) {
      tokens.push({ type: 'break' })
    }

    block.children?.forEach((child) => {
      if (LINE_BREAK_TYPES.has(child._type)) {
        tokens.push({ type: 'break' })
        return
      }

      if (child._type && child._type !== 'span') return

      tokenizeText(
        child.text || '',
        normalizePortableTextMarks(child.marks),
        tokens,
      )
    })
  })

  return tokens
}

function appendTokensToElement(tokens, element, words) {
  tokens.forEach((token) => {
    if (token.type === 'break') {
      element.appendChild(document.createElement('br'))
      return
    }

    const span = createWordElement(token)
    element.appendChild(span)
    words.push(span)
  })
}

export function prepareSplitPortableText(element, blocks, { lineBreaks = 'visual' } = {}) {
  const label = plainTextFromBlocks(blocks) || getTextLabel(element)
  element.textContent = ''

  if (label) {
    element.setAttribute('aria-label', label)
  }

  const tokens = collectPortableTextTokens(blocks)

  if (lineBreaks === 'explicit') {
    const lines = groupWordsByExplicitBreaks(tokens, element)
    return {
      label,
      lines,
      words: lines.flat(),
    }
  }

  const words = []
  appendTokensToElement(tokens, element, words)

  return {
    label,
    lines: groupWordsIntoVisualLines(words),
    words,
  }
}

function activeMarksForElement(element) {
  const marks = []
  const tag = element.tagName?.toUpperCase()

  if (tag === 'EM' || tag === 'I') marks.push('em')
  if (tag === 'STRONG' || tag === 'B') marks.push('strong')

  return marks
}

function tokenizeText(text, marks, tokens) {
  if (!text) return

  let index = 0

  while (index < text.length) {
    if (text[index] === '\n' || text[index] === '\u2028') {
      tokens.push({ type: 'break' })
      index += 1
      continue
    }

    while (index < text.length && /\s/.test(text[index])) {
      if (text[index] === '\n' || text[index] === '\u2028') {
        tokens.push({ type: 'break' })
        index += 1
        continue
      }

      const lastToken = tokens.at(-1)
      if (lastToken?.type === 'word') {
        lastToken.spaceAfter = true
      }
      index += 1
    }

    if (index >= text.length) break

    const wordStart = index
    while (index < text.length && !/\s/.test(text[index])) {
      index += 1
    }

    tokens.push({
      type: 'word',
      text: text.slice(wordStart, index),
      marks: [...marks],
      spaceAfter: false,
    })
  }
}

function collectTokens(nodes) {
  const tokens = []

  function walk(node, marks = []) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        tokenizeText(child.textContent || '', marks, tokens)
        return
      }

      if (child.nodeType !== Node.ELEMENT_NODE) return

      if (child.tagName === 'BR') {
        tokens.push({ type: 'break' })
        return
      }

      walk(child, [...marks, ...activeMarksForElement(child)])
    })
  }

  nodes.forEach((node) => walk(node))
  return tokens
}

function applyMarkClasses(span, marks = []) {
  if (marks.includes('em')) span.classList.add('split-word--em')
  if (marks.includes('strong')) span.classList.add('split-word--strong')
}

function createWordElement(token) {
  const span = document.createElement('span')
  span.className = 'split-word'
  applyMarkClasses(span, token.marks)
  span.textContent = `${token.text}${token.spaceAfter ? '\u00a0' : ''}`
  return span
}

const LINE_TOP_TOLERANCE = 3

function groupWordsIntoVisualLines(words) {
  if (!words.length) return []

  const lines = []
  let currentLine = [words[0]]
  let lineTop = words[0].getBoundingClientRect().top

  for (let index = 1; index < words.length; index += 1) {
    const word = words[index]
    const top = word.getBoundingClientRect().top

    if (Math.abs(top - lineTop) > LINE_TOP_TOLERANCE) {
      lines.push(currentLine)
      currentLine = [word]
      lineTop = top
      continue
    }

    currentLine.push(word)
  }

  lines.push(currentLine)
  return lines
}

function groupWordsByExplicitBreaks(tokens, element) {
  const lines = []
  let currentLine = []

  tokens.forEach((token) => {
    if (token.type === 'break') {
      if (currentLine.length) lines.push(currentLine)
      currentLine = []
      return
    }

    const span = createWordElement(token)
    element.appendChild(span)
    currentLine.push(span)
  })

  if (currentLine.length) lines.push(currentLine)
  return lines
}

export function prepareSplitText(element, { lineBreaks = 'visual' } = {}) {
  const label = getTextLabel(element)
  const sourceNodes = Array.from(element.childNodes)
  element.textContent = ''

  if (label) {
    element.setAttribute('aria-label', label)
  }

  const tokens = collectTokens(sourceNodes)

  if (lineBreaks === 'explicit') {
    const lines = groupWordsByExplicitBreaks(tokens, element)
    return {
      label,
      lines,
      words: lines.flat(),
    }
  }

  const words = []

  tokens.forEach((token) => {
    if (token.type === 'break') {
      element.appendChild(document.createElement('br'))
      return
    }

    const span = createWordElement(token)
    element.appendChild(span)
    words.push(span)
  })

  return {
    label,
    lines: groupWordsIntoVisualLines(words),
    words,
  }
}

export function wrapWords(element) {
  return prepareSplitText(element).words
}

export function groupWordsIntoLines(words) {
  return groupWordsIntoVisualLines(words)
}

export function buildLineElements(element, lines, label) {
  element.textContent = ''
  if (label) element.setAttribute('aria-label', label)

  return lines.map((lineWords) => {
    const line = document.createElement('div')
    line.className = 'split-line'
    const inner = document.createElement('div')
    inner.className = 'split-line__inner'
    lineWords.forEach((word) => inner.appendChild(word))
    line.appendChild(inner)
    element.appendChild(line)
    return inner
  })
}

export function splitElementIntoLines(element) {
  const { label, lines, words } = prepareSplitText(element)
  if (!words.length) return []

  return buildLineElements(element, lines, label)
}

export function restoreSplitElement(element) {
  const text = Array.from(element.querySelectorAll('.split-word'))
    .map((word) => word.textContent?.replace(/\u00a0/g, ' ').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  element.textContent = text
  element.removeAttribute('aria-label')
}

export const INTRO_BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, blockquote'
