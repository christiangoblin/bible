import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { translations, STATUS } from './data/catalog.js'
import { loadTranslationText } from './utils/loadTranslation.js'
import { parseReference, getVerses, formatReference } from './utils/reference.js'
import { searchTranslation } from './utils/search.js'

import TranslationSwitcher from './components/TranslationSwitcher.jsx'
import BookChapterPicker from './components/BookChapterPicker.jsx'
import ReadingPane from './components/ReadingPane.jsx'
import SearchResults from './components/SearchResults.jsx'
import CatalogPage from './components/CatalogPage.jsx'

const openTranslations = translations.filter((t) => t.status === STATUS.OPEN)

export default function App() {
  const [view, setView] = useState('read') // 'read' | 'catalog'
  const [activeId, setActiveId] = useState(openTranslations[0]?.id ?? null)
  const [book, setBook] = useState('John')
  const [chapter, setChapter] = useState(3)
  const [verseRangeInput, setVerseRangeInput] = useState('')
  const [refInput, setRefInput] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const [textData, setTextData] = useState(null)
  const [loading, setLoading] = useState(false)

  const activeTranslation = useMemo(
    () => translations.find((t) => t.id === activeId) || null,
    [activeId]
  )

  // Load verse data whenever the active translation changes
  useEffect(() => {
    if (!activeTranslation || activeTranslation.status !== STATUS.OPEN) {
      setTextData(null)
      return
    }
    setLoading(true)
    loadTranslationText(activeTranslation.file).then((data) => {
      setTextData(data)
      setLoading(false)
    })
  }, [activeTranslation])

  // Build the current reference from book/chapter/verseRangeInput
  const currentRef = useMemo(() => {
    let str = `${book} ${chapter}`
    if (verseRangeInput.trim()) str += `:${verseRangeInput.trim()}`
    return parseReference(str)
  }, [book, chapter, verseRangeInput])

  const verses = useMemo(() => {
    if (!textData || !currentRef) return []
    return getVerses(textData.books, currentRef)
  }, [textData, currentRef])

  const handleGoToReference = useCallback(() => {
    const parsed = parseReference(refInput)
    if (!parsed) return
    setBook(parsed.book)
    setChapter(parsed.chapter)
    setVerseRangeInput(
      parsed.verseStart
        ? parsed.verseEnd && parsed.verseEnd !== parsed.verseStart
          ? `${parsed.verseStart}-${parsed.verseEnd}`
          : `${parsed.verseStart}`
        : ''
    )
    setSearchResults(null)
    setView('read')
  }, [refInput])

  const handleSearch = useCallback(() => {
    if (!textData || !searchInput.trim()) {
      setSearchResults(null)
      return
    }
    const results = searchTranslation(textData.books, searchInput)
    setSearchResults(results)
    setView('read')
  }, [textData, searchInput])

  const handlePickSearchResult = useCallback((r) => {
    setBook(r.book)
    setChapter(r.chapter)
    setVerseRangeInput(String(r.verse))
    setSearchResults(null)
  }, [])

  const handleSelectFromCatalog = useCallback((id) => {
    setActiveId(id)
    setView('read')
    setSearchResults(null)
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">Open Bible Library</span>
        </div>

        <nav className="top-nav" style={{ marginBottom: 20 }}>
          <button className={view === 'read' ? 'active' : ''} onClick={() => setView('read')}>
            Read
          </button>
          <button className={view === 'catalog' ? 'active' : ''} onClick={() => setView('catalog')}>
            All translations ({translations.length})
          </button>
        </nav>

        <div className="sidebar-section">
          <label className="sidebar-label" htmlFor="ref-go">Go to a passage</label>
          <div className="ref-row">
            <input
              id="ref-go"
              className="ref-input"
              placeholder="e.g. Genesis 1:1-9"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoToReference()}
            />
            <button className="go-btn" onClick={handleGoToReference}>Go</button>
          </div>
          <div className="hint">Or browse by book and chapter:</div>
          <BookChapterPicker
            book={book}
            chapter={chapter}
            onChange={({ book: b, chapter: c }) => {
              setBook(b)
              setChapter(c)
              setVerseRangeInput('')
              setSearchResults(null)
            }}
          />
          <input
            className="search-box"
            style={{ marginTop: 8 }}
            placeholder="Verse range, e.g. 1-9 (optional)"
            value={verseRangeInput}
            onChange={(e) => setVerseRangeInput(e.target.value)}
          />
        </div>

        <div className="sidebar-section">
          <label className="sidebar-label" htmlFor="kw-search">Search this translation</label>
          <div className="ref-row">
            <input
              id="kw-search"
              className="ref-input"
              placeholder="Search a word or phrase…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="go-btn" onClick={handleSearch}>Find</button>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">Translation</span>
          <TranslationSwitcher
            translations={translations}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id)
              setSearchResults(null)
            }}
          />
        </div>
      </aside>

      <main className="main-pane">
        {view === 'catalog' ? (
          <CatalogPage translations={translations} onRead={handleSelectFromCatalog} />
        ) : searchResults ? (
          <SearchResults
            results={searchResults}
            query={searchInput}
            translationName={activeTranslation?.name}
            onPick={handlePickSearchResult}
          />
        ) : (
          <ReadingPane
            translation={activeTranslation}
            refLabel={formatReference(currentRef) || `${book} ${chapter}`}
            verses={verses}
            loading={loading}
          />
        )}
      </main>
    </div>
  )
}
