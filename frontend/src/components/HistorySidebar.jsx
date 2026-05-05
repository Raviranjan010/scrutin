import { useState } from 'react'

function relativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function HistorySidebar({
  isOpen,
  onClose,
  history,
  onRestore,
  onDelete,
  onClearAll,
}) {
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    onClearAll()
    setConfirmClear(false)
  }

  function handleClose() {
    setConfirmClear(false)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={handleClose}
      />

      {/* Sidebar panel */}
      <aside className={`history-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <span className="sidebar-title">Review History</span>
          <button
            className="sidebar-close-btn"
            onClick={handleClose}
            aria-label="Close history"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        {history.length > 0 && (
          <div className="sidebar-actions">
            <button
              className={`sidebar-clear-btn ${confirmClear ? 'confirm' : ''}`}
              onClick={handleClear}
            >
              {confirmClear ? 'Confirm clear all?' : 'Clear all'}
            </button>
            {confirmClear && (
              <button
                className="sidebar-cancel-btn"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {/* List */}
        <div className="sidebar-list">
          {history.length === 0 ? (
            <div className="sidebar-empty">
              <span className="sidebar-empty-icon">&#x29D6;</span>
              <p>No reviews yet</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="sidebar-item"
                onClick={() => onRestore(entry)}
              >
                <div className="sidebar-item-top">
                  <span className="sidebar-lang-badge">{entry.language}</span>
                  <span className="sidebar-time">{relativeTime(entry.timestamp)}</span>
                </div>
                <p className="sidebar-snippet">{entry.codeSnippet}</p>
                {entry.score != null && (
                  <span className="sidebar-score">
                    Score: {entry.score}
                  </span>
                )}
                <button
                  className="sidebar-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(entry.id)
                  }}
                  aria-label="Delete review"
                >
                  &#x2715;
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
