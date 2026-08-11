/** GROQ projection: returns hex + alpha, falling back to legacy token strings. */
export function colorField(name) {
  return `"${name}": select(
    defined(${name}.hex) => {
      "hex": ${name}.hex,
      "alpha": coalesce(${name}.alpha, ${name}.rgb.a, 1)
    },
    ${name}
  )`
}
