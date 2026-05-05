import { useState, useRef, useEffect } from 'react';

export default function ExportDropdown({ reviewContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadMarkdown = () => {
    const blob = new Blob([reviewContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrutin-review-${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleCopyText = async () => {
    // Strip markdown formatting using a simple regex or just copy as is. 
    // Wait, the requirement says "strip markdown formatting".
    const plainText = reviewContent
      .replace(/[#*`_~>-]/g, '') // strip common md chars
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // strip links but keep text
      .trim();

    try {
      await navigator.clipboard.writeText(plainText);
      // Optional: show a mini toast or change button text briefly
    } catch (err) {
      console.error('Failed to copy', err);
    }
    setIsOpen(false);
  };

  return (
    <div className="export-dropdown-container" ref={dropdownRef}>
      <button 
        className="export-btn glass-pill" 
        onClick={() => setIsOpen(!isOpen)}
      >
        Export
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="export-menu glass-card">
          <button className="export-menu-item" onClick={handleDownloadMarkdown}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download as Markdown
          </button>
          <button className="export-menu-item" onClick={handleCopyText}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy as plain text
          </button>
        </div>
      )}
    </div>
  );
}
