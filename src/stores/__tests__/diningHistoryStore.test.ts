import { describe, expect, it } from 'vitest'
import { useDiningHistoryStore } from '../diningHistoryStore'
import type { Restaurant } from '../../types'

function restaurant(id: string, name = id): Restaurant {
  return {
    id,
    name,
    address: `${name}地址`,
    location: { lat: 23.12, lng: 113.32 },
    category: 'quick',
    surfaceKind: 'unknown',
  }
}

describe('useDiningHistoryStore', () => {
  beforeEach(() => {
    useDiningHistoryStore.setState({ recommended: [], eaten: [] })
  })

  it('stores the latest recommendation first and deduplicates by restaurant id', () => {
    useDiningHistoryStore.getState().addRecommendation(restaurant('a', 'A'))
    useDiningHistoryStore.getState().addRecommendation(restaurant('b', 'B'))
    useDiningHistoryStore.getState().addRecommendation(restaurant('a', 'A again'))

    const recommended = useDiningHistoryStore.getState().recommended
    expect(recommended.map((item) => item.restaurant.id)).toEqual(['a', 'b'])
    expect(recommended[0].restaurant.name).toBe('A again')
  })

  it('stores eaten records separately and keeps a bounded list', () => {
    for (let i = 0; i < 35; i += 1) {
      useDiningHistoryStore.getState().addEaten(restaurant(`r-${i}`))
    }

    const eaten = useDiningHistoryStore.getState().eaten
    expect(eaten).toHaveLength(30)
    expect(eaten[0].restaurant.id).toBe('r-34')
    expect(eaten.at(-1)?.restaurant.id).toBe('r-5')
  })

  it('reports recent ids from both recommendation and eaten history', () => {
    useDiningHistoryStore.getState().addRecommendation(restaurant('recommended'))
    useDiningHistoryStore.getState().addEaten(restaurant('eaten'))

    expect(useDiningHistoryStore.getState().getRecentRestaurantIds()).toEqual(
      new Set(['recommended', 'eaten'])
    )
  })
})
