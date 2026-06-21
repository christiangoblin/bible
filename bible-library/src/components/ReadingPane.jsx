import React from 'react'
import { STATUS } from '../data/catalog.js'

const pillClass = {
  [STATUS.OPEN]: 'open',
  [STATUS.PENDING]: 'pending',
  [STATUS.RESTRICTED]: 'restricted',
}

const pillLabel = {
  [STATUS.OPEN]: 'Verified open license',
  [STATUS.PENDING]: 'Pending license review',
  [STATUS.RESTRICTED]: 'Restricted — see source',
}

export default function ReadingPane({ translation, refLabel, verses, loading }) {
  if (!translation) {
    return (
      <div className="empty-state">
        Choose a translation from the list on the left to start reading.
      </div>
    )
  }

  return (
    <div>
      <div className="reading-header">
        <div>
          <div className="reading-ref">{refLabel}</div>
          <div className="reading-translation-name">{translation.name}</div>
        </div>
      </div>

      <span className={`license-pill ${pillClass[translation.status]}`}>
        {pillLabel[translation.status]}
      </span>

      {translation.status === STATUS.PENDING && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <strong>{translation.name}</strong> is in the catalog, but its license
          hasn't been confirmed yet, so the text isn't available here. Once it's
          verified as public domain or openly licensed, this page will show the
          full text automatically.
        </div>
      )}

      {translation.status === STATUS.RESTRICTED && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <strong>{translation.name}</strong> is copyrighted: {translation.license}.
          {translation.note && <> {translation.note}</>}
          {translation.licenseUrl && (
            <>
              {' '}
              <a href={translation.licenseUrl} target="_blank" rel="noreferrer">
                View at the official source
              </a>
              .
            </>
          )}
        </div>
      )}

      {translation.status === STATUS.OPEN && (
        <div className="verse-block">
          {loading && <p>Loading…</p>}
          {!loading && verses.length === 0 && (
            <div className="empty-state">
              No text found for this reference in {translation.name}. Try a
              different book or chapter — this translation's data file may not
              include every passage yet.
            </div>
          )}
          {!loading &&
            verses.map((v) => (
              <p className="verse" key={v.verse}>
                <span className="verse-num">{v.verse}</span>
                {v.text}
              </p>
            ))}
        </div>
      )}
    </div>
  )
}
