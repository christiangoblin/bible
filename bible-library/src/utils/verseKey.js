// Shared helpers for identifying a specific verse across translations,
// and the palette used by the verse-highlighting feature.

export function verseKey(translationId, book, chapter, verse) {
  return `${translationId}|${book}|${chapter}|${verse}`
}

// name -> { bg, label } used by the highlight color picker and rendering.
export const HIGHLIGHT_COLORS = {
  yellow: { bg: '#F6E58D', label: 'Yellow' },
  green: { bg: '#C9E4B0', label: 'Green' },
  blue: { bg: '#BFD7EA', label: 'Blue' },
  pink: { bg: '#F2C6D6', label: 'Pink' },
  purple: { bg: '#D9C6EE', label: 'Purple' },
}
