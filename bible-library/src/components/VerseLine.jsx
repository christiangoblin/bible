import React, { useState, useRef, useEffect } from 'react'
import { HIGHLIGHT_COLORS } from '../utils/verseKey.js'

export default function VerseLine({
  book,
  chapter,
  verse,
  text,
  isJesus,
  redLetterEnabled,
  redLetterColor,
  isBookmarked,
  highlightColor,
  onToggleBookmark,
  onSetHighlight,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const handleCopy = async () => {
    const quote = `"${text}" — ${book} ${chapter}:${verse}`
    try {
      await navigator.clipboard.writeText(quote)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable — silently no-op.
    }
  }

  const verseStyle =
    isJesus && redLetterEnabled ? { color: redLetterColor } : undefined

  const wrapStyle = highlightColor
    ? { backgroundColor: HIGHLIGHT_COLORS[highlightColor]?.bg }
    : undefined

  return (
    <span className="verse-line" ref={rootRef}>
      <p className="verse" style={wrapStyle}>
        <span className="verse-num">{verse}</span>
        <span style={verseStyle}>{text}</span>
        <span className="verse-toolbar">
          <button
            type="button"
            className={`verse-btn ${isBookmarked ? 'active' : ''}`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
            onClick={onToggleBookmark}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
          <button
            type="button"
            className="verse-btn"
            title="Copy verse"
            onClick={handleCopy}
          >
            {copied ? '✓' : '⧉'}
          </button>
          <span className="verse-highlight-wrap">
            <button
              type="button"
              className={`verse-btn ${highlightColor ? 'active' : ''}`}
              title="Highlight this verse"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ✎
            </button>
            {menuOpen && (
              <span className="highlight-menu">
                {Object.entries(HIGHLIGHT_COLORS).map(([name, c]) => (
                  <button
                    key={name}
                    type="button"
                    className="highlight-swatch"
                    style={{ background: c.bg }}
                    title={c.label}
                    onClick={() => {
                      onSetHighlight(name)
                      setMenuOpen(false)
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="highlight-swatch highlight-clear"
                  title="Clear highlight"
                  onClick={() => {
                    onSetHighlight(null)
                    setMenuOpen(false)
                  }}
                >
                  ✕
                </button>
              </span>
            )}
          </span>
        </span>
      </p>
    </span>
  )
}
