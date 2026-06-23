import { describe, it, expect } from 'vitest'
import { wgs84ToGcj02 } from '../coordinate'

describe('wgs84ToGcj02', () => {
  it('converts coordinates near Beijing', () => {
    const wgs84 = { lat: 39.9042, lng: 116.4074 }
    const gcj = wgs84ToGcj02(wgs84)

    expect(gcj.lat).toBeGreaterThan(wgs84.lat)
    expect(gcj.lng).toBeGreaterThan(wgs84.lng)
  })

  it('returns exact same point when outside China', () => {
    const wgs84 = { lat: 40.7128, lng: -74.006 }
    const gcj = wgs84ToGcj02(wgs84)

    expect(gcj.lat).toBeCloseTo(wgs84.lat, 5)
    expect(gcj.lng).toBeCloseTo(wgs84.lng, 5)
  })
})
