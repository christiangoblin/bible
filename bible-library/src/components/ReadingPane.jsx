import React, { useState, useEffect, useCallback } from 'react'
import { STATUS } from '../data/catalog.js'
import { parseStrongsText, tagNumber, loadStrongsDictionary } from '../utils/strongs.js'
import StrongsPopup from './StrongsPopup.jsx'

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

function StrongsWord({ text, tags, onOpen }) {
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    onOpen({
      word: text,
      tags,
      position: { top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX },
    })
  }
  return (
    <span className="strongs-word" onClick={handleClick}>
      {text}
    </span>
  )
}

export default function ReadingPane({ translation, refLabel, verses, loading }) {
  const [strongsDict, setStrongsDict] = useState(null)
  const [popup, setPopup] = useState(null) // { word, tags, position }

  const hasStrongs = !!translation?.hasStrongs

  useEffect(() => {
    setPopup(null)
    if (hasStrongs) {
      loadStrongsDictionary().then(setStrongsDict)
    }
  }, [hasStrongs, translation?.id])

  const openPopup = useCallback(({ word, tags, position }) => {
    setPopup({ word, tags, position })
  }, [])

  const closePopup = useCallback(() => setPopup(null), [])

  if (!translation) {
    return (
      <div className="empty-state">
        Choose a translation from the list on the left to start reading.
      </div>
    )
  }

  const popupEntries = popup
    ? popup.tags.map((tag) => {
        const num = tagNumber(tag)
        return { number: num, entry: strongsDict ? strongsDict[num] || null : null }
      })
    : []

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
                {hasStrongs ? (
                  <VerseTextWithPopup text={v.text} onOpen={openPopup} />
                ) : (
                  v.text
                )}
              </p>
            ))}
        </div>
      )}

      {popup && (
        <StrongsPopup
          word={popup.word}
          entries={popupEntries}
          position={popup.position}
          onClose={closePopup}
        />
      )}
    </div>
  )
}

function VerseTextWithPopup({ text, onOpen }) {
  const segments = parseStrongsText(text)
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <React.Fragment key={i}>{seg.content}</React.Fragment>
        ) : seg.tags.length === 0 ? (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        ) : (
          <StrongsWord key={i} text={seg.text} tags={seg.tags} onOpen={onOpen} />
        )
      )}
    </>
  )
}
