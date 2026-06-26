import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearIndexedDbCache,
  getCachedPoiSearch,
  getCachedRouteSurface,
  getPoiSearchCacheKey,
  getRouteSurfaceCacheKey,
  setCachedPoiSearch,
  setCachedRouteSurface,
} from '../indexedDbCache'
import type { Restaurant } from '../../types'

function restaurant(id: string): Restaurant {
  return {
    id,
    name: id,
    address: `${id}地址`,
    location: { lat: 23.1291, lng: 113.2644 },
    category: 'quick',
    surfaceKind: 'unknown',
  }
}

describe('indexedDbCache', () => {
  beforeEach(async () => {
    await clearIndexedDbCache()
  })

  it('builds stable cache keys without storing API keys or request URLs', () => {
    expect(
      getPoiSearchCacheKey({ lat: 23.129123, lng: 113.264456 }, 1000, 'quick')
    ).toBe('poi:23.129:113.264:1000:quick')
    expect(
      getRouteSurfaceCacheKey(
        { lat: 23.129123, lng: 113.264456 },
        { lat: 23.130987, lng: 113.265111 }
      )
    ).toBe('route:23.129:113.264:23.131:113.265')
  })

  it('stores and reads fresh POI searches', async () => {
    await setCachedPoiSearch({
      location: { lat: 23.1291, lng: 113.2644 },
      radius: 1000,
      category: 'quick',
      restaurants: [restaurant('cached')],
      now: 1000,
    })

    const result = await getCachedPoiSearch({
      location: { lat: 23.1291, lng: 113.2644 },
      radius: 1000,
      category: 'quick',
      now: 1000 + 60_000,
    })

    expect(result.state).toBe('fresh')
    expect(result.data?.restaurants.map((item) => item.id)).toEqual(['cached'])
  })

  it('returns stale and miss states based on timestamps', async () => {
    await setCachedPoiSearch({
      location: { lat: 23.1291, lng: 113.2644 },
      radius: 1000,
      category: 'quick',
      restaurants: [restaurant('stale')],
      now: 1000,
    })

    const stale = await getCachedPoiSearch({
      location: { lat: 23.1291, lng: 113.2644 },
      radius: 1000,
      category: 'quick',
      now: 1000 + 7 * 60 * 60 * 1000,
    })
    const miss = await getCachedPoiSearch({
      location: { lat: 23.1291, lng: 113.2644 },
      radius: 1000,
      category: 'quick',
      now: 1000 + 25 * 60 * 60 * 1000,
    })

    expect(stale.state).toBe('stale')
    expect(stale.data?.restaurants[0].id).toBe('stale')
    expect(miss.state).toBe('miss')
    expect(miss.data).toBeNull()
  })

  it('stores and clears route surface cache', async () => {
    const origin = { lat: 23.1291, lng: 113.2644 }
    const destination = { lat: 23.1301, lng: 113.2654 }
    await setCachedRouteSurface({ origin, destination, surfaceKind: 'underground', now: 1000 })

    expect((await getCachedRouteSurface({ origin, destination, now: 2000 })).data?.surfaceKind).toBe(
      'underground'
    )

    await clearIndexedDbCache()
    expect((await getCachedRouteSurface({ origin, destination, now: 2000 })).state).toBe('miss')
  })
})
