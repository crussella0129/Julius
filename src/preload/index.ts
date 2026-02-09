import { contextBridge, ipcRenderer } from 'electron'

export interface JuliusAPI {
  // Theme
  getTheme: () => Promise<'dark' | 'light'>
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<'dark' | 'light'>

  // Content
  listModules: () => Promise<unknown[]>
  loadModule: (moduleId: string) => Promise<unknown>
  loadLesson: (moduleId: string, lessonId: string) => Promise<unknown>
  loadExercise: (moduleId: string, lessonId: string, exerciseFile: string) => Promise<unknown>
  listExercises: (moduleId: string, lessonId: string) => Promise<string[]>
  getLessonTitles: (moduleId: string) => Promise<Record<string, string>>

  // Python execution
  runPython: (code: string, timeout?: number) => Promise<{
    stdout: string
    stderr: string
    exitCode: number | null
    error?: string
    friendlyError?: string
  }>

  // Progress database
  getProgress: () => Promise<unknown[]>
  getConceptMastery: () => Promise<unknown[]>
  recordAttempt: (attempt: {
    exerciseId: string
    lessonId: string
    moduleId: string
    type: string
    success: boolean
    code?: string
    timeSpentMs: number
  }) => Promise<{ ok: boolean }>
  updateMastery: (concept: string, level: string) => Promise<{ ok: boolean }>
  getFsrsCards: () => Promise<unknown[]>
  upsertFsrsCard: (card: {
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
  }) => Promise<{ ok: boolean }>
  getLessonProgress: (lessonId: string) => Promise<unknown>
  updateLessonProgress: (lessonId: string, moduleId: string, completed: boolean) => Promise<{ ok: boolean }>
  getAllLessonProgress: () => Promise<unknown[]>
  getExerciseAttempts: (exerciseId: string) => Promise<unknown[]>
  getLessonAttempts: (lessonId: string) => Promise<{ exercise_id: string; best_success: number }[]>
  exportProgress: () => Promise<unknown>
}

const api: JuliusAPI = {
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),

  listModules: () => ipcRenderer.invoke('list-modules'),
  loadModule: (moduleId) => ipcRenderer.invoke('load-module', moduleId),
  loadLesson: (moduleId, lessonId) => ipcRenderer.invoke('load-lesson', moduleId, lessonId),
  loadExercise: (moduleId, lessonId, exerciseFile) =>
    ipcRenderer.invoke('load-exercise', moduleId, lessonId, exerciseFile),
  listExercises: (moduleId, lessonId) =>
    ipcRenderer.invoke('list-exercises', moduleId, lessonId),
  getLessonTitles: (moduleId) =>
    ipcRenderer.invoke('get-lesson-titles', moduleId),

  runPython: (code, timeout) => ipcRenderer.invoke('run-python', code, timeout),

  getProgress: () => ipcRenderer.invoke('db-get-progress'),
  getConceptMastery: () => ipcRenderer.invoke('db-get-concept-mastery'),
  recordAttempt: (attempt) => ipcRenderer.invoke('db-record-attempt', attempt),
  updateMastery: (concept, level) => ipcRenderer.invoke('db-update-mastery', concept, level),
  getFsrsCards: () => ipcRenderer.invoke('db-get-fsrs-cards'),
  upsertFsrsCard: (card) => ipcRenderer.invoke('db-upsert-fsrs-card', card),
  getLessonProgress: (lessonId) => ipcRenderer.invoke('db-get-lesson-progress', lessonId),
  updateLessonProgress: (lessonId, moduleId, completed) =>
    ipcRenderer.invoke('db-update-lesson-progress', lessonId, moduleId, completed),
  getAllLessonProgress: () => ipcRenderer.invoke('db-get-all-lesson-progress'),
  getExerciseAttempts: (exerciseId) => ipcRenderer.invoke('db-get-exercise-attempts', exerciseId),
  getLessonAttempts: (lessonId) => ipcRenderer.invoke('db-get-lesson-attempts', lessonId),
  exportProgress: () => ipcRenderer.invoke('export-progress')
}

contextBridge.exposeInMainWorld('julius', api)
