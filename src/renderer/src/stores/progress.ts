import { create } from 'zustand'

type MasteryLevel = 'not-started' | 'learning' | 'proficient' | 'mastered'

interface ProgressState {
  conceptMastery: Record<string, MasteryLevel>
  lessonProgress: Record<string, boolean>
  reviewDueCount: number
  fsrsCards: FsrsCardRow[]

  loadAll: () => Promise<void>
  recordAttempt: (attempt: AttemptInput) => Promise<void>
  updateMastery: (concept: string, level: MasteryLevel) => Promise<void>
  updateLessonProgress: (lessonId: string, moduleId: string, completed: boolean) => Promise<void>
  loadFsrsCards: () => Promise<void>
  upsertFsrsCard: (card: FsrsCardInput) => Promise<void>
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  conceptMastery: {},
  lessonProgress: {},
  reviewDueCount: 0,
  fsrsCards: [],

  loadAll: async () => {
    const [masteryRows, lessonRows, cards] = await Promise.all([
      window.julius.getConceptMastery(),
      window.julius.getAllLessonProgress(),
      window.julius.getFsrsCards()
    ])

    const conceptMastery: Record<string, MasteryLevel> = {}
    for (const row of masteryRows) {
      conceptMastery[row.concept] = row.level as MasteryLevel
    }

    const lessonProgress: Record<string, boolean> = {}
    for (const row of lessonRows) {
      lessonProgress[row.lesson_id] = row.completed === 1
    }

    const now = new Date()
    const reviewDueCount = cards.filter(
      (c) => new Date(c.due) <= now
    ).length

    set({ conceptMastery, lessonProgress, reviewDueCount, fsrsCards: cards })
  },

  recordAttempt: async (attempt) => {
    await window.julius.recordAttempt(attempt)
  },

  updateMastery: async (concept, level) => {
    await window.julius.updateMastery(concept, level)
    set((s) => ({
      conceptMastery: { ...s.conceptMastery, [concept]: level }
    }))
  },

  updateLessonProgress: async (lessonId, moduleId, completed) => {
    await window.julius.updateLessonProgress(lessonId, moduleId, completed)
    set((s) => ({
      lessonProgress: { ...s.lessonProgress, [lessonId]: completed }
    }))
  },

  loadFsrsCards: async () => {
    const cards = await window.julius.getFsrsCards()
    const now = new Date()
    const reviewDueCount = cards.filter((c) => new Date(c.due) <= now).length
    set({ fsrsCards: cards, reviewDueCount })
  },

  upsertFsrsCard: async (card) => {
    await window.julius.upsertFsrsCard(card)
    await get().loadFsrsCards()
  }
}))
