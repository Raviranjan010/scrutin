import { Code2, GitFork, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__brand-section">
            <Link to="/" className="footer__brand">
              <div className="footer__logo">
                <Code2 size={20} />
              </div>
              <span className="footer__brand-text">Scrutin</span>
            </Link>
            <p className="footer__tagline">
              Structured code reviews for cleaner patches, safer releases, and calmer pull requests.
            </p>
          </div>

          <div className="footer__column">
            <h4 className="footer__heading">Product</h4>
            <Link to="/editor" className="footer__link">Reviewer</Link>
            <Link to="/editor" className="footer__link">Code Notes</Link>
            <Link to="/editor" className="footer__link">Security Scan</Link>
          </div>

          <div className="footer__column">
            <h4 className="footer__heading">Resources</h4>
            <a href="https://github.com/Raviranjan010/scrutin" target="_blank" rel="noopener noreferrer" className="footer__link">
              GitHub
            </a>
            <a href="https://github.com/Raviranjan010/scrutin/issues" target="_blank" rel="noopener noreferrer" className="footer__link">
              Issues
            </a>
            <a href="https://github.com/Raviranjan010/scrutin#readme" target="_blank" rel="noopener noreferrer" className="footer__link">
              Documentation
            </a>
          </div>
        </div>

        <div className="footer__divider" />

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Scrutin. Built with <Heart size={14} className="footer__heart" /> by Ravi Ranjan
          </p>
          <div className="footer__bottom-links">
            <a
              href="https://github.com/Raviranjan010/scrutin"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
              aria-label="GitHub"
            >
              <GitFork size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
