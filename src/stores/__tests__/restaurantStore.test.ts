import { describe, expect, it, vi } from 'vitest'
import { useDiningHistoryStore } from '../diningHistoryStore'
import { useFilterStore } from '../filterStore'
import { useRestaurantStore } from '../restaurantStore'
import type { Restaurant } from '../../types'

function restaurant(id: string): Restaurant {
  return {
    id,
    name: id,
    address: `${id}地址`,
    location: { lat: 23.12, lng: 113.32 },
    category: 'quick',
    surfaceKind: 'outdoor',
  }
}

describe('useRestaurantStore.pickRandomRestaurant', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    useFilterStore.setState({
      radius: 1000,
      minPrice: 0,
      maxPrice: 200,
      category: 'all',
      minRating: 0,
      maxRating: 5,
      surfaceMode: 'any',
    })
    useDiningHistoryStore.setState({ recommended: [], eaten: [] })
    useRestaurantStore.setState({ items: [], selected: null, status: 'idle', error: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('avoids recently recommended and eaten restaurants when alternatives exist', () => {
    useDiningHistoryStore.getState().addRecommendation(restaurant('recent-recommended'))
    useDiningHistoryStore.getState().addEaten(restaurant('recent-eaten'))
    useRestaurantStore.setState({
      items: [restaurant('recent-recommended'), restaurant('recent-eaten'), restaurant('fresh')],
    })

    useRestaurantStore.getState().pickRandomRestaurant()

    expect(useRestaurantStore.getState().selected?.id).toBe('fresh')
    expect(useDiningHistoryStore.getState().recommended[0].restaurant.id).toBe('fresh')
  })

  it('falls back to recent restaurants when every candidate is recent', () => {
    useDiningHistoryStore.getState().addRecommendation(restaurant('only'))
    useRestaurantStore.setState({ items: [restaurant('only')] })

    useRestaurantStore.getState().pickRandomRestaurant()

    expect(useRestaurantStore.getState().selected?.id).toBe('only')
  })
})
