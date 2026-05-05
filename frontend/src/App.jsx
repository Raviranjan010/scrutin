import { useState, useMemo, useRef, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { go } from '@codemirror/lang-go'
import { rust } from '@codemirror/lang-rust'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import './App.css'

const LANGUAGES = {
  javascript:  { label: 'JavaScript',  ext: () => javascript() },
  typescript:  { label: 'TypeScript',  ext: () => javascript({ typescript: true }) },
  python:      { label: 'Python',      ext: () => python() },
  go:          { label: 'Go',          ext: () => go() },
  rust:        { label: 'Rust',        ext: () => rust() },
  java:        { label: 'Java',        ext: () => java() },
  php:         { label: 'PHP',         ext: () => javascript() },
  ruby:        { label: 'Ruby',        ext: () => javascript() },
  cpp:         { label: 'C++',         ext: () => javascript() },
  swift:       { label: 'Swift',       ext: () => javascript() },
  kotlin:      { label: 'Kotlin',      ext: () => java() },
  sql:         { label: 'SQL',         ext: () => javascript() },
}

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1\n}`)
  const [review, setReview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [language, setLanguage] = useState('javascript')
  const reviewBodyRef = useRef(null)

  const langExtension = useMemo(() => LANGUAGES[language].ext(), [language])

  const scrollToBottom = useCallback(() => {
    if (reviewBodyRef.current) {
      reviewBodyRef.current.scrollTop = reviewBodyRef.current.scrollHeight
    }
  }, [])

  async function reviewCode() {
    setIsLoading(true)
    setIsStreaming(true)
    setReview('')

    try {
      const response = await fetch('http://localhost:3000/ai/get-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: LANGUAGES[language].label }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)

          if (payload === '[DONE]') {
            setIsStreaming(false)
            setIsLoading(false)
            return
          }

          try {
            const text = JSON.parse(payload)
            setReview(prev => prev + text)
            requestAnimationFrame(scrollToBottom)
          } catch {
            // skip malformed JSON
          }
        }
      }

      // Stream ended without [DONE]
      setIsStreaming(false)
      setIsLoading(false)
    } catch (error) {
      console.error('Error reviewing code:', error)
      setReview('## Error\nUnable to get code review. Please try again.')
      setIsStreaming(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="scrutin-app">
      {/* ---- Navbar ---- */}
      <nav className="scrutin-nav fade-up" style={{ '--delay': '0s' }}>
        <div className="nav-brand">
          <div className="nav-logo">Sc</div>
          <span className="nav-wordmark">Scrutin</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#docs">Docs</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button className="nav-cta">Get started</button>
      </nav>

      {/* ---- Main panels ---- */}
      <main className="scrutin-main">
        {/* Editor panel */}
        <section className="editor-panel glass-card fade-up" style={{ '--delay': '0.1s' }}>
          <div className="editor-toolbar">
            <div className="editor-toolbar-left">
              <span className="toolbar-dot"></span>
              <span className="toolbar-dot"></span>
              <span className="toolbar-dot"></span>
              <span className="toolbar-label">editor</span>
            </div>
            <select
              id="language-selector"
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.entries(LANGUAGES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="editor-area">
            <CodeMirror
              value={code}
              height="100%"
              extensions={[langExtension]}
              theme={oneDark}
              onChange={(value) => setCode(value)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                autocompletion: true,
                foldGutter: true,
                bracketMatching: true,
                closeBrackets: true,
              }}
            />
          </div>

          <button
            id="review-button"
            className={`review-btn ${isLoading ? 'loading' : ''}`}
            onClick={reviewCode}
            disabled={isLoading}
          >
            {isLoading ? 'Reviewing\u2026' : 'Review'}
          </button>
        </section>

        {/* Review panel */}
        <section className="review-panel glass-card fade-up" style={{ '--delay': '0.2s' }}>
          <div className="review-panel-header">
            <span className="review-panel-title">Review</span>
            {isStreaming && <span className="streaming-badge">streaming</span>}
          </div>
          <div className="review-panel-body" ref={reviewBodyRef}>
            {!review && !isLoading ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#x2727;</div>
                <h2>Paste your code. Get <em>honest</em> feedback.</h2>
                <p>Select a language, write or paste your code, and let Scrutin review it for quality, bugs, and best practices.</p>
              </div>
            ) : (
              <div className={`review-content ${isStreaming ? 'is-streaming' : ''}`}>
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
                {isStreaming && <span className="streaming-cursor" />}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App