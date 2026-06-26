import type { FilterState, Restaurant } from '../types'

export const PRICE_SLIDER_MAX = 200

export function filterRestaurants(restaurants: Restaurant[], filter: FilterState): Restaurant[] {
  return restaurants.filter((restaurant) => {
    if (restaurant.distance !== undefined && restaurant.distance > filter.radius) {
      return false
    }

    if (filter.category !== 'all' && restaurant.category !== filter.category) {
      return false
    }

    if (filter.surfaceMode !== 'any' && restaurant.surfaceKind !== filter.surfaceMode) {
      return false
    }

    const hasPriceFilter = filter.minPrice > 0 || filter.maxPrice < PRICE_SLIDER_MAX

    if (hasPriceFilter) {
      if (restaurant.cost === undefined) {
        return false
      }
      if (restaurant.cost < filter.minPrice) {
        return false
      }
      if (filter.maxPrice < PRICE_SLIDER_MAX && restaurant.cost > filter.maxPrice) {
        return false
      }
    }

    const hasRatingFilter = filter.minRating > 0 || filter.maxRating < 5

    if (hasRatingFilter) {
      if (restaurant.rating === undefined) {
        return false
      }
      if (restaurant.rating < filter.minRating || restaurant.rating > filter.maxRating) {
        return false
      }
    }

    return true
  })
}
