export function parseAspectRatioString(raw) {
  if (typeof raw !== 'string') return null

  const normalized = raw.trim()
  if (!normalized) return null

  const decimal = Number(normalized)
  if (Number.isFinite(decimal) && decimal > 0) {
    return String(decimal)
  }

  const slashMatch = normalized.match(/^([0-9]*\.?[0-9]+)\s*\/\s*([0-9]*\.?[0-9]+)$/)
  if (!slashMatch) return null

  const numerator = Number(slashMatch[1])
  const denominator = Number(slashMatch[2])
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || numerator <= 0 || denominator <= 0) {
    return null
  }

  return `${numerator} / ${denominator}`
}
