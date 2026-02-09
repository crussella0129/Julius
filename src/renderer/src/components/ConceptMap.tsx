import { useProgressStore } from '../stores/progress'

interface ConceptMapProps {
  concepts?: string[]
}

export default function ConceptMap({ concepts }: ConceptMapProps): JSX.Element {
  const conceptMastery = useProgressStore((s) => s.conceptMastery)

  const displayConcepts = concepts || Object.keys(conceptMastery)

  if (displayConcepts.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No concepts tracked yet.</div>
  }

  return (
    <div className="concept-map">
      {displayConcepts.map((concept) => {
        const level = conceptMastery[concept] || 'not-started'
        return (
          <span key={concept} className={`concept-tag ${level}`}>
            {concept}
          </span>
        )
      })}
    </div>
  )
}
