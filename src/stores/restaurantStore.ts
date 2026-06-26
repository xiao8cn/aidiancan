import { create } from 'zustand'
import type { Restaurant, RestaurantCacheState } from '../types'
import { searchNearbyWithMeta } from '../services/amap'
import { filterRestaurants } from '../utils/filter'
import { pickRandom } from '../utils/random'
import { useDiningHistoryStore } from './diningHistoryStore'
import { useFilterStore } from './filterStore'

interface RestaurantState {
  items: Restaurant[]
  selected: Restaurant | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  cacheState?: RestaurantCacheState
  lastUpdatedAt?: number
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
  cacheState: undefined,
  lastUpdatedAt: undefined,

  search: async (key, location) => {
    set({ status: 'loading', error: null })
    try {
      const radius = useFilterStore.getState().radius
      const category = useFilterStore.getState().category
      const result = await searchNearbyWithMeta(key, location, radius, category)
      set({
        items: result.restaurants,
        status: 'success',
        cacheState: result.cacheState,
        lastUpdatedAt: result.lastUpdatedAt,
      })
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : '搜索失败' })
    }
  },

  pickRandomRestaurant: () => {
    const filter = useFilterStore.getState()
    const filtered = filterRestaurants(get().items, filter)
    const recentIds = useDiningHistoryStore.getState().getRecentRestaurantIds()
    const fresh = filtered.filter((restaurant) => !recentIds.has(restaurant.id))
    const selected = pickRandom(fresh.length > 0 ? fresh : filtered)
    if (selected) {
      useDiningHistoryStore.getState().addRecommendation(selected)
    }
    set({ selected })
  },

  clearRestaurants: () =>
    set({
      items: [],
      selected: null,
      status: 'idle',
      error: null,
      cacheState: undefined,
      lastUpdatedAt: undefined,
    }),

  clearSelection: () => set({ selected: null }),
}))
