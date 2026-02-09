import { useEffect, useState } from 'react'
import { useAppStore } from '../stores/app'

export default function Settings(): JSX.Element {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const [pythonVersion, setPythonVersion] = useState<string>('Checking...')
  const [exportStatus, setExportStatus] = useState<string>('')

  useEffect(() => {
    window.julius.runPython('import sys; print(sys.version.split()[0])', 5000).then((result) => {
      if (result.exitCode === 0) {
        setPythonVersion(result.stdout.trim())
      } else {
        setPythonVersion('Not found')
      }
    })
  }, [])

  const handleExport = async (): Promise<void> => {
    const data = await window.julius.exportProgress()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `julius-progress-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setExportStatus('Progress exported successfully!')
    setTimeout(() => setExportStatus(''), 3000)
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="view-header">
        <h2>Settings</h2>
        <p>Customize your Julius experience</p>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Theme</div>
            <div className="settings-desc">Choose light or dark mode</div>
          </div>
          <div className="theme-toggle">
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>
              Light
            </button>
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>
              Dark
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Data</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Export Progress</div>
            <div className="settings-desc">Download your learning data as JSON</div>
          </div>
          <button className="btn btn-secondary" onClick={handleExport}>
            Export
          </button>
        </div>
        {exportStatus && (
          <div style={{ color: 'var(--text-success)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {exportStatus}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Julius v0.1.0</div>
            <div className="settings-desc">A Python teaching app with research-backed pedagogy</div>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Python Version</div>
            <div className="settings-desc">{pythonVersion}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
