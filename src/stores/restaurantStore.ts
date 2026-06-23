import { create } from 'zustand'
import type { Restaurant } from '../types'
import { searchNearby } from '../services/amap'
import { filterRestaurants } from '../utils/filter'
import { pickRandom } from '../utils/random'
import { useFilterStore } from './filterStore'

interface RestaurantState {
  items: Restaurant[]
  selected: Restaurant | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  search: (key: string, location: { lat: number; lng: number }) => Promise<void>
  pickRandomRestaurant: () => void
  clearRestaurants: () => void
  clearSelection: () => void
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  items: [],
  selected: null,
  status: 'idle',
  error: null,

  search: async (key, location) => {
    set({ status: 'loading', error: null })
    try {
      const radius = useFilterStore.getState().radius
      const category = useFilterStore.getState().category
      const items = await searchNearby(key, location, radius, category)
      set({ items, status: 'success' })
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : '搜索失败' })
    }
  },

  pickRandomRestaurant: () => {
    const filter = useFilterStore.getState()
    const filtered = filterRestaurants(get().items, filter)
    set({ selected: pickRandom(filtered) })
  },

  clearRestaurants: () => set({ items: [], selected: null, status: 'idle', error: null }),

  clearSelection: () => set({ selected: null }),
}))
