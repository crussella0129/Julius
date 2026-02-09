import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import Feedback from '../components/Feedback'
import { useProgressStore } from '../stores/progress'
import { createNewCard } from '../lib/fsrs'

// Parsons: simple sortable without full dnd-kit for initial version
function ParsonsExercise({ exercise, onResult }: { exercise: ExerciseData; onResult: (correct: boolean) => void }): JSX.Element {
  const allBlocks = [...(exercise.blocks || []), ...(exercise.distractors || [])]
  const [order, setOrder] = useState<number[]>(() => {
    const indices = allBlocks.map((_, i) => i)
    // Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  })
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [correctness, setCorrectness] = useState<boolean[]>([])

  const handleDragStart = (idx: number): void => {
    setDragIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent, idx: number): void => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const newOrder = [...order]
    const [moved] = newOrder.splice(dragIdx, 1)
    newOrder.splice(idx, 0, moved)
    setOrder(newOrder)
    setDragIdx(idx)
  }

  const handleDragEnd = (): void => {
    setDragIdx(null)
  }

  const [isCorrectResult, setIsCorrectResult] = useState(false)

  const check = (): void => {
    const solutionOrder = exercise.solution_order || []
    const numBlocks = exercise.blocks?.length || 0

    // Filter out distractors from user's answer
    const userNonDistractor = order.filter((i) => i < numBlocks)
    const isCorrect =
      userNonDistractor.length === solutionOrder.length &&
      userNonDistractor.every((val, idx) => val === solutionOrder[idx])

    const corr = order.map((blockIdx, _posIdx) => {
      if (blockIdx >= numBlocks) return false // distractor
      const posInSolution = solutionOrder.indexOf(blockIdx)
      const posInUser = userNonDistractor.indexOf(blockIdx)
      return posInSolution === posInUser
    })

    setCorrectness(corr)
    setChecked(true)
    setIsCorrectResult(isCorrect)
    onResult(isCorrect)
  }

  return (
    <div>
      <div className="parsons-container">
        {order.map((blockIdx, posIdx) => {
          const isDistractor = blockIdx >= (exercise.blocks?.length || 0)
          const text = allBlocks[blockIdx]
          let className = 'parsons-block'
          if (isDistractor) className += ' distractor'
          if (dragIdx === posIdx) className += ' dragging'
          if (checked && correctness[posIdx]) className += ' correct'
          if (checked && !correctness[posIdx]) className += ' incorrect'

          return (
            <div
              key={blockIdx}
              className={className}
              draggable
              onDragStart={() => handleDragStart(posIdx)}
              onDragOver={(e) => handleDragOver(e, posIdx)}
              onDragEnd={handleDragEnd}
            >
              {text}
            </div>
          )
        })}
      </div>
      <div className="exercise-actions">
        <button className="btn btn-primary" onClick={check}>Check Answer</button>
      </div>
      {checked && (
        <Feedback
          correct={isCorrectResult}
          message={isCorrectResult ? 'Lines are in the correct order!' : 'The order isn\'t right yet. Think about what needs to happen first.'}
          hints={exercise.hints}
        />
      )}
    </div>
  )
}

function TraceExercise({ exercise, onResult }: { exercise: ExerciseData; onResult: (correct: boolean) => void }): JSX.Element {
  const steps = exercise.steps || []
  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const check = (): void => {
    const expected = exercise.expected_output?.trim() || ''
    const correct = userAnswer.trim() === expected
    setIsCorrect(correct)
    setChecked(true)
    onResult(correct)
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <pre className="output-panel">{exercise.code}</pre>
      </div>

      {steps.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Trace through the code:</h4>
          <table className="trace-table">
            <thead>
              <tr>
                <th>Line</th>
                <th>Variables</th>
                <th>Output</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {steps.slice(0, currentStep + 1).map((step, i) => (
                <tr key={i} className={i === currentStep ? 'active' : ''}>
                  <td>{step.line}</td>
                  <td>{Object.entries(step.variables).map(([k, v]) => `${k}=${v}`).join(', ')}</td>
                  <td>{step.output || ''}</td>
                  <td>{step.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentStep < steps.length - 1 && (
            <button
              className="btn btn-secondary"
              style={{ marginTop: '0.5rem' }}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next Step
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
          What is the final output?
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            background: 'var(--bg-code)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            resize: 'vertical'
          }}
          placeholder="Type the expected output here..."
        />
      </div>

      <div className="exercise-actions">
        <button className="btn btn-primary" onClick={check}>Check Answer</button>
      </div>

      {checked && (
        <Feedback
          correct={isCorrect}
          message={isCorrect ? 'You traced the code correctly!' : `Expected output: ${exercise.expected_output}`}
          hints={exercise.hints}
        />
      )}
    </div>
  )
}

function FillInExercise({ exercise, onResult }: { exercise: ExerciseData; onResult: (correct: boolean) => void }): JSX.Element {
  const blanks = exercise.blanks || []
  const [answers, setAnswers] = useState<string[]>(blanks.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [correctness, setCorrectness] = useState<boolean[]>([])

  const updateAnswer = (idx: number, val: string): void => {
    const updated = [...answers]
    updated[idx] = val
    setAnswers(updated)
  }

  const check = (): void => {
    const corr = blanks.map((blank, i) => answers[i].trim() === blank.answer.trim())
    setCorrectness(corr)
    setChecked(true)
    onResult(corr.every(Boolean))
  }

  // Build template with blanks
  const template = exercise.template || ''
  const parts = template.split('____')

  return (
    <div>
      <div className="fill-in-template">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                className={`fill-in-blank ${checked ? (correctness[i] ? 'correct' : 'incorrect') : ''}`}
                value={answers[i] || ''}
                onChange={(e) => updateAnswer(i, e.target.value)}
                placeholder={blanks[i]?.hint || '...'}
              />
            )}
          </span>
        ))}
      </div>

      <div className="exercise-actions">
        <button className="btn btn-primary" onClick={check}>Check Answer</button>
      </div>

      {checked && (
        <Feedback
          correct={correctness.every(Boolean)}
          message={correctness.every(Boolean) ? 'All blanks filled correctly!' : 'Some blanks are incorrect. Try again.'}
          hints={exercise.hints}
        />
      )}
    </div>
  )
}

function WriteExercise({ exercise, onResult }: { exercise: ExerciseData; onResult: (correct: boolean) => void }): JSX.Element {
  const [code, setCode] = useState(exercise.starter_code || '# Write your code here\n')
  const [output, setOutput] = useState<{ stdout: string; stderr: string; friendlyError?: string } | null>(null)
  const [running, setRunning] = useState(false)
  const [testResults, setTestResults] = useState<{ description: string; passed: boolean }[] | null>(null)

  const runCode = async (): Promise<void> => {
    setRunning(true)
    setTestResults(null)
    const result = await window.julius.runPython(code)
    setOutput(result)

    // Run tests if defined
    if (exercise.tests && exercise.tests.length > 0 && result.exitCode === 0) {
      const checks = exercise.tests.map((t) => t.check)
      const testCode = [
        `output = ${JSON.stringify(result.stdout)}`,
        `results = []`,
        ...checks.map((check, i) => [
          `try:`,
          `    _passed = bool(${check})`,
          `    results.append("${i}:" + ("1" if _passed else "0"))`,
          `except Exception:`,
          `    results.append("${i}:0")`
        ].join('\n')),
        `print("TESTS:" + ",".join(results))`
      ].join('\n')

      const testResult = await window.julius.runPython(testCode)
      const testLine = testResult.stdout.split('\n').find((l) => l.startsWith('TESTS:'))
      if (testLine) {
        const entries = testLine.replace('TESTS:', '').split(',')
        const results = exercise.tests.map((t, i) => ({
          description: t.description,
          passed: entries[i]?.endsWith(':1') ?? false
        }))
        setTestResults(results)
        const allPassed = results.every((r) => r.passed)
        onResult(allPassed)
      }
    }

    setRunning(false)
  }

  return (
    <div>
      <CodeEditor value={code} onChange={setCode} />

      <div className="exercise-actions">
        <button className="btn btn-success" onClick={runCode} disabled={running}>
          {running ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {output && (
        <div className={`output-panel ${output.stderr ? 'error' : output.stdout ? 'success' : ''}`}>
          {output.stdout || output.stderr || '(no output)'}
        </div>
      )}

      {output?.friendlyError && (
        <Feedback
          correct={false}
          message={output.friendlyError}
          hints={exercise.hints}
          friendlyError={output.stderr}
        />
      )}

      {testResults && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Test Results</h4>
          {testResults.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: t.passed ? 'var(--accent-success)' : 'var(--accent-error)', fontWeight: 600 }}>
                {t.passed ? '\u2713' : '\u2717'}
              </span>
              <span>{t.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Exercise(): JSX.Element {
  const { moduleId, lessonId, exerciseFile } = useParams<{
    moduleId: string
    lessonId: string
    exerciseFile: string
  }>()
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [exerciseFiles, setExerciseFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const startTime = useRef(Date.now())
  const navigate = useNavigate()
  const { recordAttempt, updateMastery, upsertFsrsCard, updateLessonProgress, loadAll } = useProgressStore()

  useEffect(() => {
    if (!moduleId || !lessonId || !exerciseFile) return
    startTime.current = Date.now()
    setCompleted(false)
    setLoading(true)

    Promise.all([
      window.julius.loadExercise(moduleId, lessonId, exerciseFile),
      window.julius.listExercises(moduleId, lessonId)
    ]).then(([data, files]) => {
      setExercise(data)
      setExerciseFiles(files)
      setLoading(false)
    })
  }, [moduleId, lessonId, exerciseFile])

  const currentExIndex = exerciseFiles.indexOf(exerciseFile!)
  const prevExercise = currentExIndex > 0 ? exerciseFiles[currentExIndex - 1] : null
  const nextExercise = currentExIndex < exerciseFiles.length - 1 ? exerciseFiles[currentExIndex + 1] : null

  const handleResult = async (correct: boolean): Promise<void> => {
    if (!exercise || !moduleId || !lessonId) return

    const timeSpentMs = Date.now() - startTime.current
    await recordAttempt({
      exerciseId: exercise.id,
      lessonId,
      moduleId,
      type: exercise.type,
      success: correct,
      timeSpentMs
    })

    if (correct) {
      setCompleted(true)

      // Create FSRS card for spaced repetition review
      const now = new Date()
      const card = createNewCard()
      await upsertFsrsCard({
        exerciseId: exercise.id,
        due: card.due.toISOString(),
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days: card.elapsed_days,
        scheduled_days: card.scheduled_days,
        reps: card.reps,
        lapses: card.lapses,
        state: card.state,
        last_review: now.toISOString()
      })

      // Update mastery for each concept
      for (const concept of exercise.concept_tags) {
        await updateMastery(concept, 'learning')
      }

      // Check if all exercises in this lesson are now completed
      const lessonAttempts = await window.julius.getLessonAttempts(lessonId)
      const exercises = await window.julius.listExercises(moduleId, lessonId)
      const passedExercises = new Set(
        lessonAttempts.filter((a) => a.best_success === 1).map((a) => a.exercise_id)
      )

      // Load all exercises to get their IDs for comparison
      let allPassed = exercises.length > 0
      for (const exFile of exercises) {
        const exData = await window.julius.loadExercise(moduleId, lessonId, exFile)
        if (exData && !passedExercises.has(exData.id)) {
          allPassed = false
          break
        }
      }

      if (allPassed && exercises.length > 0) {
        await updateLessonProgress(lessonId, moduleId, true)
        // Upgrade concepts to proficient when lesson is complete
        for (const concept of exercise.concept_tags) {
          await updateMastery(concept, 'proficient')
        }
      }

      await loadAll()
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading exercise...</div>
  }

  if (!exercise) {
    return <div style={{ color: 'var(--text-error)' }}>Exercise not found.</div>
  }

  return (
    <div className="exercise-container">
      <div className="view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{exercise.type}</span>
          {completed && <span className="badge badge-success">Completed</span>}
        </div>
        <h2 style={{ fontSize: '1.25rem' }}>{exercise.prompt}</h2>
      </div>

      <div className="exercise-prompt" style={{ display: 'none' }} />

      {exercise.type === 'write' && <WriteExercise exercise={exercise} onResult={handleResult} />}
      {exercise.type === 'parsons' && <ParsonsExercise exercise={exercise} onResult={handleResult} />}
      {exercise.type === 'trace' && <TraceExercise exercise={exercise} onResult={handleResult} />}
      {exercise.type === 'fill-in' && <FillInExercise exercise={exercise} onResult={handleResult} />}

      <div className="lesson-nav" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/lesson/${moduleId}/${lessonId}`)}
          >
            Back to Lesson
          </button>
          {prevExercise && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/exercise/${moduleId}/${lessonId}/${prevExercise}`)}
            >
              Previous
            </button>
          )}
        </div>
        <div>
          {completed && nextExercise && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/exercise/${moduleId}/${lessonId}/${nextExercise}`)}
            >
              Next Exercise
            </button>
          )}
          {completed && !nextExercise && (
            <button
              className="btn btn-success"
              onClick={() => navigate(`/lesson/${moduleId}/${lessonId}`)}
            >
              Lesson Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
