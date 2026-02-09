import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './stores/app'
import { useProgressStore } from './stores/progress'
import Sidebar from './components/Sidebar'
import Dashboard from './views/Dashboard'
import Placement from './views/Placement'
import Lesson from './views/Lesson'
import Exercise from './views/Exercise'
import Review from './views/Review'
import Settings from './views/Settings'
import './App.css'

export default function App(): JSX.Element {
  const initTheme = useAppStore((s) => s.initTheme)
  const loadModules = useAppStore((s) => s.loadModules)
  const loadAll = useProgressStore((s) => s.loadAll)

  useEffect(() => {
    initTheme()
    loadModules()
    loadAll()
  }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/placement" element={<Placement />} />
            <Route path="/lesson/:moduleId/:lessonId" element={<Lesson />} />
            <Route path="/exercise/:moduleId/:lessonId/:exerciseFile" element={<Exercise />} />
            <Route path="/review" element={<Review />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
