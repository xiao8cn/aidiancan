import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  tags: string[]
  restaurantTags: Record<string, string[]>
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  toggleRestaurantTag: (restaurantId: string, tag: string) => void
  getRestaurantTags: (restaurantId: string) => string[]
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      tags: ['想吃', '聚餐', '快餐', '清淡'],
      restaurantTags: {},

      addTag: (tag) => {
        set((state) => ({
          tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
        }))
      },

      removeTag: (tag) => {
        set((state) => ({
          tags: state.tags.filter((t) => t !== tag),
          restaurantTags: Object.fromEntries(
            Object.entries(state.restaurantTags).map(([id, tags]) => [
              id,
              tags.filter((t) => t !== tag),
            ])
          ),
        }))
      },

      toggleRestaurantTag: (restaurantId, tag) => {
        set((state) => {
          const current = state.restaurantTags[restaurantId] ?? []
          const next = current.includes(tag)
            ? current.filter((t) => t !== tag)
            : [...current, tag]
          return {
            restaurantTags: { ...state.restaurantTags, [restaurantId]: next },
          }
        })
      },

      getRestaurantTags: (restaurantId) => {
        return get().restaurantTags[restaurantId] ?? []
      },
    }),
    { name: 'wte-wishlist' }
  )
)
