import { useAppStore } from '../stores/app'

export default function Settings(): JSX.Element {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

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
        <h3>About</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Julius v0.1.0</div>
            <div className="settings-desc">A Python teaching app with research-backed pedagogy</div>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Python Runtime</div>
            <div className="settings-desc">Uses your system's python3 installation</div>
          </div>
        </div>
      </div>
    </div>
  )
}
