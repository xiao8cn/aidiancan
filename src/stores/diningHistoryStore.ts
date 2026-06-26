import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiningHistoryEntry, Restaurant } from '../types'

const MAX_HISTORY_ITEMS = 30
const RECENT_RECOMMENDED_LIMIT = 3
const RECENT_EATEN_LIMIT = 7

interface DiningHistoryState {
  recommended: DiningHistoryEntry[]
  eaten: DiningHistoryEntry[]
  addRecommendation: (restaurant: Restaurant) => void
  addEaten: (restaurant: Restaurant) => void
  getLastRecommendation: () => DiningHistoryEntry | null
  getRecentRestaurantIds: () => Set<string>
  clearHistory: () => void
}

function toEntry(restaurant: Restaurant): DiningHistoryEntry {
  return {
    id: `${restaurant.id}-${Date.now()}`,
    restaurant,
    timestamp: Date.now(),
  }
}

function addBoundedEntry(entries: DiningHistoryEntry[], restaurant: Restaurant): DiningHistoryEntry[] {
  return [
    toEntry(restaurant),
    ...entries.filter((entry) => entry.restaurant.id !== restaurant.id),
  ].slice(0, MAX_HISTORY_ITEMS)
}

export const useDiningHistoryStore = create<DiningHistoryState>()(
  persist(
    (set, get) => ({
      recommended: [],
      eaten: [],

      addRecommendation: (restaurant) => {
        set((state) => ({ recommended: addBoundedEntry(state.recommended, restaurant) }))
      },

      addEaten: (restaurant) => {
        set((state) => ({ eaten: addBoundedEntry(state.eaten, restaurant) }))
      },

      getLastRecommendation: () => get().recommended[0] ?? null,

      getRecentRestaurantIds: () => {
        const { recommended, eaten } = get()
        return new Set([
          ...recommended.slice(0, RECENT_RECOMMENDED_LIMIT).map((entry) => entry.restaurant.id),
          ...eaten.slice(0, RECENT_EATEN_LIMIT).map((entry) => entry.restaurant.id),
        ])
      },

      clearHistory: () => set({ recommended: [], eaten: [] }),
    }),
    { name: 'wte-dining-history' }
  )
)
