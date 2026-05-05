import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Braces,
  Bug,
  ChevronRight,
  CircleCheck,
  FileCode2,
  Gauge,
  GitPullRequestArrow,
  GitFork,
  Layers3,
  LockKeyhole,
  Play,
  ScanLine,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Footer from '../components/Footer'
import './LandingPage.css'

const REVIEW_POINTS = [
  { label: 'Bugs', value: '2', tone: 'coral' },
  { label: 'Performance', value: '3', tone: 'amber' },
  { label: 'Maintainability', value: '7', tone: 'moss' },
  { label: 'Security', value: '0', tone: 'sage' },
]

const FEATURES = [
  {
    icon: <ScanLine size={24} />,
    title: 'Code-path reading',
    description: 'Scrutin follows the flow before it comments, so feedback lands on causes instead of noisy symptoms.',
  },
  {
    icon: <Bug size={24} />,
    title: 'Bug notes with context',
    description: 'Each issue is tied to a line, a risk level, and a compact fix note your team can actually use.',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Security pass',
    description: 'Catch unsafe inputs, leaked assumptions, weak auth checks, and brittle error handling early.',
  },
  {
    icon: <Gauge size={24} />,
    title: 'Performance pressure test',
    description: 'Spot avoidable loops, expensive calls, async bottlenecks, and data work that should move elsewhere.',
  },
]

const WORKFLOW = [
  {
    icon: <FileCode2 size={26} />,
    step: '01',
    title: 'Drop in the change',
    description: 'Paste a file, a function, or a pull-request slice. Scrutin keeps the review focused.',
  },
  {
    icon: <GitPullRequestArrow size={26} />,
    step: '02',
    title: 'Read the diff like a reviewer',
    description: 'It separates blockers, polish notes, and architectural concerns without flattening them together.',
  },
  {
    icon: <CircleCheck size={26} />,
    step: '03',
    title: 'Ship the clean patch',
    description: 'Apply fixes, copy a review summary, and move into the next iteration with less back-and-forth.',
  },
]

const AUDIENCES = [
  { icon: <Braces size={22} />, title: 'Solo builders', body: 'A second set of eyes when you are moving fast.' },
  { icon: <Users size={22} />, title: 'Teams', body: 'Consistent review language before the pull request.' },
  { icon: <Layers3 size={22} />, title: 'Open source', body: 'Cleaner contributions with maintainers in mind.' },
]

function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('animate-in')
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -70px 0px' }
    )

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing" id="landing-page">
      <section className="hero" id="hero-section">
        <div className="liquid-rim liquid-rim--left" />
        <div className="liquid-rim liquid-rim--right" />

        <div className="hero__shell">
          <div className="hero__copy">
            <div className="hero__eyebrow">
              <BadgeCheck size={15} />
              <span>Review desk for careful builders</span>
            </div>

            <h1 className="hero__title">
              Better code reviews.
              <span> Quieter shipping.</span>
            </h1>

            <p className="hero__subtitle">
              Scrutin turns raw code into a structured review: blockers first, thoughtful fixes next,
              and a clean handoff your team can trust.
            </p>

            <div className="hero__actions">
              <Link to="/editor" className="hero__cta" id="hero-cta">
                <span>Open reviewer</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://github.com/Raviranjan010/scrutin"
                target="_blank"
                rel="noopener noreferrer"
                className="hero__watch"
                id="hero-github"
              >
                <GitFork size={18} />
                <span>View source</span>
              </a>
              <button className="hero__play" type="button" aria-label="Play product preview">
                <Play size={17} fill="currentColor" />
              </button>
            </div>

            <div className="hero__trusted" aria-label="Trusted by developer workflows">
              <span>Built for</span>
              <strong>PRs</strong>
              <strong>refactors</strong>
              <strong>security passes</strong>
              <strong>release polish</strong>
            </div>
          </div>

          <div className="review-board" aria-label="Code review preview">
            <div className="review-board__top">
              <div className="review-board__file">
                <FileCode2 size={16} />
                <span>auth.service.ts</span>
              </div>
              <div className="review-board__delta">
                <span>+24</span>
                <span>-6</span>
              </div>
              <div className="review-board__done">
                <CircleCheck size={16} />
                <span>Review complete</span>
              </div>
            </div>

            <div className="review-board__body">
              <div className="code-pane">
                <div className="code-line"><span>18</span><code>async function login(user) {'{'}</code></div>
                <div className="code-line"><span>19</span><code>  const token = await sign(user)</code></div>
                <div className="code-line"><span>20</span><code>  if (!token) {'{'}</code></div>
                <div className="code-line"><span>21</span><code>    throw new Error('Invalid user')</code></div>
                <div className="code-line"><span>22</span><code>  {'}'}</code></div>
                <div className="code-line code-line--flagged"><span>23</span><code>  return {'{'} token {'}'}</code></div>
                <div className="code-line code-line--flagged"><span>24</span><code>{'}'}</code></div>
                <div className="suggestion-card">
                  <div>
                    <strong>Normalize the return shape</strong>
                    <small>Major</small>
                  </div>
                  <p>Return a consistent auth envelope so callers do not branch on missing metadata.</p>
                  <button type="button">Apply suggestion</button>
                </div>
              </div>

              <aside className="score-panel">
                <span>Review summary</span>
                <div className="score-dial">
                  <b>86</b>
                  <small>Overall</small>
                </div>
                <div className="score-list">
                  {REVIEW_POINTS.map(point => (
                    <div className="score-list__item" key={point.label}>
                      <i className={`score-dot score-dot--${point.tone}`} />
                      <span>{point.label}</span>
                      <strong>{point.value}</strong>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features-section">
        <div className="section-header scroll-animate">
          <span className="section-label">What it catches</span>
          <h2 className="section-title">Designed like a real reviewer, not a chatbot window</h2>
        </div>

        <div className="features__grid">
          {FEATURES.map((feature, index) => (
            <article
              className="feature-card scroll-animate"
              key={feature.title}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <div className="feature-card__icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="builder-strip scroll-animate">
        <div className="builder-strip__dark">
          <h2>Built for the moment before merge</h2>
          <p>
            Use Scrutin when the code works, but the shape still needs judgment: naming,
            contracts, edge cases, and the little decisions that keep a codebase healthy.
          </p>
          <div className="builder-strip__avatars">
            <span>RR</span>
            <span>JS</span>
            <span>MK</span>
            <span>+8</span>
            <small>reviews improved this week</small>
          </div>
        </div>

        <div className="audience-glass">
          {AUDIENCES.map(item => (
            <div className="audience-row" key={item.title}>
              <div>{item.icon}</div>
              <span>
                <strong>{item.title}</strong>
                <small>{item.body}</small>
              </span>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </section>

      <section className="workflow" id="how-it-works-section">
        <div className="section-header scroll-animate">
          <span className="section-label">Review flow</span>
          <h2 className="section-title">A tighter loop from paste to patch</h2>
        </div>

        <div className="workflow__grid">
          {WORKFLOW.map((step, index) => (
            <article className="workflow-card scroll-animate" key={step.step}>
              <span>{step.step}</span>
              <div>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < WORKFLOW.length - 1 && <ChevronRight className="workflow-card__arrow" size={20} />}
            </article>
          ))}
        </div>
      </section>

      <section className="tool-belt scroll-animate">
        <h2>Integrates with the tools already open on your desk</h2>
        <div className="tool-belt__icons" aria-label="Tool integrations">
          <GitFork size={25} />
          <GitPullRequestArrow size={25} />
          <FileCode2 size={25} />
          <LockKeyhole size={25} />
          <Braces size={25} />
          <span>...</span>
        </div>
      </section>

      <section className="cta-banner scroll-animate" id="cta-section">
        <div>
          <span>Ready desk</span>
          <h2>Review the next change with a cleaner eye.</h2>
        </div>
        <Link to="/editor" className="cta-banner__btn" id="cta-start">
          <span>Start reviewing</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
