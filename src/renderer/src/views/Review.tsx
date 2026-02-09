import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../stores/progress'
import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs'

const f = fsrs(generatorParameters())

export default function Review(): JSX.Element {
  const { fsrsCards, loadFsrsCards, upsertFsrsCard, loadAll } = useProgressStore()
  const [dueCards, setDueCards] = useState<FsrsCardRow[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadFsrsCards().then(() => {
      const now = new Date()
      const due = fsrsCards.filter((c) => new Date(c.due) <= now)
      setDueCards(due)
      if (due.length === 0) setSessionComplete(true)
    })
  }, [])

  // Re-derive due cards when fsrsCards changes
  useEffect(() => {
    const now = new Date()
    const due = fsrsCards.filter((c) => new Date(c.due) <= now)
    setDueCards(due)
    if (due.length === 0 && fsrsCards.length > 0) setSessionComplete(true)
  }, [fsrsCards])

  const handleRating = async (rating: Rating): Promise<void> => {
    if (currentIndex >= dueCards.length) return

    const cardRow = dueCards[currentIndex]
    const card = {
      due: new Date(cardRow.due),
      stability: cardRow.stability,
      difficulty: cardRow.difficulty,
      elapsed_days: cardRow.elapsed_days,
      scheduled_days: cardRow.scheduled_days,
      reps: cardRow.reps,
      lapses: cardRow.lapses,
      state: cardRow.state,
      last_review: cardRow.last_review ? new Date(cardRow.last_review) : undefined
    }

    const now = new Date()
    const scheduling = f.repeat(card as any, now)
    const updated = scheduling[rating].card

    await upsertFsrsCard({
      exerciseId: cardRow.exercise_id,
      due: updated.due.toISOString(),
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsed_days: updated.elapsed_days,
      scheduled_days: updated.scheduled_days,
      reps: updated.reps,
      lapses: updated.lapses,
      state: updated.state,
      last_review: now.toISOString()
    })

    if (currentIndex + 1 >= dueCards.length) {
      setSessionComplete(true)
      await loadAll()
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (sessionComplete) {
    return (
      <div>
        <div className="view-header">
          <h2>Review Complete</h2>
          <p>No more reviews due right now. Great work!</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (dueCards.length === 0) {
    return (
      <div>
        <div className="view-header">
          <h2>Spaced Repetition Review</h2>
          <p>No reviews due yet. Complete some exercises first!</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  const current = dueCards[currentIndex]

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="view-header">
        <h2>Review Session</h2>
        <p>Card {currentIndex + 1} of {dueCards.length}</p>
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${((currentIndex) / dueCards.length) * 100}%` }} />
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '0.5rem' }}>
          Exercise: {current.exercise_id}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Reps: {current.reps} | Lapses: {current.lapses} | Stability: {current.stability.toFixed(1)}
        </p>
        <div style={{ marginTop: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              // Navigate to the exercise
              const parts = current.exercise_id.split('-')
              // Best-effort: redirect to exercise route
              navigate(`/`)
            }}
          >
            Open Exercise
          </button>
        </div>
      </div>

      <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}>How well did you remember?</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn" style={{ background: 'var(--accent-error)', color: '#fff' }} onClick={() => handleRating(Rating.Again)}>
          Again
        </button>
        <button className="btn" style={{ background: 'var(--accent-warning)', color: '#fff' }} onClick={() => handleRating(Rating.Hard)}>
          Hard
        </button>
        <button className="btn" style={{ background: 'var(--accent-primary)', color: '#fff' }} onClick={() => handleRating(Rating.Good)}>
          Good
        </button>
        <button className="btn" style={{ background: 'var(--accent-success)', color: '#fff' }} onClick={() => handleRating(Rating.Easy)}>
          Easy
        </button>
      </div>
    </div>
  )
}
