export function formatTrustpilotSummaryText(businessUnit) {
  const score = businessUnit?.score
  const total = businessUnit?.numberOfReviews?.total

  if (!score && !total) return ''

  const parts = []

  if (score?.trustScore) {
    parts.push(`Rated ${score.trustScore.toFixed(1)} out of 5`)
  }

  if (total) {
    parts.push(`${total.toLocaleString()} reviews`)
  }

  return parts.join(' · ')
}
