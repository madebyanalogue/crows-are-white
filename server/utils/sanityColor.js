/** GROQ projection: returns hex string, falling back to legacy token strings. */
export function colorField(name) {
  return `"${name}": coalesce(${name}.hex, ${name})`
}
