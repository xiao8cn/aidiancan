import { describe, it, expect } from 'vitest'
import { filterRestaurants, PRICE_SLIDER_MAX } from '../filter'
import type { Restaurant, FilterState } from '../../types'

describe('filterRestaurants', () => {
  const base: Restaurant = {
    id: '1',
    name: 'Test',
    address: 'Addr',
    location: { lat: 0, lng: 0 },
    category: 'quick',
    surfaceKind: 'unknown',
    distance: 500,
  }

  function makeFilter(overrides: Partial<FilterState> = {}): FilterState {
    return {
      radius: 1000,
      minPrice: 0,
      maxPrice: PRICE_SLIDER_MAX,
      category: 'all',
      minRating: 0,
      maxRating: 5,
      surfaceMode: 'any',
      ...overrides,
    }
  }

  it('filters by distance', () => {
    const filter = makeFilter({ radius: 400 })
    expect(filterRestaurants([{ ...base, distance: 500 }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base, distance: 300 }], filter)).toHaveLength(1)
  })

  it('filters by price range', () => {
    const filter = makeFilter({ minPrice: 30, maxPrice: 80 })
    expect(filterRestaurants([{ ...base, cost: 20 }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base, cost: 30 }], filter)).toHaveLength(1)
    expect(filterRestaurants([{ ...base, cost: 80 }], filter)).toHaveLength(1)
    expect(filterRestaurants([{ ...base, cost: 100 }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base }], filter)).toHaveLength(0)
  })

  it('includes missing cost when price range is fully open', () => {
    const filter = makeFilter()
    expect(filterRestaurants([{ ...base }], filter)).toHaveLength(1)
  })

  it('includes costs above slider max when upper bound is open', () => {
    const filter = makeFilter({ minPrice: 100 })
    expect(filterRestaurants([{ ...base, cost: 250 }], filter)).toHaveLength(1)
  })

  it('passes through when distance is undefined', () => {
    const filter = makeFilter({ radius: 400 })
    expect(filterRestaurants([{ ...base, distance: undefined }], filter)).toHaveLength(1)
  })

  it('excludes restaurant beyond radius even when price range is open', () => {
    const filter = makeFilter({ radius: 400 })
    expect(filterRestaurants([{ ...base, distance: 500 }], filter)).toHaveLength(0)
  })

  it('excludes undefined cost when a price range is set', () => {
    const filter = makeFilter({ maxPrice: 60 })
    expect(filterRestaurants([{ ...base, cost: undefined }], filter)).toHaveLength(0)
  })

  it('filters by rating range', () => {
    const filter = makeFilter({ minRating: 3, maxRating: 4.5 })
    expect(filterRestaurants([{ ...base, rating: 2.5 }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base, rating: 3 }], filter)).toHaveLength(1)
    expect(filterRestaurants([{ ...base, rating: 4.5 }], filter)).toHaveLength(1)
    expect(filterRestaurants([{ ...base, rating: 5 }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base }], filter)).toHaveLength(0)
  })

  it('filters by normalized category', () => {
    const filter = makeFilter({ category: 'rice' })
    expect(filterRestaurants([{ ...base, category: 'quick' }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base, category: 'rice' }], filter)).toHaveLength(1)
  })

  it('filters by route surface mode', () => {
    const filter = makeFilter({ surfaceMode: 'outdoor' })
    expect(filterRestaurants([{ ...base, surfaceKind: 'unknown' }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base, surfaceKind: 'outdoor' }], filter)).toHaveLength(1)
  })
})
