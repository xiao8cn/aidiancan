import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearIndexedDbCache, setCachedRouteSurface } from '../indexedDbCache'
import { clearRouteCache, enrichSurfaceKinds } from '../route'
import type { Restaurant } from '../../types'

function restaurant(id: string): Restaurant {
  return {
    id,
    name: id,
    address: `${id}地址`,
    location: { lat: 23.1301, lng: 113.2654 },
    category: 'quick',
    surfaceKind: 'unknown',
  }
}

describe('enrichSurfaceKinds route cache', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    clearRouteCache()
    await clearIndexedDbCache()
  })

  it('uses IndexedDB route surface cache before calling route API', async () => {
    const origin = { lat: 23.1291, lng: 113.2644 }
    await setCachedRouteSurface({
      origin,
      destination: { lat: 23.1301, lng: 113.2654 },
      surfaceKind: 'underground',
    })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const restaurants = await enrichSurfaceKinds('key', origin, [restaurant('cached')])

    expect(restaurants[0].surfaceKind).toBe('underground')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('writes route API result to IndexedDB route surface cache', async () => {
    const origin = { lat: 23.1291, lng: 113.2644 }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        status: '1',
        info: 'OK',
        route: {
          paths: [
            {
              steps: [{ instruction: '进入地下通道' }],
            },
          ],
        },
      }),
    } as Response)

    const first = await enrichSurfaceKinds('key', origin, [restaurant('fresh')])
    vi.restoreAllMocks()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const second = await enrichSurfaceKinds('key', origin, [restaurant('fresh')])

    expect(first[0].surfaceKind).toBe('underground')
    expect(second[0].surfaceKind).toBe('underground')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
