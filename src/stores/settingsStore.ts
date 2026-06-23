import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  amapKey: string
  isFirstVisit: boolean
  setAmapKey: (key: string) => void
  markVisited: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      amapKey: '',
      isFirstVisit: true,
      setAmapKey: (key) => set({ amapKey: key }),
      markVisited: () => set({ isFirstVisit: false }),
    }),
    { name: 'wte-settings' }
  )
)
