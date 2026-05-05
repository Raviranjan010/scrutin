import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

import ScoreRing from '../components/ScoreRing';
import ExportDropdown from '../components/ExportDropdown';

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReview() {
      try {
        const res = await fetch(`http://localhost:3000/reviews/${id}`);
        if (!res.ok) {
          throw new Error('Review not found');
        }
        const data = await res.json();
        setReviewData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReview();
  }, [id]);

  const displayReview = useMemo(() => {
    if (!reviewData?.review) return '';
    return reviewData.review.replace(/SCORE_JSON:\{.*?\}/s, '').trim();
  }, [reviewData]);

  if (isLoading) {
    return <div className="scrutin-app"><div className="loading-spinner"></div></div>;
  }

  if (error || !reviewData) {
    return (
      <div className="scrutin-app">
        <main className="scrutin-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Review not found</h2>
            <p style={{ color: 'var(--rust)', margin: '16px 0' }}>{error}</p>
            <button className="review-btn" onClick={() => navigate('/')}>Go to App</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="scrutin-app">
      <nav className="scrutin-nav fade-up" style={{ '--delay': '0s' }}>
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo">Sc</div>
          <span className="nav-wordmark">Scrutin</span>
        </div>
        <div className="nav-links">
          <span className="public-badge">Public Review Report</span>
        </div>
      </nav>

      <main className="scrutin-main" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <section className="review-panel glass-card fade-up" style={{ '--delay': '0.1s', minHeight: 'calc(100vh - 160px)' }}>
          <div className="review-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="review-panel-title">Review Report</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', color: 'var(--sage)' }}>
                <span className="glass-pill">{reviewData.language}</span>
                <span className="glass-pill">{new Date(reviewData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="glass-pill" 
                style={{ backgroundColor: 'var(--gold)', color: 'var(--ink)', fontWeight: 'bold' }}
                onClick={() => navigate('/', { state: { code: reviewData.code } })}
              >
                Open in Editor
              </button>
              <ExportDropdown reviewContent={displayReview} />
            </div>
          </div>
          <div className="review-panel-body" style={{ marginTop: '24px' }}>
            <div className="review-content">
              {reviewData.score !== null && reviewData.score !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                  <ScoreRing score={reviewData.score} />
                </div>
              )}
              <Markdown rehypePlugins={[rehypeHighlight]}>
                {displayReview}
              </Markdown>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
