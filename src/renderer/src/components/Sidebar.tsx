import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppStore } from '../stores/app'
import { useProgressStore } from '../stores/progress'

export default function Sidebar(): JSX.Element {
  const modules = useAppStore((s) => s.modules)
  const reviewDueCount = useProgressStore((s) => s.reviewDueCount)
  const lessonProgress = useProgressStore((s) => s.lessonProgress)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
  const [lessonTitles, setLessonTitles] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    if (modules.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [modules[0].id]: true })
    }

    // Load lesson titles for all modules
    const loadTitles = async (): Promise<void> => {
      const titles: Record<string, Record<string, string>> = {}
      for (const mod of modules) {
        titles[mod.id] = await window.julius.getLessonTitles(mod.id)
      }
      setLessonTitles(titles)
    }
    if (modules.length > 0) loadTitles()
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
            to="/placement"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            Find Your Level
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

        {(() => {
          const categories: { label: string; orders: number[] }[] = [
            { label: 'Beginner', orders: [1, 2] },
            { label: 'Intermediate', orders: [3, 4] },
            { label: 'Applied', orders: [5, 6, 7] },
            { label: 'Practical', orders: [8, 9] },
            { label: 'Specialized', orders: [10, 11, 12, 13, 14, 15] }
          ]

          return categories.map((cat) => {
            const catModules = modules.filter((m) => cat.orders.includes(m.order))
            if (catModules.length === 0) return null

            return (
              <div key={cat.label}>
                <div
                  className="sidebar-section-title"
                  style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', marginTop: '0.5rem' }}
                >
                  {cat.label}
                </div>
                {catModules.map((mod) => (
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
                        const title = lessonTitles[mod.id]?.[lessonId] || lessonId.replace(/^\d+-/, '').replace(/-/g, ' ')
                        return (
                          <NavLink
                            key={lessonId}
                            to={`/lesson/${mod.id}/${lessonId}`}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                          >
                            <span className={`mastery-dot ${mastery}`} />
                            {title}
                          </NavLink>
                        )
                      })}
                  </div>
                ))}
              </div>
            )
          })
        })()}
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
