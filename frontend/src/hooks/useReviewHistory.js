import { useState, useCallback } from 'react'

const STORAGE_KEY = 'scrutin_history'
const MAX_ENTRIES = 50

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function useReviewHistory() {
  const [history, setHistory] = useState(() => loadHistory())

  const saveReview = useCallback(({ language, code, review, score }) => {
    setHistory(prev => {
      const entry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        language,
        codeSnippet: (code || '').slice(0, 120),
        review,
        score,
      }
      const next = [entry, ...prev].slice(0, MAX_ENTRIES)
      persistHistory(next)
      return next
    })
  }, [])

  const deleteReview = useCallback((id) => {
    setHistory(prev => {
      const next = prev.filter(entry => entry.id !== id)
      persistHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    persistHistory([])
  }, [])

  return { history, saveReview, clearHistory, deleteReview }
}
