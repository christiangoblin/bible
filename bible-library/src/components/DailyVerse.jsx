import React from 'react'

export default function DailyVerse({ verse, translationName, onDismiss, onOpen }) {
  if (!verse) return null

  return (
    <div className="daily-verse">
      <div className="daily-verse-label">Verse of the day</div>
      <p className="daily-verse-text">
        “{verse.text}”
        <span className="daily-verse-ref">
          {' '}
          — {verse.book} {verse.chapter}:{verse.verse}
        </span>
      </p>
      <div className="daily-verse-actions">
        <button type="button" className="go-btn" onClick={onOpen}>
          Read in context
        </button>
        <button type="button" className="daily-verse-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
      <div className="daily-verse-meta">{translationName}</div>
    </div>
  )
}
