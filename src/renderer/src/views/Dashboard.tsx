import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/app'
import { useProgressStore } from '../stores/progress'

export default function Dashboard(): JSX.Element {
  const modules = useAppStore((s) => s.modules)
  const lessonProgress = useProgressStore((s) => s.lessonProgress)
  const conceptMastery = useProgressStore((s) => s.conceptMastery)
  const reviewDueCount = useProgressStore((s) => s.reviewDueCount)
  const navigate = useNavigate()

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedLessons = Object.values(lessonProgress).filter(Boolean).length
  const masteredConcepts = Object.values(conceptMastery).filter((l) => l === 'mastered').length
  const totalConcepts = Object.keys(conceptMastery).length

  const getModuleProgress = (mod: ModuleMeta): number => {
    const completed = mod.lessons.filter((l) => lessonProgress[l]).length
    return mod.lessons.length > 0 ? Math.round((completed / mod.lessons.length) * 100) : 0
  }

  return (
    <div>
      <div className="view-header">
        <h2>Welcome to Julius</h2>
        <p>Your Python learning dashboard</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{completedLessons}/{totalLessons}</div>
          <div className="stat-label">Lessons Complete</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{masteredConcepts}</div>
          <div className="stat-label">Concepts Mastered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: reviewDueCount > 0 ? 'var(--accent-warning)' : undefined }}>
            {reviewDueCount}
          </div>
          <div className="stat-label">Reviews Due</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
          </div>
          <div className="stat-label">Overall Progress</div>
        </div>
      </div>

      <div
        className="card"
        style={{ marginBottom: '1.5rem', cursor: 'pointer', borderColor: 'var(--accent-primary)' }}
        onClick={() => navigate('/placement')}
      >
        <strong>Not sure where to start?</strong>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Take a quick 15-question assessment to find the module that matches your experience level.
        </p>
      </div>

      {reviewDueCount > 0 && (
        <div
          className="card"
          style={{ marginBottom: '1.5rem', cursor: 'pointer', borderColor: 'var(--accent-warning)' }}
          onClick={() => navigate('/review')}
        >
          <strong>You have {reviewDueCount} review{reviewDueCount !== 1 ? 's' : ''} due!</strong>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Spaced repetition helps you remember what you've learned. Click to start reviewing.
          </p>
        </div>
      )}

      <h3 style={{ marginBottom: '1rem' }}>Modules</h3>
      <div className="card-grid">
        {modules.map((mod) => {
          const progress = getModuleProgress(mod)
          const firstIncompleteLesson = mod.lessons.find((l) => !lessonProgress[l])
          const nextLesson = firstIncompleteLesson || mod.lessons[0]

          return (
            <div
              key={mod.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => nextLesson && navigate(`/lesson/${mod.id}/${nextLesson}`)}
            >
              <h4 style={{ marginBottom: '0.35rem' }}>{mod.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {mod.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                <span>{mod.lessons.length} lessons</span>
                <span>{progress}% complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )
        })}

        {modules.length === 0 && (
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>No modules found. Check the content/ directory.</p>
          </div>
        )}
      </div>

      {totalConcepts > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Concept Progress</h3>
          <div className="concept-map">
            {Object.entries(conceptMastery).map(([concept, level]) => (
              <span key={concept} className={`concept-tag ${level}`}>
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
