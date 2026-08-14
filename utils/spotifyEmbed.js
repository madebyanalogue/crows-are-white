const PLAYLIST_ID_PATTERN = /(?:open\.spotify\.com(?:\/intl-[a-z]{2})?\/playlist\/|spotify:playlist:)([a-zA-Z0-9]+)/

export const SPOTIFY_PLAYLIST_EMBED_HEIGHTS = {
  compact: 152,
  full: 570,
}

export function parseSpotifyPlaylistId(value) {
  const input = value?.trim()
  if (!input) return null

  const match = input.match(PLAYLIST_ID_PATTERN)
  return match?.[1] || null
}

export function resolveSpotifyPlaylistEmbed(value, view = 'full') {
  const playlistId = parseSpotifyPlaylistId(value)
  if (!playlistId) return null

  const height = view === 'compact'
    ? SPOTIFY_PLAYLIST_EMBED_HEIGHTS.compact
    : SPOTIFY_PLAYLIST_EMBED_HEIGHTS.full

  return {
    playlistId,
    src: `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`,
    height,
  }
}
