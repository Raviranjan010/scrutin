export default function ScoreRing({ score }) {
  if (score == null || isNaN(score)) return null

  const size = 80
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (progress / 100) * circumference

  // Color based on score thresholds
  let color
  if (score > 80) color = '#4a6b4a' // sage
  else if (score >= 60) color = '#c49a3c' // gold
  else color = '#8b3a2a' // rust

  return (
    <div className="score-ring-container">
      <svg
        className="score-ring-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(196, 154, 60, 0.12)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          className="score-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="score-ring-value" style={{ color }}>
        {score}
      </div>
      <span className="score-ring-label">overall</span>
    </div>
  )
}
