import { describe, it, expect } from 'vitest'
import { pickRandom } from '../random'

describe('pickRandom', () => {
  it('returns an item from the array', () => {
    const items = ['a', 'b', 'c']
    expect(items).toContain(pickRandom(items))
  })

  it('returns null for empty array', () => {
    expect(pickRandom([])).toBeNull()
  })

  it('returns the only item for single-item array', () => {
    expect(pickRandom(['only'])).toBe('only')
  })
})
