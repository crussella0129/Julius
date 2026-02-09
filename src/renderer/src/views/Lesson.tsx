import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAppStore } from '../stores/app'
import { useProgressStore } from '../stores/progress'

export default function Lesson(): JSX.Element {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>()
  const [lesson, setLesson] = useState<LessonMeta | null>(null)
  const [exercises, setExercises] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const modules = useAppStore((s) => s.modules)
  const lessonProgress = useProgressStore((s) => s.lessonProgress)
  const conceptMastery = useProgressStore((s) => s.conceptMastery)
  const navigate = useNavigate()

  useEffect(() => {
    if (!moduleId || !lessonId) return
    setLoading(true)

    window.julius.loadLesson(moduleId, lessonId).then((data) => {
      setLesson(data)
      setLoading(false)
    })

    // Load exercise file list from content directory
    window.julius.listExercises(moduleId, lessonId).then((files) => {
      setExercises(files)
    })
  }, [moduleId, lessonId])

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading lesson...</div>
  }

  if (!lesson) {
    return <div style={{ color: 'var(--text-error)' }}>Lesson not found.</div>
  }

  // Find current module and navigation
  const currentModule = modules.find((m) => m.id === moduleId)
  const lessonIndex = currentModule?.lessons.indexOf(lessonId!) ?? -1
  const prevLesson = lessonIndex > 0 ? currentModule?.lessons[lessonIndex - 1] : null
  const nextLesson = currentModule && lessonIndex < currentModule.lessons.length - 1
    ? currentModule.lessons[lessonIndex + 1]
    : null

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-info">{currentModule?.title}</span>
          {lessonProgress[lessonId!] && <span className="badge badge-success">Completed</span>}
        </div>
        <h2>{lesson.title}</h2>
      </div>

      {lesson.why && (
        <div className="why-section">
          <div className="why-label">Why learn this?</div>
          <div>{lesson.why}</div>
        </div>
      )}

      {lesson.concepts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginRight: '0.5rem' }}>Concepts:</span>
          <div className="concept-map" style={{ display: 'inline-flex' }}>
            {lesson.concepts.map((c) => (
              <span key={c} className={`concept-tag ${conceptMastery[c] || ''}`}>{c}</span>
            ))}
          </div>
        </div>
      )}

      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {lesson.content}
        </ReactMarkdown>
      </div>

      {exercises.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Practice Exercises</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {exercises.map((ex) => {
              const label = ex.replace('.yaml', '').replace(/^\d+-/, '').replace(/-/g, ' ')
              const type = label.split(' ')[0]
              return (
                <button
                  key={ex}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', textTransform: 'capitalize' }}
                  onClick={() => navigate(`/exercise/${moduleId}/${lessonId}/${ex}`)}
                >
                  <span className="badge badge-info">{type}</span>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {lesson.sources && lesson.sources.length > 0 && (
        <div className="sources-section">
          <h4>Sources & Attribution</h4>
          {lesson.sources.map((src, i) => (
            <div key={i} className="source-item">
              {src.repo} — {src.section} ({src.license})
            </div>
          ))}
        </div>
      )}

      <div className="lesson-nav">
        <div>
          {prevLesson && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/lesson/${moduleId}/${prevLesson}`)}
            >
              Previous
            </button>
          )}
        </div>
        <div>
          {nextLesson && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/lesson/${moduleId}/${nextLesson}`)}
            >
              Next Lesson
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
