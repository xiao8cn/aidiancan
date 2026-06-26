import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, FoodCategory, SurfaceMode } from '../types'

export const PRICE_SLIDER_MIN = 0
export const PRICE_SLIDER_MAX = 200
export const PRICE_SLIDER_STEP = 10
export const DEFAULT_MIN_RATING = 3
export const DEFAULT_MAX_RATING = 5

interface FilterStore extends FilterState {
  setRadius: (radius: number) => void
  setPriceRange: (range: [number, number]) => void
  setCategory: (category: FoodCategory) => void
  setMinRating: (value: number) => void
  setMaxRating: (value: number) => void
  setSurfaceMode: (surfaceMode: SurfaceMode) => void
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      radius: 1000,
      minPrice: PRICE_SLIDER_MIN,
      maxPrice: PRICE_SLIDER_MAX,
      category: 'all',
      minRating: DEFAULT_MIN_RATING,
      maxRating: DEFAULT_MAX_RATING,
      surfaceMode: 'any',
      setRadius: (radius) => set({ radius }),
      setPriceRange: ([minPrice, maxPrice]) => set({ minPrice, maxPrice }),
      setCategory: (category) => set({ category }),
      setMinRating: (minRating) => set({ minRating }),
      setMaxRating: (maxRating) => set({ maxRating }),
      setSurfaceMode: (surfaceMode) => set({ surfaceMode }),
    }),
    { name: 'wte-filter' }
  )
)
