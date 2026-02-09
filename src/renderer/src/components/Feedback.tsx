import { useState } from 'react'

interface FeedbackProps {
  correct: boolean
  message: string
  hints?: string[]
  friendlyError?: string
}

export default function Feedback({ correct, message, hints, friendlyError }: FeedbackProps): JSX.Element {
  const [hintIndex, setHintIndex] = useState(-1)

  const showNextHint = (): void => {
    if (hints && hintIndex < hints.length - 1) {
      setHintIndex(hintIndex + 1)
    }
  }

  return (
    <div>
      <div className={`feedback-panel ${correct ? 'correct' : 'incorrect'}`}>
        <div className="feedback-title">{correct ? 'Correct!' : 'Not quite...'}</div>
        <div>{message}</div>
      </div>

      {friendlyError && (
        <div className="hint-panel" style={{ marginTop: '0.5rem' }}>
          <strong>What went wrong:</strong> {friendlyError}
        </div>
      )}

      {!correct && hints && hints.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          {hintIndex >= 0 &&
            hints.slice(0, hintIndex + 1).map((hint, i) => (
              <div key={i} className="hint-panel">
                <strong>Hint {i + 1}:</strong> {hint}
              </div>
            ))}
          {hintIndex < hints.length - 1 && (
            <button className="btn btn-secondary" onClick={showNextHint} style={{ marginTop: '0.5rem' }}>
              {hintIndex === -1 ? 'Show hint' : 'Next hint'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
