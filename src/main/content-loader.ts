import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { parse as parseYaml } from 'yaml'
import matter from 'gray-matter'

function getContentRoot(): string {
  if (is.dev) {
    return join(process.cwd(), 'content')
  }
  return join(process.resourcesPath, 'content')
}

export interface ModuleMeta {
  id: string
  title: string
  description: string
  order: number
  lessons: string[]
}

export interface LessonMeta {
  id: string
  moduleId: string
  title: string
  concepts: string[]
  why: string
  prerequisites: string[]
  sources: { repo: string; section: string; license: string }[]
  content: string
}

export interface ExerciseData {
  type: 'trace' | 'parsons' | 'fill-in' | 'write'
  id: string
  prompt: string
  concept_tags: string[]
  [key: string]: unknown
}

export function listModules(): ModuleMeta[] {
  const root = getContentRoot()
  const modulesDir = join(root, 'modules')
  if (!existsSync(modulesDir)) return []

  const dirs = readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  const modules: ModuleMeta[] = []
  for (const dir of dirs) {
    const yamlPath = join(modulesDir, dir, 'module.yaml')
    if (existsSync(yamlPath)) {
      try {
        const raw = readFileSync(yamlPath, 'utf-8')
        modules.push(parseYaml(raw) as ModuleMeta)
      } catch (err) {
        console.error(`Failed to parse module YAML: ${yamlPath}`, err)
      }
    }
  }

  return modules.sort((a, b) => a.order - b.order)
}

export function loadModule(moduleId: string): ModuleMeta | null {
  const root = getContentRoot()
  const yamlPath = join(root, 'modules', moduleId, 'module.yaml')
  if (!existsSync(yamlPath)) return null
  try {
    return parseYaml(readFileSync(yamlPath, 'utf-8')) as ModuleMeta
  } catch (err) {
    console.error(`Failed to parse module YAML: ${yamlPath}`, err)
    return null
  }
}

export function loadLesson(moduleId: string, lessonId: string): LessonMeta | null {
  const root = getContentRoot()
  const mdPath = join(root, 'modules', moduleId, 'lessons', lessonId, 'lesson.md')
  if (!existsSync(mdPath)) return null

  try {
    const raw = readFileSync(mdPath, 'utf-8')
    const { data, content } = matter(raw)

    return {
      id: data.id || lessonId,
      moduleId,
      title: data.title || lessonId,
      concepts: data.concepts || [],
      why: data.why || '',
      prerequisites: data.prerequisites || [],
      sources: data.sources || [],
      content
    }
  } catch (err) {
    console.error(`Failed to parse lesson: ${mdPath}`, err)
    return null
  }
}

export function loadExercise(moduleId: string, lessonId: string, exerciseFile: string): ExerciseData | null {
  const root = getContentRoot()
  const exPath = join(root, 'modules', moduleId, 'lessons', lessonId, 'exercises', exerciseFile)
  if (!existsSync(exPath)) return null

  try {
    const raw = readFileSync(exPath, 'utf-8')
    return parseYaml(raw) as ExerciseData
  } catch (err) {
    console.error(`Failed to parse exercise YAML: ${exPath}`, err)
    return null
  }
}

export function getLessonTitles(moduleId: string): Record<string, string> {
  const root = getContentRoot()
  const mod = loadModule(moduleId)
  if (!mod) return {}

  const titles: Record<string, string> = {}
  for (const lessonId of mod.lessons) {
    const mdPath = join(root, 'modules', moduleId, 'lessons', lessonId, 'lesson.md')
    if (existsSync(mdPath)) {
      try {
        const raw = readFileSync(mdPath, 'utf-8')
        const { data } = matter(raw)
        titles[lessonId] = data.title || lessonId
      } catch {
        titles[lessonId] = lessonId
      }
    } else {
      titles[lessonId] = lessonId
    }
  }
  return titles
}

export function buildExerciseIndex(): Record<string, { moduleId: string; lessonId: string; exerciseFile: string; prompt: string }> {
  const index: Record<string, { moduleId: string; lessonId: string; exerciseFile: string; prompt: string }> = {}
  const modules = listModules()

  for (const mod of modules) {
    for (const lessonId of mod.lessons) {
      const files = listExercises(mod.id, lessonId)
      for (const file of files) {
        const ex = loadExercise(mod.id, lessonId, file)
        if (ex) {
          index[ex.id] = { moduleId: mod.id, lessonId, exerciseFile: file, prompt: ex.prompt }
        }
      }
    }
  }

  return index
}

export function listExercises(moduleId: string, lessonId: string): string[] {
  const root = getContentRoot()
  const exDir = join(root, 'modules', moduleId, 'lessons', lessonId, 'exercises')
  if (!existsSync(exDir)) return []

  return readdirSync(exDir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
}
