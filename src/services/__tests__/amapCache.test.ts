import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAmapCache, searchNearby } from '../amap'
import { clearIndexedDbCache, setCachedPoiSearch } from '../indexedDbCache'

describe('searchNearby cache fallback', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    clearAmapCache()
    await clearIndexedDbCache()
  })

  it('returns fresh IndexedDB cache before hitting network', async () => {
    await setCachedPoiSearch({
      location: { lat: 23.1291, lng: 113.2644 },
      radius: 1000,
      category: 'quick',
      restaurants: [
        {
          id: 'cached',
          name: '缓存餐厅',
          address: '缓存地址',
          location: { lat: 23.1291, lng: 113.2644 },
          category: 'quick',
          surfaceKind: 'unknown',
        },
      ],
      now: Date.now(),
    })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const restaurants = await searchNearby('key', { lat: 23.1291, lng: 113.2644 }, 1000, 'quick')

    expect(restaurants.map((restaurant) => restaurant.id)).toEqual(['cached'])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('falls back to stale IndexedDB cache when network fails', async () => {
    await setCachedPoiSearch({
      location: { lat: 23.1291, lng: 113.2644 },
      radius: 1000,
      category: 'quick',
      restaurants: [
        {
          id: 'stale',
          name: '过期缓存餐厅',
          address: '缓存地址',
          location: { lat: 23.1291, lng: 113.2644 },
          category: 'quick',
          surfaceKind: 'unknown',
        },
      ],
      now: Date.now() - 7 * 60 * 60 * 1000,
    })
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))

    const restaurants = await searchNearby('key', { lat: 23.1291, lng: 113.2644 }, 1000, 'quick')

    expect(restaurants.map((restaurant) => restaurant.id)).toEqual(['stale'])
  })
})
