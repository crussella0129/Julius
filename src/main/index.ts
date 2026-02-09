import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { execFile } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase, getDb } from './db'
import { runPython } from './python-runner'
import { loadModule, loadLesson, loadExercise, listModules, listExercises, getLessonTitles, buildExerciseIndex, loadPlacement } from './content-loader'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    // On Linux X11, Electron dev mode hardcodes WM_CLASS to "Chromium" (binary name).
    // Use xdotool to override it so GNOME matches our julius.desktop file and shows
    // the correct dock icon. This is a no-op on Wayland or if xdotool isn't installed.
    if (process.platform === 'linux') {
      const nativeHandle = mainWindow.getNativeWindowHandle()
      // X11 window ID is a 32-bit uint in the native handle buffer
      const xid = nativeHandle.readUInt32LE(0)
      execFile('xdotool', ['set_window', '--class', 'julius', '--classname', 'julius', String(xid)], () => {})
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function setupIPC(): void {
  // Theme
  ipcMain.handle('get-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })

  ipcMain.handle('set-theme', (_event, theme: 'dark' | 'light' | 'system') => {
    nativeTheme.themeSource = theme
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })

  // Content
  ipcMain.handle('list-modules', () => listModules())
  ipcMain.handle('load-module', (_event, moduleId: string) => loadModule(moduleId))
  ipcMain.handle('load-lesson', (_event, moduleId: string, lessonId: string) =>
    loadLesson(moduleId, lessonId)
  )
  ipcMain.handle('load-exercise', (_event, moduleId: string, lessonId: string, exerciseFile: string) =>
    loadExercise(moduleId, lessonId, exerciseFile)
  )
  ipcMain.handle('list-exercises', (_event, moduleId: string, lessonId: string) =>
    listExercises(moduleId, lessonId)
  )
  ipcMain.handle('get-lesson-titles', (_event, moduleId: string) =>
    getLessonTitles(moduleId)
  )
  ipcMain.handle('build-exercise-index', () => buildExerciseIndex())
  ipcMain.handle('load-placement', () => loadPlacement())

  // Python execution
  ipcMain.handle('run-python', (_event, code: string, timeout?: number) =>
    runPython(code, timeout)
  )

  // Data export
  ipcMain.handle('export-progress', () => {
    const db = getDb()
    const mastery = db.prepare('SELECT * FROM concept_mastery').all()
    const attempts = db.prepare('SELECT * FROM exercise_attempts').all()
    const cards = db.prepare('SELECT * FROM fsrs_cards').all()
    const lessons = db.prepare('SELECT * FROM lesson_progress').all()
    return { mastery, attempts, cards, lessons, exportedAt: new Date().toISOString() }
  })

  // Progress database
  ipcMain.handle('db-get-progress', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM exercise_attempts').all()
  })

  ipcMain.handle('db-get-concept-mastery', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM concept_mastery').all()
  })

  ipcMain.handle('db-record-attempt', (_event, attempt: {
    exerciseId: string
    lessonId: string
    moduleId: string
    type: string
    success: boolean
    code?: string
    timeSpentMs: number
  }) => {
    const db = getDb()
    db.prepare(`
      INSERT INTO exercise_attempts (exercise_id, lesson_id, module_id, type, success, code, time_spent_ms)
      VALUES (@exerciseId, @lessonId, @moduleId, @type, @success, @code, @timeSpentMs)
    `).run(attempt)
    return { ok: true }
  })

  ipcMain.handle('db-update-mastery', (_event, concept: string, level: string) => {
    const db = getDb()
    db.prepare(`
      INSERT INTO concept_mastery (concept, level, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(concept) DO UPDATE SET level = excluded.level, updated_at = excluded.updated_at
    `).run(concept, level)
    return { ok: true }
  })

  ipcMain.handle('db-get-fsrs-cards', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM fsrs_cards').all()
  })

  ipcMain.handle('db-upsert-fsrs-card', (_event, card: {
    exerciseId: string
    due: string
    stability: number
    difficulty: number
    elapsed_days: number
    scheduled_days: number
    reps: number
    lapses: number
    state: number
    last_review: string
  }) => {
    const db = getDb()
    db.prepare(`
      INSERT INTO fsrs_cards (exercise_id, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review)
      VALUES (@exerciseId, @due, @stability, @difficulty, @elapsed_days, @scheduled_days, @reps, @lapses, @state, @last_review)
      ON CONFLICT(exercise_id) DO UPDATE SET
        due = excluded.due,
        stability = excluded.stability,
        difficulty = excluded.difficulty,
        elapsed_days = excluded.elapsed_days,
        scheduled_days = excluded.scheduled_days,
        reps = excluded.reps,
        lapses = excluded.lapses,
        state = excluded.state,
        last_review = excluded.last_review
    `).run(card)
    return { ok: true }
  })

  ipcMain.handle('db-get-lesson-progress', (_event, lessonId: string) => {
    const db = getDb()
    return db.prepare('SELECT * FROM lesson_progress WHERE lesson_id = ?').get(lessonId)
  })

  ipcMain.handle('db-update-lesson-progress', (_event, lessonId: string, moduleId: string, completed: boolean) => {
    const db = getDb()
    db.prepare(`
      INSERT INTO lesson_progress (lesson_id, module_id, completed, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(lesson_id) DO UPDATE SET completed = excluded.completed, updated_at = excluded.updated_at
    `).run(lessonId, moduleId, completed ? 1 : 0)
    return { ok: true }
  })

  ipcMain.handle('db-get-all-lesson-progress', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM lesson_progress').all()
  })

  ipcMain.handle('db-get-exercise-attempts', (_event, exerciseId: string) => {
    const db = getDb()
    return db.prepare('SELECT * FROM exercise_attempts WHERE exercise_id = ? ORDER BY attempted_at DESC').all(exerciseId)
  })

  ipcMain.handle('db-get-lesson-attempts', (_event, lessonId: string) => {
    const db = getDb()
    return db.prepare(
      'SELECT exercise_id, MAX(success) as best_success FROM exercise_attempts WHERE lesson_id = ? GROUP BY exercise_id'
    ).all(lessonId)
  })
}

// On Linux, fix the dock icon by setting WM_CLASS to match our .desktop file.
// In production, electron-builder handles this. In dev mode, the electron binary
// hardcodes WM_CLASS to "Chromium", so we use xdotool to override it on X11.
if (process.platform === 'linux') {
  app.setDesktopName('julius.desktop')
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.julius.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  initDatabase()
  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
