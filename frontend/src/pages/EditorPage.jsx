import { useState, useEffect, useCallback, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { rust } from '@codemirror/lang-rust'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Play,
  Shield,
  Copy,
  Trash2,
  Download,
  History,
  X,
  ChevronLeft,
  Clock,
  FileCode,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Share2,
} from 'lucide-react'
import './EditorPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: javascript, defaultCode: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));` },
  { id: 'python', name: 'Python', ext: python, defaultCode: `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(fibonacci(10))` },
  { id: 'java', name: 'Java', ext: java, defaultCode: `public class Main {\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(fibonacci(10));\n    }\n}` },
  { id: 'cpp', name: 'C++', ext: cpp, defaultCode: `#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    cout << fibonacci(10) << endl;\n    return 0;\n}` },
  { id: 'html', name: 'HTML', ext: html, defaultCode: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>My App</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n    <p>Welcome to my application.</p>\n</body>\n</html>` },
  { id: 'css', name: 'CSS', ext: css, defaultCode: `.container {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    min-height: 100vh;\n    background: #f6f1e8;\n}\n\n.card {\n    padding: 2rem;\n    border-radius: 1rem;\n    background: rgba(255, 252, 245, 0.72);\n    border: 1px solid rgba(77, 73, 62, 0.14);\n    box-shadow: 0 18px 42px rgba(59, 53, 43, 0.12);\n}` },
  { id: 'go', name: 'Go', ext: go, defaultCode: `package main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n    if n <= 1 {\n        return n\n    }\n    return fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n    fmt.Println(fibonacci(10))\n}` },
  { id: 'rust', name: 'Rust', ext: rust, defaultCode: `fn fibonacci(n: u32) -> u32 {\n    if n <= 1 {\n        return n;\n    }\n    fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfn main() {\n    println!("{}", fibonacci(10));\n}` },
]

const HISTORY_KEY = 'scrutin_review_history'

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
}

function EditorPage() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])
  const [code, setCode] = useState(LANGUAGES[0].defaultCode)
  const [review, setReview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState('review') // 'review' | 'security'
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState(getHistory)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard shortcut: Ctrl+Enter to review
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleReview()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

  const handleLanguageChange = useCallback((lang) => {
    setSelectedLang(lang)
    setCode(lang.defaultCode)
    setLangDropdownOpen(false)
  }, [])

  const handleReview = useCallback(async () => {
    if (isLoading || !code.trim()) return
    setIsLoading(true)
    setReview('')
    try {
      const endpoint = mode === 'security' ? '/ai/security-scan' : '/ai/get-review'
      const response = await axios.post(`${API_URL}${endpoint}`, { code })
      const result = response.data
      setReview(result)

      // Save to history
      const entry = {
        id: Date.now(),
        language: selectedLang.name,
        mode,
        code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
        review: result,
        timestamp: new Date().toISOString(),
      }
      const updated = [entry, ...history]
      setHistory(updated)
      saveHistory(updated)
      toast.success(`${mode === 'security' ? 'Security scan' : 'Code review'} complete!`)
    } catch (error) {
      console.error('Error reviewing code:', error)
      const serverMessage = typeof error.response?.data === 'string'
        ? error.response.data
        : error.message
      const fallbackMessage = mode === 'security'
        ? 'Unable to complete the security scan. Please try again.'
        : 'Unable to get code review. Please try again.'
      const message = serverMessage || fallbackMessage

      setReview(`## Error\n${message}`)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [code, isLoading, mode, selectedLang, history])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied!')
  }, [code])

  const handleClear = useCallback(() => {
    setCode('')
    setReview('')
  }, [])

  const handleDownload = useCallback(() => {
    const extensions = {
      javascript: '.js', python: '.py', java: '.java', cpp: '.cpp',
      html: '.html', css: '.css', go: '.go', rust: '.rs',
    }
    const ext = extensions[selectedLang.id] || '.txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scrutin-code${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded!')
  }, [code, selectedLang])

  const handleShareReview = useCallback(() => {
    if (!review) return
    navigator.clipboard.writeText(review)
    toast.success('Review copied as markdown!')
  }, [review])

  const handleHistorySelect = useCallback((entry) => {
    setReview(entry.review)
    setHistoryOpen(false)
  }, [])

  const handleDeleteHistory = useCallback((id, e) => {
    e.stopPropagation()
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    saveHistory(updated)
    toast.success('Entry deleted')
  }, [history])

  const lineCount = code.split('\n').length
  const charCount = code.length

  return (
    <div className="editor-page" id="editor-page">
      {/* Toolbar */}
      <div className="editor-toolbar" id="editor-toolbar">
        <div className="editor-toolbar__left">
          {/* Language Selector */}
          <div className="lang-selector" ref={langDropdownRef} id="lang-selector">
            <button
              className="lang-selector__btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              id="lang-selector-btn"
            >
              <FileCode size={16} />
              <span>{selectedLang.name}</span>
              <ChevronDown size={14} className={langDropdownOpen ? 'rotate-180' : ''} />
            </button>
            {langDropdownOpen && (
              <div className="lang-selector__dropdown" id="lang-dropdown">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    className={`lang-selector__option ${lang.id === selectedLang.id ? 'lang-selector__option--active' : ''}`}
                    onClick={() => handleLanguageChange(lang)}
                    id={`lang-option-${lang.id}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="mode-toggle" id="mode-toggle">
            <button
              className={`mode-toggle__btn ${mode === 'review' ? 'mode-toggle__btn--active' : ''}`}
              onClick={() => setMode('review')}
              id="mode-review"
            >
              <Sparkles size={14} />
              <span>Review</span>
            </button>
            <button
              className={`mode-toggle__btn ${mode === 'security' ? 'mode-toggle__btn--active' : ''}`}
              onClick={() => setMode('security')}
              id="mode-security"
            >
              <ShieldCheck size={14} />
              <span>Security</span>
            </button>
          </div>
        </div>

        <div className="editor-toolbar__right">
          <button className="toolbar-btn" onClick={handleCopy} title="Copy code" id="btn-copy">
            <Copy size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleDownload} title="Download code" id="btn-download">
            <Download size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleClear} title="Clear editor" id="btn-clear">
            <Trash2 size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => setHistoryOpen(!historyOpen)}
            title="Review history"
            id="btn-history"
          >
            <History size={16} />
            {history.length > 0 && <span className="toolbar-btn__badge">{history.length}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-main">
        {/* History Sidebar */}
        <div className={`history-sidebar ${historyOpen ? 'history-sidebar--open' : ''}`} id="history-sidebar">
          <div className="history-sidebar__header">
            <h3>
              <History size={16} />
              <span>Review History</span>
            </h3>
            <button onClick={() => setHistoryOpen(false)} className="history-sidebar__close" id="history-close">
              <X size={18} />
            </button>
          </div>
          <div className="history-sidebar__list">
            {history.length === 0 ? (
              <div className="history-sidebar__empty">
                <Clock size={24} />
                <p>No reviews yet</p>
              </div>
            ) : (
              history.map(entry => (
                <div
                  key={entry.id}
                  className="history-entry"
                  onClick={() => handleHistorySelect(entry)}
                >
                  <div className="history-entry__header">
                    <span className={`history-entry__mode history-entry__mode--${entry.mode}`}>
                      {entry.mode === 'security' ? <Shield size={12} /> : <Sparkles size={12} />}
                      {entry.mode === 'security' ? 'Security' : 'Review'}
                    </span>
                    <span className="history-entry__lang">{entry.language}</span>
                    <button
                      className="history-entry__delete"
                      onClick={(e) => handleDeleteHistory(entry.id, e)}
                      title="Delete"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="history-entry__code">{entry.code}</p>
                  <span className="history-entry__time">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="editor-panel" id="code-editor-panel">
          <div className="editor-panel__code">
            <CodeMirror
              value={code}
              height="100%"
              extensions={[selectedLang.ext()]}
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

          {/* Status bar */}
          <div className="editor-status" id="editor-status">
            <span>{selectedLang.name}</span>
            <span className="editor-status__divider">|</span>
            <span>{lineCount} lines</span>
            <span className="editor-status__divider">|</span>
            <span>{charCount} chars</span>
            <div className="editor-status__right">
              <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to review
            </div>
          </div>

          {/* Review Button */}
          <button
            className={`review-action-btn ${isLoading ? 'review-action-btn--loading' : ''} ${mode === 'security' ? 'review-action-btn--security' : ''}`}
            onClick={handleReview}
            disabled={isLoading}
            id="review-action-btn"
          >
            {isLoading ? (
              <div className="review-action-btn__loader">
                <div className="spinner" />
                <span>Analyzing...</span>
              </div>
            ) : mode === 'security' ? (
              <>
                <Shield size={18} />
                <span>Security Scan</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Review Code</span>
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="output-panel" id="output-panel">
          <div className="output-panel__header">
            <span className="output-panel__title">
              {mode === 'security' ? (
                <><ShieldCheck size={16} /> Security Report</>
              ) : (
                <><Sparkles size={16} /> Review Output</>
              )}
            </span>
            {review && (
              <button className="toolbar-btn toolbar-btn--small" onClick={handleShareReview} title="Copy review" id="btn-share-review">
                <Share2 size={14} />
              </button>
            )}
          </div>

          <div className="output-panel__content">
            {isLoading ? (
              <div className="output-loading" id="output-loading">
                <div className="output-loading__icon">
                  {mode === 'security' ? <Shield size={32} /> : <Sparkles size={32} />}
                </div>
                <div className="output-loading__skeleton">
                  <div className="skeleton-line skeleton-line--wide" />
                  <div className="skeleton-line skeleton-line--medium" />
                  <div className="skeleton-line skeleton-line--narrow" />
                  <div className="skeleton-line skeleton-line--wide" />
                  <div className="skeleton-line skeleton-line--medium" />
                </div>
                <p className="output-loading__text">
                  {mode === 'security' ? 'Scanning for vulnerabilities...' : 'AI is reviewing your code...'}
                </p>
              </div>
            ) : review ? (
              <div className="output-markdown">
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </div>
            ) : (
              <div className="output-empty" id="output-empty">
                <div className="output-empty__icon">
                  <ChevronLeft size={20} />
                  <span>/</span>
                  <ChevronLeft size={20} style={{ transform: 'scaleX(-1)' }} />
                </div>
                <h3>Ready to Review</h3>
                <p>
                  Write or paste your code in the editor, select a review mode,
                  and click <strong>Review Code</strong> or press <kbd>Ctrl+Enter</kbd>.
                </p>
                <div className="output-empty__features">
                  <div className="output-empty__feature">
                    <Sparkles size={14} />
                    <span>Code quality analysis</span>
                  </div>
                  <div className="output-empty__feature">
                    <Shield size={14} />
                    <span>Security vulnerability detection</span>
                  </div>
                  <div className="output-empty__feature">
                    <Play size={14} />
                    <span>Performance suggestions</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorPage
