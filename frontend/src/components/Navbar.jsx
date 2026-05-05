import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Code2, GitFork, Menu, X } from 'lucide-react'
import './Navbar.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand" id="brand-link">
          <div className="navbar__logo">
            <Code2 size={24} />
          </div>
          <span className="navbar__brand-text">Scrutin</span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          <Link
            to="/"
            className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
            id="nav-home"
          >
            Home
          </Link>
          <Link
            to="/editor"
            className={`navbar__link ${location.pathname === '/editor' ? 'navbar__link--active' : ''}`}
            id="nav-editor"
          >
            Editor
          </Link>
          <a
            href="https://github.com/Raviranjan010/scrutin"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__link navbar__link--icon"
            id="nav-github"
          >
            <GitFork size={18} />
            <span>GitHub</span>
          </a>
          <Link to="/editor" className="navbar__cta" id="nav-cta">
            Start Reviewing
          </Link>
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          id="nav-toggle"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
