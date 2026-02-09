import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/app'
import { useProgressStore } from '../stores/progress'

export default function Sidebar(): JSX.Element {
  const modules = useAppStore((s) => s.modules)
  const reviewDueCount = useProgressStore((s) => s.reviewDueCount)
  const lessonProgress = useProgressStore((s) => s.lessonProgress)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (modules.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [modules[0].id]: true })
    }
  }, [modules])

  const toggleModule = (moduleId: string): void => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const getLessonMastery = (lessonId: string): string => {
    return lessonProgress[lessonId] ? 'mastered' : 'not-started'
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Julius</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>

          <NavLink
            to="/review"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="review-badge">
              Review
              {reviewDueCount > 0 && (
                <span className="review-count">{reviewDueCount}</span>
              )}
            </span>
          </NavLink>
        </div>

        {modules.map((mod) => (
          <div key={mod.id} className="sidebar-section">
            <div
              className="sidebar-section-title"
              onClick={() => toggleModule(mod.id)}
              style={{ cursor: 'pointer' }}
            >
              {expandedModules[mod.id] ? '\u25BE' : '\u25B8'} {mod.title}
            </div>

            {expandedModules[mod.id] &&
              mod.lessons.map((lessonId) => {
                const mastery = getLessonMastery(lessonId)
                return (
                  <NavLink
                    key={lessonId}
                    to={`/lesson/${mod.id}/${lessonId}`}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <span className={`mastery-dot ${mastery}`} />
                    {lessonId.replace(/^\d+-/, '').replace(/-/g, ' ')}
                  </NavLink>
                )
              })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-footer-link ${isActive ? 'active' : ''}`}
        >
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
