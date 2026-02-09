/// <reference types="vite/client" />

interface JuliusAPI {
  getTheme: () => Promise<'dark' | 'light'>
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<'dark' | 'light'>
  listModules: () => Promise<ModuleMeta[]>
  loadModule: (moduleId: string) => Promise<ModuleMeta | null>
  loadLesson: (moduleId: string, lessonId: string) => Promise<LessonMeta | null>
  loadExercise: (moduleId: string, lessonId: string, exerciseFile: string) => Promise<ExerciseData | null>
  runPython: (code: string, timeout?: number) => Promise<PythonResult>
  getProgress: () => Promise<unknown[]>
  getConceptMastery: () => Promise<ConceptMasteryRow[]>
  recordAttempt: (attempt: AttemptInput) => Promise<{ ok: boolean }>
  updateMastery: (concept: string, level: string) => Promise<{ ok: boolean }>
  getFsrsCards: () => Promise<FsrsCardRow[]>
  upsertFsrsCard: (card: FsrsCardInput) => Promise<{ ok: boolean }>
  getLessonProgress: (lessonId: string) => Promise<LessonProgressRow | undefined>
  updateLessonProgress: (lessonId: string, moduleId: string, completed: boolean) => Promise<{ ok: boolean }>
  getAllLessonProgress: () => Promise<LessonProgressRow[]>
}

interface ModuleMeta {
  id: string
  title: string
  description: string
  order: number
  lessons: string[]
}

interface LessonMeta {
  id: string
  moduleId: string
  title: string
  concepts: string[]
  why: string
  prerequisites: string[]
  sources: { repo: string; section: string; license: string }[]
  content: string
}

interface ExerciseData {
  type: 'trace' | 'parsons' | 'fill-in' | 'write'
  id: string
  prompt: string
  concept_tags: string[]
  // Type-specific
  starter_code?: string
  tests?: { description: string; check: string }[]
  hints?: string[]
  code?: string
  steps?: { line: number; variables: Record<string, string>; output?: string; explanation: string }[]
  expected_output?: string
  blocks?: string[]
  distractors?: string[]
  solution_order?: number[]
  template?: string
  blanks?: { position: number; answer: string; hint?: string }[]
  solution?: string
}

interface PythonResult {
  stdout: string
  stderr: string
  exitCode: number | null
  error?: string
  friendlyError?: string
}

interface ConceptMasteryRow {
  concept: string
  level: string
  updated_at: string
}

interface AttemptInput {
  exerciseId: string
  lessonId: string
  moduleId: string
  type: string
  success: boolean
  code?: string
  timeSpentMs: number
}

interface FsrsCardRow {
  exercise_id: string
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: number
  last_review: string
}

interface FsrsCardInput {
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
}

interface LessonProgressRow {
  lesson_id: string
  module_id: string
  completed: number
  updated_at: string
}

interface Window {
  julius: JuliusAPI
}
