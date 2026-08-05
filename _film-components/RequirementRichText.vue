<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

type Segment =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; href: string; external: boolean }

const referenceLinks: Record<string, string> = {
  'neonrated.com': 'https://www.neonrated.com/',
  'neon rated': 'https://www.neonrated.com/',
  'a24': 'https://a24films.com/',
  'aftersun': 'https://a24films.com/films/after-sun',
  'criterion.com': 'https://www.criterion.com/',
  'criterion collection': 'https://www.criterion.com/',
  'type goes here': 'http://www.typegoeshere.com/',
  'typegoeshere.com': 'http://www.typegoeshere.com/',
  'andreisanidiot.film/tickets': 'https://andreisanidiot.film/tickets',
  'andre is an idiot': 'https://andreisanidiot.film/tickets',
  'blueheron.film': 'https://blueheron.film/',
  'thelovethatremains.film': 'https://thelovethatremains.film/',
  'hokum.film': 'https://hokum.film/',
  'ourherobalthazar.com': 'https://ourherobalthazar.com/',
  'janusfilms.com/films/2307': 'https://www.janusfilms.com/films/2307',
  'sandboxfilms.org/films/fire-of-love': 'https://www.sandboxfilms.org/films/fire-of-love',
  'fire of love': 'https://www.sandboxfilms.org/films/fire-of-love',
  'hundredsofbeavers.com': 'https://www.hundredsofbeavers.com/',
  'powster.com': 'https://www.powster.com/products/',
  'powster': 'https://www.powster.com/products/',
  'assemble': 'https://assemble.tv/',
  'iloveboosters.film': 'https://www.iloveboosters.film/',
}

const segments = computed(() => {
  const result: Segment[] = []
  const pattern =
    /(https?:\/\/[^\s,)]+|[\w.+-]+@[\w.-]+\.\w+|(?:[a-z0-9-]+\.)+(?:com|film|org|co\.uk)(?:\/[^\s,)]*)?)/gi

  let lastIndex = 0
  let match: RegExpExecArray | null

  const text = props.text
  const regex = new RegExp(pattern.source, pattern.flags)

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    const value = match[0].replace(/[.,;]+$/, '')
    const trailing = match[0].slice(value.length)
    const lower = value.toLowerCase()

    if (value.includes('@')) {
      result.push({ type: 'link', value, href: `mailto:${value}`, external: false })
    } else if (value.startsWith('http')) {
      result.push({ type: 'link', value, href: value, external: true })
    } else {
      const href =
        referenceLinks[lower] ??
        referenceLinks[Object.keys(referenceLinks).find((key) => lower.includes(key)) ?? ''] ??
        `https://${value.replace(/^\/\//, '')}`

      result.push({ type: 'link', value, href, external: true })
    }

    if (trailing) {
      result.push({ type: 'text', value: trailing })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    result.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return result.length ? result : [{ type: 'text', value: text }]
})
</script>

<template>
  <span>
    <template v-for="(segment, index) in segments" :key="index">
      <span v-if="segment.type === 'text'">{{ segment.value }}</span>
      <a
        v-else
        :href="segment.href"
        class="font-medium text-wire-ink underline decoration-1 underline-offset-2 hover:decoration-2"
        :target="segment.external ? '_blank' : undefined"
        :rel="segment.external ? 'noopener noreferrer' : undefined"
      >
        {{ segment.value }}
      </a>
    </template>
  </span>
</template>
