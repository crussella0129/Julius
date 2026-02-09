import { create } from 'zustand'

interface AppState {
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  currentModule: string | null
  currentLesson: string | null
  modules: ModuleMeta[]

  setTheme: (theme: 'dark' | 'light') => void
  toggleSidebar: () => void
  setCurrentModule: (moduleId: string | null) => void
  setCurrentLesson: (lessonId: string | null) => void
  setModules: (modules: ModuleMeta[]) => void
  loadModules: () => Promise<void>
  initTheme: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  sidebarCollapsed: false,
  currentModule: null,
  currentLesson: null,
  modules: [],

  setTheme: (theme) => {
    set({ theme })
    document.documentElement.setAttribute('data-theme', theme)
    window.julius.setTheme(theme)
  },

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setCurrentModule: (moduleId) => set({ currentModule: moduleId }),
  setCurrentLesson: (lessonId) => set({ currentLesson: lessonId }),
  setModules: (modules) => set({ modules }),

  loadModules: async () => {
    const modules = await window.julius.listModules()
    set({ modules })
  },

  initTheme: async () => {
    const theme = await window.julius.getTheme()
    set({ theme })
    document.documentElement.setAttribute('data-theme', theme)
  }
}))
