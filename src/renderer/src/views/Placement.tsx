import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/app'

interface PlacementChoice {
  label: string
  text: string
}

interface PlacementQuestion {
  id: string
  module_target: string
  prompt: string
  code: string
  choices: PlacementChoice[]
  correct: string
  explanation: string
}

interface PlacementData {
  id: string
  title: string
  description: string
  questions: PlacementQuestion[]
}

export default function Placement(): JSX.Element {
  const [data, setData] = useState<PlacementData | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const modules = useAppStore((s) => s.modules)
  const navigate = useNavigate()

  useEffect(() => {
    window.julius.loadPlacement().then((d) => {
      if (d) setData(d as PlacementData)
    })
  }, [])

  if (!data) {
    return (
      <div>
        <div className="view-header">
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  if (showResult) {
    const results = data.questions.map((q, i) => ({
      moduleTarget: q.module_target,
      correct: answers[i] === q.correct
    }))

    // Find the first module the user got wrong (recommendation)
    const firstWrong = results.findIndex((r) => !r.correct)
    const allCorrect = firstWrong === -1
    const recommendedModule = allCorrect ? null : results[firstWrong].moduleTarget

    // Find the recommended module's title
    const recommendedTitle = modules.find((m) => m.id === recommendedModule)?.title

    return (
      <div>
        <div className="view-header">
          <h2>Your Results</h2>
          <p>
            You answered {results.filter((r) => r.correct).length} out of {results.length} correctly.
          </p>
        </div>

        {allCorrect ? (
          <div
            className="card"
            style={{ marginBottom: '1.5rem', borderColor: 'var(--accent-success)' }}
          >
            <strong>You know your stuff!</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              You answered every question correctly. Pick any specialized module that interests you,
              or revisit fundamentals for a refresher.
            </p>
          </div>
        ) : (
          <div
            className="card"
            style={{ marginBottom: '1.5rem', borderColor: 'var(--accent-primary)' }}
          >
            <strong>
              We suggest starting with: {recommendedTitle}
            </strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              This is the first topic where you could use some practice.
              But remember — all modules are open. Jump in wherever you like!
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => {
                const mod = modules.find((m) => m.id === recommendedModule)
                if (mod && mod.lessons.length > 0) {
                  navigate(`/lesson/${mod.id}/${mod.lessons[0]}`)
                }
              }}
            >
              Start {recommendedTitle}
            </button>
          </div>
        )}

        <h3 style={{ marginBottom: '0.75rem' }}>Module Knowledge Map</h3>
        <div className="card-grid">
          {data.questions.map((q, i) => {
            const isCorrect = results[i].correct
            const mod = modules.find((m) => m.id === q.module_target)
            return (
              <div
                key={q.id}
                className="card"
                style={{
                  borderColor: isCorrect ? 'var(--accent-success)' : 'var(--accent-error)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (mod && mod.lessons.length > 0) {
                    navigate(`/lesson/${mod.id}/${mod.lessons[0]}`)
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem' }}>{mod?.title || q.module_target}</h4>
                  <span
                    className={`badge ${isCorrect ? 'badge-success' : 'badge-warning'}`}
                  >
                    {isCorrect ? 'Known' : 'To Learn'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setCurrent(0)
              setAnswers({})
              setShowResult(false)
              setSelectedAnswer(null)
              setShowExplanation(false)
            }}
          >
            Retake Assessment
          </button>
          <button
            className="btn btn-primary"
            style={{ marginLeft: '0.75rem' }}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const question = data.questions[current]

  const handleAnswer = (label: string): void => {
    setSelectedAnswer(label)
    setShowExplanation(true)
    setAnswers((prev) => ({ ...prev, [current]: label }))
  }

  const handleNext = (): void => {
    if (current < data.questions.length - 1) {
      setCurrent(current + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setShowResult(true)
    }
  }

  return (
    <div>
      <div className="view-header">
        <h2>{data.title}</h2>
        <p>{data.description}</p>
      </div>

      <div style={{ marginBottom: '1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
        Question {current + 1} of {data.questions.length}
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div
          className="progress-fill"
          style={{ width: `${((current + 1) / data.questions.length) * 100}%` }}
        />
      </div>

      <div className="exercise-container">
        <div className="exercise-prompt">{question.prompt}</div>

        {question.code && question.code.trim() && (
          <pre
            style={{
              background: 'var(--bg-code)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              overflowX: 'auto'
            }}
          >
            <code>{question.code.trim()}</code>
          </pre>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {question.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.label
            const isCorrect = choice.label === question.correct
            let borderColor = 'var(--border-primary)'
            let bg = 'var(--bg-secondary)'

            if (showExplanation) {
              if (isCorrect) {
                borderColor = 'var(--accent-success)'
                bg = 'var(--bg-success)'
              } else if (isSelected && !isCorrect) {
                borderColor = 'var(--accent-error)'
                bg = 'var(--bg-error)'
              }
            } else if (isSelected) {
              borderColor = 'var(--accent-primary)'
            }

            return (
              <button
                key={choice.label}
                onClick={() => !showExplanation && handleAnswer(choice.label)}
                disabled={showExplanation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: showExplanation ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.15s, background 0.15s'
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  {choice.label}
                </span>
                {choice.text}
              </button>
            )
          })}
        </div>

        {showExplanation && (
          <div
            className={`feedback-panel ${selectedAnswer === question.correct ? 'correct' : 'incorrect'}`}
            style={{ marginTop: '1rem' }}
          >
            <div className="feedback-title">
              {selectedAnswer === question.correct ? 'Correct!' : 'Not quite.'}
            </div>
            <p>{question.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <div className="exercise-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleNext}>
              {current < data.questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
