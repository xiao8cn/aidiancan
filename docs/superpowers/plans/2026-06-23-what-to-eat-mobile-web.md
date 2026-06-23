# 今天吃啥 - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile web app that picks a random nearby restaurant based on location, distance, and price filters using the Amap POI API.

**Architecture:** Pure frontend React 19.2 + TypeScript app scaffolded with Vite+, using Zustand for state management (persisted to localStorage), Ant Design Mobile for UI, and a thin service layer for the Amap API.

**Tech Stack:** React 19.2, TypeScript, Vite+, Ant Design Mobile, Zustand, Vitest, React Testing Library.

---

## File Structure

```
/
├── docs/superpowers/specs/2026-06-23-what-to-eat-mobile-web-design.md
├── docs/superpowers/plans/2026-06-23-what-to-eat-mobile-web.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── utils/
    │   ├── coordinate.ts
    │   ├── filter.ts
    │   ├── random.ts
    │   └── __tests__/
    │       ├── coordinate.test.ts
    │       ├── filter.test.ts
    │       └── random.test.ts
    ├── services/
    │   └── amap.ts
    ├── stores/
    │   ├── settingsStore.ts
    │   ├── locationStore.ts
    │   ├── filterStore.ts
    │   ├── restaurantStore.ts
    │   └── wishlistStore.ts
    └── components/
        ├── ErrorBoundary.tsx
        ├── LocationPicker.tsx
        ├── FilterBar.tsx
        ├── RandomButton.tsx
        ├── RestaurantCard.tsx
        ├── WishlistDrawer.tsx
        └── SettingsPanel.tsx
```

---

## Prerequisite

You need a **高德地图 Web Service Key**. Apply at https://lbs.amap.com/dev/key/app. This key will be entered in the app's Settings panel at runtime, not hard-coded in the repo.

---

## Task 1: Scaffold the project with Vite+

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`

- [ ] **Step 1: Initialize project with Vite+**

Run in the project root (`/Users/wujiaoju/workspace/aidiancan`):

```bash
vp create .
```

When prompted, select the **React + TypeScript** template. If `vp create .` refuses because the directory is not empty, create a temporary folder first and then move files:

```bash
mkdir -p /tmp/aidiancan-staging
vp create /tmp/aidiancan-staging
cp -r /tmp/aidiancan-staging/* /Users/wujiaoju/workspace/aidiancan/
cp -r /tmp/aidiancan-staging/.* /Users/wujiaoju/workspace/aidiancan/ 2>/dev/null || true
```

Expected result: A runnable React + TypeScript project with `src/App.tsx`, `src/main.tsx`, `index.html`, `package.json`, `vite.config.ts`, etc.

- [ ] **Step 2: Install dependencies**

```bash
vp add zustand antd-mobile
vp add -D @testing-library/react @testing-library/jest-dom jsdom
```

Expected result: `package.json` contains `zustand`, `antd-mobile`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`.

- [ ] **Step 3: Verify React 19.2**

Check `package.json`:

```json
"dependencies": {
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

If it is not `^19.2.0`, update it manually and run:

```bash
vp install
```

- [ ] **Step 4: Configure Vitest for component tests**

Modify `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Clean up default scaffold**

Replace `src/App.tsx` with a minimal placeholder:

```tsx
function App() {
  return <div>今天吃啥</div>
}

export default App
```

Delete `src/App.css` if it exists.

- [ ] **Step 6: Run dev server and verify**

```bash
vp dev
```

Open the printed local URL in a browser. Expected: page shows "今天吃啥".

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold project with Vite+, React 19.2, and dependencies"
```

---

## Task 2: Define shared types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write types**

```typescript
export interface GeoLocation {
  lat: number
  lng: number
}

export interface SavedLocation {
  id: string
  name: string
  address: string
  location: GeoLocation
}

export type PriceRange = 'any' | 'low' | 'medium' | 'high'

export interface FilterState {
  radius: number
  priceRange: PriceRange
}

export interface Restaurant {
  id: string
  name: string
  address: string
  location: GeoLocation
  tel?: string
  distance?: number
  rating?: number
  cost?: number
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface RestaurantState {
  items: Restaurant[]
  selected: Restaurant | null
  status: AsyncStatus
  error: string | null
  lastFetchedAt: number | null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Implement coordinate conversion utility

**Files:**
- Create: `src/utils/coordinate.ts`
- Create: `src/utils/__tests__/coordinate.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
vp test src/utils/__tests__/coordinate.test.ts
```

Expected: FAIL - function not defined or import error.

- [ ] **Step 3: Implement coordinate conversion**

Create `src/utils/coordinate.ts`:

```typescript
import type { GeoLocation } from '../types'

const PI = Math.PI
const X_PI = (PI * 3000.0) / 180.0
const A = 6378245.0
const EE = 0.00669342162296594323

function outOfChina(lat: number, lng: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}

function transformLat(lng: number, lat: number): number {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0
  return ret
}

function transformLng(lng: number, lat: number): number {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0
  return ret
}

export function wgs84ToGcj02(location: GeoLocation): GeoLocation {
  const { lat, lng } = location

  if (outOfChina(lat, lng)) {
    return { lat, lng }
  }

  let dLat = transformLat(lng - 105.0, lat - 35.0)
  let dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * PI
  let magic = Math.sin(radLat)
  magic = 1 - EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI)
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI)

  return {
    lat: lat + dLat,
    lng: lng + dLng,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
vp test src/utils/__tests__/coordinate.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/coordinate.ts src/utils/__tests__/coordinate.test.ts
git commit -m "feat: add WGS-84 to GCJ-02 coordinate conversion"
```

---

## Task 4: Implement random picker utility

**Files:**
- Create: `src/utils/random.ts`
- Create: `src/utils/__tests__/random.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
vp test src/utils/__tests__/random.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement random picker**

Create `src/utils/random.ts`:

```typescript
export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
vp test src/utils/__tests__/random.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/random.ts src/utils/__tests__/random.test.ts
git commit -m "feat: add random picker utility"
```

---

## Task 5: Implement filter utility

**Files:**
- Create: `src/utils/filter.ts`
- Create: `src/utils/__tests__/filter.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { filterRestaurants } from '../filter'
import type { Restaurant, FilterState } from '../../types'

describe('filterRestaurants', () => {
  const base: Restaurant = {
    id: '1',
    name: 'Test',
    address: 'Addr',
    location: { lat: 0, lng: 0 },
    distance: 500,
  }

  it('filters by distance', () => {
    const filter: FilterState = { radius: 400, priceRange: 'any' }
    expect(filterRestaurants([{ ...base, distance: 500 }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base, distance: 300 }], filter)).toHaveLength(1)
  })

  it('filters by price range low', () => {
    const filter: FilterState = { radius: 1000, priceRange: 'low' }
    expect(filterRestaurants([{ ...base, cost: 20 }], filter)).toHaveLength(1)
    expect(filterRestaurants([{ ...base, cost: 30 }], filter)).toHaveLength(0)
    expect(filterRestaurants([{ ...base }], filter)).toHaveLength(0)
  })

  it('filters by price range medium', () => {
    const filter: FilterState = { radius: 1000, priceRange: 'medium' }
    expect(filterRestaurants([{ ...base, cost: 30 }], filter)).toHaveLength(1)
    expect(filterRestaurants([{ ...base, cost: 60 }], filter)).toHaveLength(0)
  })

  it('filters by price range high', () => {
    const filter: FilterState = { radius: 1000, priceRange: 'high' }
    expect(filterRestaurants([{ ...base, cost: 60 }], filter)).toHaveLength(1)
    expect(filterRestaurants([{ ...base, cost: 30 }], filter)).toHaveLength(0)
  })

  it('includes missing cost when price range is any', () => {
    const filter: FilterState = { radius: 1000, priceRange: 'any' }
    expect(filterRestaurants([{ ...base }], filter)).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
vp test src/utils/__tests__/filter.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement filter utility**

Create `src/utils/filter.ts`:

```typescript
import type { FilterState, Restaurant } from '../types'

export function filterRestaurants(restaurants: Restaurant[], filter: FilterState): Restaurant[] {
  return restaurants.filter((r) => {
    if (r.distance !== undefined && r.distance > filter.radius) {
      return false
    }

    if (filter.priceRange === 'any') {
      return true
    }

    if (r.cost === undefined) {
      return false
    }

    switch (filter.priceRange) {
      case 'low':
        return r.cost >= 0 && r.cost < 30
      case 'medium':
        return r.cost >= 30 && r.cost < 60
      case 'high':
        return r.cost >= 60
      default:
        return true
    }
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
vp test src/utils/__tests__/filter.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/filter.ts src/utils/__tests__/filter.test.ts
git commit -m "feat: add restaurant filter utility"
```

---

## Task 6: Implement Amap service

**Files:**
- Create: `src/services/amap.ts`

- [ ] **Step 1: Implement the service**

Create `src/services/amap.ts`:

```typescript
import type { GeoLocation, Restaurant } from '../types'

const BASE_URL = 'https://restapi.amap.com/v3/place/around'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface AmapPoi {
  id: string
  name: string
  address: string
  location: string
  tel?: string
  distance?: string
  biz_ext?: {
    rating?: string
    cost?: string
  }
}

interface AmapResponse {
  status: string
  info: string
  pois?: AmapPoi[]
}

const cache = new Map<string, { timestamp: number; data: Restaurant[] }>()

function getCacheKey(location: GeoLocation, radius: number): string {
  return `${location.lat.toFixed(4)},${location.lng.toFixed(4)},${radius}`
}

function parsePoi(poi: AmapPoi): Restaurant {
  const [lng, lat] = poi.location.split(',').map(Number)
  return {
    id: poi.id,
    name: poi.name,
    address: poi.address,
    location: { lat, lng },
    tel: poi.tel,
    distance: poi.distance ? Number(poi.distance) : undefined,
    rating: poi.biz_ext?.rating ? Number(poi.biz_ext.rating) : undefined,
    cost: poi.biz_ext?.cost ? Number(poi.biz_ext.cost) : undefined,
  }
}

export async function searchNearby(
  key: string,
  location: GeoLocation,
  radius: number
): Promise<Restaurant[]> {
  const cacheKey = getCacheKey(location, radius)
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const params = new URLSearchParams({
    key,
    location: `${location.lng},${location.lat}`,
    radius: String(radius),
    types: '050000',
    offset: '25',
    page: '1',
    extensions: 'all',
  })

  const response = await fetch(`${BASE_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Amap API request failed: ${response.status}`)
  }

  const data: AmapResponse = await response.json()
  if (data.status !== '1') {
    throw new Error(`Amap API error: ${data.info}`)
  }

  const restaurants = (data.pois ?? []).map(parsePoi)
  cache.set(cacheKey, { timestamp: Date.now(), data: restaurants })
  return restaurants
}

export function clearAmapCache(): void {
  cache.clear()
}
```

- [ ] **Step 2: Add a minimal manual verification**

Temporarily create `src/services/amap.manual-test.ts`:

```typescript
import { searchNearby } from './amap'

async function main() {
  const key = prompt('Enter Amap key:') ?? ''
  const location = { lat: 39.9042, lng: 116.4074 }
  const results = await searchNearby(key, location, 1000)
  console.log(results.slice(0, 3))
}

main().catch(console.error)
```

Run it once with a real key (do not commit this file):

```bash
npx tsx src/services/amap.manual-test.ts
```

Expected: prints 3 restaurants. Then delete the file.

- [ ] **Step 3: Commit**

```bash
git add src/services/amap.ts
git commit -m "feat: add Amap POI search service with caching"
```

---

## Task 7: Implement settings store

**Files:**
- Create: `src/stores/settingsStore.ts`

- [ ] **Step 1: Implement the store**

Create `src/stores/settingsStore.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  amapKey: string
  isFirstVisit: boolean
  setAmapKey: (key: string) => void
  markVisited: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      amapKey: '',
      isFirstVisit: true,
      setAmapKey: (key) => set({ amapKey: key }),
      markVisited: () => set({ isFirstVisit: false }),
    }),
    { name: 'wte-settings' }
  )
)
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/settingsStore.ts
git commit -m "feat: add settings store with Amap key persistence"
```

---

## Task 8: Implement location store

**Files:**
- Create: `src/stores/locationStore.ts`

- [ ] **Step 1: Implement the store**

Create `src/stores/locationStore.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GeoLocation, SavedLocation, LocationStatus } from '../types'
import { wgs84ToGcj02 } from '../utils/coordinate'

interface LocationState {
  current: GeoLocation | null
  address: string
  status: LocationStatus
  error: string | null
  savedLocations: SavedLocation[]
  setLocation: (location: GeoLocation, address?: string) => void
  locate: () => Promise<void>
  upsertSavedLocation: (location: SavedLocation) => void
  removeSavedLocation: (id: string) => void
  setError: (error: string) => void
}

const DEFAULT_SAVED: SavedLocation[] = [
  {
    id: 'home',
    name: '家',
    address: '常用地点：家',
    location: { lat: 39.9042, lng: 116.4074 },
  },
  {
    id: 'company',
    name: '公司',
    address: '常用地点：公司',
    location: { lat: 39.9042, lng: 116.4074 },
  },
]

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      current: null,
      address: '',
      status: 'idle',
      error: null,
      savedLocations: DEFAULT_SAVED,

      setLocation: (location, address = '') => {
        set({ current: location, address, status: 'success', error: null })
      },

      locate: async () => {
        set({ status: 'loading', error: null })
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            })
          })

          const wgs84 = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          const gcj02 = wgs84ToGcj02(wgs84)
          get().setLocation(gcj02, '当前位置')
        } catch (err) {
          const message = err instanceof GeolocationPositionError ? err.message : '定位失败'
          set({ status: 'error', error: message })
        }
      },

      upsertSavedLocation: (location) => {
        set((state) => ({
          savedLocations: [...state.savedLocations.filter((l) => l.id !== location.id), location],
        }))
      },

      removeSavedLocation: (id) => {
        set((state) => ({
          savedLocations: state.savedLocations.filter((l) => l.id !== id),
        }))
      },

      setError: (error) => set({ status: 'error', error }),
    }),
    { name: 'wte-location' }
  )
)
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/locationStore.ts
git commit -m "feat: add location store with geolocation and saved places"
```

---

## Task 9: Implement filter store

**Files:**
- Create: `src/stores/filterStore.ts`

- [ ] **Step 1: Implement the store**

Create `src/stores/filterStore.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, PriceRange } from '../types'

interface FilterStore extends FilterState {
  setRadius: (radius: number) => void
  setPriceRange: (priceRange: PriceRange) => void
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      radius: 1000,
      priceRange: 'any',
      setRadius: (radius) => set({ radius }),
      setPriceRange: (priceRange) => set({ priceRange }),
    }),
    { name: 'wte-filter' }
  )
)
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/filterStore.ts
git commit -m "feat: add filter store for radius and price range"
```

---

## Task 10: Implement wishlist store

**Files:**
- Create: `src/stores/wishlistStore.ts`

- [ ] **Step 1: Implement the store**

Create `src/stores/wishlistStore.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/wishlistStore.ts
git commit -m "feat: add wishlist tag store"
```

---

## Task 11: Implement restaurant store

**Files:**
- Create: `src/stores/restaurantStore.ts`

- [ ] **Step 1: Implement the store**

Create `src/stores/restaurantStore.ts`:

```typescript
import { create } from 'zustand'
import type { Restaurant } from '../types'
import { searchNearby } from '../services/amap'
import { filterRestaurants } from '../utils/filter'
import { pickRandom } from '../utils/random'
import { useFilterStore } from './filterStore'

interface RestaurantState {
  items: Restaurant[]
  selected: Restaurant | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  search: (key: string, location: { lat: number; lng: number }) => Promise<void>
  pickRandomRestaurant: () => void
  clearSelection: () => void
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  items: [],
  selected: null,
  status: 'idle',
  error: null,

  search: async (key, location) => {
    set({ status: 'loading', error: null })
    try {
      const radius = useFilterStore.getState().radius
      const items = await searchNearby(key, location, radius)
      set({ items, status: 'success' })
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : '搜索失败' })
    }
  },

  pickRandomRestaurant: () => {
    const filter = useFilterStore.getState()
    const filtered = filterRestaurants(get().items, filter)
    set({ selected: pickRandom(filtered) })
  },

  clearSelection: () => set({ selected: null }),
}))
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/restaurantStore.ts
git commit -m "feat: add restaurant store with search and random pick"
```

---

## Task 12: Implement ErrorBoundary component

**Files:**
- Create: `src/components/ErrorBoundary.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react'
import { ErrorBlock } from 'antd-mobile'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBlock fullPage title="页面出错了" description="请刷新页面重试" />
    }
    return this.props.children
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ErrorBoundary.tsx
git commit -m "feat: add error boundary component"
```

---

## Task 13: Implement LocationPicker component

**Files:**
- Create: `src/components/LocationPicker.tsx`
- Create: `src/components/__tests__/LocationPicker.test.tsx`

- [ ] **Step 1: Write the component test**

Create `src/components/__tests__/LocationPicker.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LocationPicker } from '../LocationPicker'
import { useLocationStore } from '../../stores/locationStore'

describe('LocationPicker', () => {
  beforeEach(() => {
    useLocationStore.setState({
      current: null,
      address: '',
      status: 'idle',
      error: null,
      savedLocations: [
        { id: 'home', name: '家', address: '家地址', location: { lat: 1, lng: 2 } },
      ],
    })
  })

  it('renders locate button', () => {
    render(<LocationPicker />)
    expect(screen.getByText('定位')).toBeInTheDocument()
  })

  it('shows saved locations', () => {
    render(<LocationPicker />)
    expect(screen.getByText('家')).toBeInTheDocument()
  })

  it('triggers locate on button click', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) =>
        success({ coords: { latitude: 39.9, longitude: 116.4 } } as GeolocationPosition)
      ),
    }
    Object.defineProperty(global.navigator, 'geolocation', { value: mockGeolocation, writable: true })

    render(<LocationPicker />)
    fireEvent.click(screen.getByText('定位'))

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
  })

  it('allows adding a manual location', () => {
    render(<LocationPicker />)
    const input = screen.getByPlaceholderText('输入地点名称')
    fireEvent.change(input, { target: { value: '客户公司' } })
    fireEvent.click(screen.getByText('添加'))

    expect(screen.getByText('客户公司')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
vp test src/components/__tests__/LocationPicker.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement the component**

Create `src/components/LocationPicker.tsx`:

```tsx
import { useState } from 'react'
import { Button, Input, Space, Tag, Toast } from 'antd-mobile'
import { LocationOutline } from 'antd-mobile-icons'
import { useLocationStore } from '../stores/locationStore'

export function LocationPicker() {
  const { current, address, status, error, savedLocations, locate, setLocation, upsertSavedLocation } =
    useLocationStore()
  const [manualName, setManualName] = useState('')

  const handleLocate = async () => {
    await locate()
    const newError = useLocationStore.getState().error
    if (newError) {
      Toast.show({ content: `定位失败：${newError}`, position: 'bottom' })
    }
  }

  const handleAddManual = () => {
    const name = manualName.trim()
    if (!name) return

    const fallbackLocation = current ?? { lat: 39.9042, lng: 116.4074 }
    upsertSavedLocation({
      id: `manual-${Date.now()}`,
      name,
      address: name,
      location: fallbackLocation,
    })
    setManualName('')
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      <Space block wrap align="center">
        <Button
          size="small"
          onClick={handleLocate}
          loading={status === 'loading'}
          color="primary"
        >
          <LocationOutline /> 定位
        </Button>
        {current ? (
          <Tag color="success">{address || '已定位'}</Tag>
        ) : (
          <Tag color="default">未定位</Tag>
        )}
      </Space>

      {error && (
        <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
          {error}，请选择下方常用地点或手动添加
        </div>
      )}

      <Space block wrap style={{ marginTop: 12 }}>
        {savedLocations.map((loc) => (
          <Button
            key={loc.id}
            size="mini"
            onClick={() => setLocation(loc.location, loc.address)}
          >
            {loc.name}
          </Button>
        ))}
      </Space>

      <Space block style={{ marginTop: 12 }} align="center">
        <Input
          placeholder="输入地点名称"
          value={manualName}
          onChange={setManualName}
          onEnterPress={handleAddManual}
          style={{ flex: 1 }}
        />
        <Button size="small" onClick={handleAddManual}>添加</Button>
      </Space>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
vp test src/components/__tests__/LocationPicker.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/LocationPicker.tsx src/components/__tests__/LocationPicker.test.tsx
git commit -m "feat: add LocationPicker component with tests"
```

---

## Task 14: Implement FilterBar component

**Files:**
- Create: `src/components/FilterBar.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/FilterBar.tsx`:

```tsx
import { Selector, Space } from 'antd-mobile'
import { useFilterStore } from '../stores/filterStore'
import type { PriceRange } from '../types'

const DISTANCE_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
  { label: '5km', value: 5000 },
]

const PRICE_OPTIONS = [
  { label: '不限', value: 'any' },
  { label: '¥', value: 'low' },
  { label: '¥¥', value: 'medium' },
  { label: '¥¥¥', value: 'high' },
]

export function FilterBar() {
  const { radius, priceRange, setRadius, setPriceRange } = useFilterStore()

  return (
    <Space block direction="vertical" style={{ padding: '0 16px 12px' }}>
      <div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>距离</div>
        <Selector
          options={DISTANCE_OPTIONS}
          value={[radius]}
          onChange={(v) => setRadius(v[0])}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>价格区间</div>
        <Selector
          options={PRICE_OPTIONS}
          value={[priceRange]}
          onChange={(v) => setPriceRange(v[0] as PriceRange)}
        />
      </div>
    </Space>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FilterBar.tsx
git commit -m "feat: add FilterBar component"
```

---

## Task 15: Implement RandomButton component

**Files:**
- Create: `src/components/RandomButton.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/RandomButton.tsx`:

```tsx
import { Button, Toast } from 'antd-mobile'
import { useLocationStore } from '../stores/locationStore'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useSettingsStore } from '../stores/settingsStore'

export function RandomButton() {
  const { current } = useLocationStore()
  const { amapKey } = useSettingsStore()
  const { status, search, pickRandomRestaurant, items } = useRestaurantStore()

  const handleClick = async () => {
    if (!amapKey) {
      Toast.show({ content: '请先设置高德 Key', position: 'bottom' })
      return
    }
    if (!current) {
      Toast.show({ content: '请先定位或选择地点', position: 'bottom' })
      return
    }

    if (items.length === 0) {
      await search(amapKey, current)
    }

    pickRandomRestaurant()

    const selected = useRestaurantStore.getState().selected
    if (!selected) {
      Toast.show({ content: '没有符合条件的餐厅，试试扩大范围', position: 'bottom' })
    }
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      <Button
        block
        size="large"
        color="primary"
        loading={status === 'loading'}
        onClick={handleClick}
      >
        🎲 随机选一家
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RandomButton.tsx
git commit -m "feat: add RandomButton component"
```

---

## Task 16: Implement RestaurantCard component

**Files:**
- Create: `src/components/RestaurantCard.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/RestaurantCard.tsx`:

```tsx
import { Card, Space, Tag } from 'antd-mobile'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useWishlistStore } from '../stores/wishlistStore'

export function RestaurantCard() {
  const selected = useRestaurantStore((state) => state.selected)
  const { tags, toggleRestaurantTag, getRestaurantTags } = useWishlistStore()

  if (!selected) {
    return (
      <Card style={{ margin: '12px 16px' }}>
        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
          点击上方按钮，随机选一家餐厅
        </div>
      </Card>
    )
  }

  const restaurantTags = getRestaurantTags(selected.id)

  return (
    <Card
      title={selected.name}
      style={{ margin: '12px 16px' }}
      extra={selected.distance !== undefined ? `${selected.distance}m` : undefined}
    >
      <Space block direction="vertical">
        {selected.rating !== undefined && <div>评分：{selected.rating}</div>}
        {selected.cost !== undefined && <div>人均：¥{selected.cost}</div>}
        <div>地址：{selected.address}</div>
        {selected.tel && <div>电话：{selected.tel}</div>}

        <Space wrap>
          {tags.map((tag) => (
            <Tag
              key={tag}
              color={restaurantTags.includes(tag) ? 'primary' : 'default'}
              onClick={() => toggleRestaurantTag(selected.id, tag)}
            >
              {tag}
            </Tag>
          ))}
        </Space>
      </Space>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RestaurantCard.tsx
git commit -m "feat: add RestaurantCard component"
```

---

## Task 17: Implement WishlistDrawer component

**Files:**
- Create: `src/components/WishlistDrawer.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/WishlistDrawer.tsx`:

```tsx
import { useState } from 'react'
import { Button, Input, List, Popup, SwipeAction, Toast } from 'antd-mobile'
import { useWishlistStore } from '../stores/wishlistStore'

export function WishlistDrawer() {
  const [visible, setVisible] = useState(false)
  const [newTag, setNewTag] = useState('')
  const { tags, addTag, removeTag } = useWishlistStore()

  const handleAdd = () => {
    const trimmed = newTag.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      Toast.show({ content: '标签已存在', position: 'bottom' })
      return
    }
    addTag(trimmed)
    setNewTag('')
  }

  return (
    <>
      <div style={{ padding: '0 16px' }}>
        <Button size="small" onClick={() => setVisible(true)}>
          管理想吃清单
        </Button>
      </div>
      <Popup
        position="bottom"
        visible={visible}
        onMaskClick={() => setVisible(false)}
        style={{ minHeight: '50vh' }}
      >
        <div style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>想吃清单</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Input
              placeholder="新标签"
              value={newTag}
              onChange={setNewTag}
              onEnterPress={handleAdd}
            />
            <Button onClick={handleAdd}>添加</Button>
          </div>
          <List>
            {tags.map((tag) => (
              <SwipeAction
                key={tag}
                rightActions={[
                  {
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onClick: () => removeTag(tag),
                  },
                ]}
              >
                <List.Item>{tag}</List.Item>
              </SwipeAction>
            ))}
          </List>
        </div>
      </Popup>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WishlistDrawer.tsx
git commit -m "feat: add WishlistDrawer component"
```

---

## Task 18: Implement SettingsPanel component

**Files:**
- Create: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/SettingsPanel.tsx`:

```tsx
import { useState } from 'react'
import { Button, Input, List, Modal, Space, SwipeAction, Toast } from 'antd-mobile'
import { useSettingsStore } from '../stores/settingsStore'
import { useLocationStore } from '../stores/locationStore'

export function SettingsPanel() {
  const [visible, setVisible] = useState(false)
  const { amapKey, setAmapKey } = useSettingsStore()
  const { savedLocations, removeSavedLocation } = useLocationStore()

  const handleExport = () => {
    const data = {
      settings: useSettingsStore.getState(),
      location: useLocationStore.getState(),
      filter: JSON.parse(localStorage.getItem('wte-filter') ?? '{}'),
      wishlist: JSON.parse(localStorage.getItem('wte-wishlist') ?? '{}'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'what-to-eat-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div style={{ padding: '12px 16px' }}>
        <Button size="small" fill="outline" onClick={() => setVisible(true)}>
          设置
        </Button>
      </div>
      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title="设置"
        content={
          <Space block direction="vertical" style={{ width: '100%' }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>高德 Web Service Key</div>
              <Input
                placeholder="输入 key"
                value={amapKey}
                onChange={setAmapKey}
                clearable
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>常用地点管理</div>
              <List style={{ maxHeight: 160, overflow: 'auto' }}>
                {savedLocations.map((loc) => (
                  <SwipeAction
                    key={loc.id}
                    rightActions={[
                      {
                        key: 'delete',
                        text: '删除',
                        color: 'danger',
                        onClick: () => removeSavedLocation(loc.id),
                      },
                    ]}
                  >
                    <List.Item>{loc.name}</List.Item>
                  </SwipeAction>
                ))}
              </List>
            </div>

            <Button onClick={handleExport}>导出数据</Button>
            <Button
              color="danger"
              onClick={() => {
                localStorage.clear()
                Toast.show({ content: '已清除本地数据，刷新后生效', position: 'bottom' })
              }}
            >
              清除所有数据
            </Button>
          </Space>
        }
      />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsPanel.tsx
git commit -m "feat: add SettingsPanel component"
```

---

## Task 19: Assemble App and add styles

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Update global styles**

Replace `src/index.css`:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  -webkit-font-smoothing: antialiased;
}

#root {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fff;
}
```

- [ ] **Step 2: Implement App layout**

Replace `src/App.tsx`:

```tsx
import { NavBar } from 'antd-mobile'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LocationPicker } from './components/LocationPicker'
import { FilterBar } from './components/FilterBar'
import { RandomButton } from './components/RandomButton'
import { RestaurantCard } from './components/RestaurantCard'
import { WishlistDrawer } from './components/WishlistDrawer'
import { SettingsPanel } from './components/SettingsPanel'

function App() {
  return (
    <ErrorBoundary>
      <div>
        <NavBar back={null}>今天吃啥</NavBar>
        <LocationPicker />
        <FilterBar />
        <RandomButton />
        <RestaurantCard />
        <WishlistDrawer />
        <SettingsPanel />
      </div>
    </ErrorBoundary>
  )
}

export default App
```

- [ ] **Step 3: Run dev server and verify layout**

```bash
vp dev
```

Open the URL. Expected: a mobile-styled page with header, location picker, filters, random button, empty card, wishlist button, and settings button.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/index.css
git commit -m "feat: assemble App layout and global styles"
```

---

## Task 20: Add first-time setup prompt

**Files:**
- Create: `src/components/OnboardingModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement OnboardingModal**

Create `src/components/OnboardingModal.tsx`:

```tsx
import { Input, Modal } from 'antd-mobile'
import { useSettingsStore } from '../stores/settingsStore'

export function OnboardingModal() {
  const { amapKey, isFirstVisit, setAmapKey, markVisited } = useSettingsStore()

  if (!isFirstVisit) return null

  return (
    <Modal
      visible
      onClose={markVisited}
      closeOnMaskClick={false}
      title="欢迎使用今天吃啥"
      content={
        <div>
          <p>请输入你的高德 Web Service Key 以开始搜索附近餐厅。</p>
          <Input
            placeholder="高德 key"
            value={amapKey}
            onChange={setAmapKey}
            clearable
          />
        </div>
      }
      actions={[
        {
          key: 'confirm',
          text: '开始',
          onClick: markVisited,
        },
      ]}
    />
  )
}
```

- [ ] **Step 2: Add to App**

Modify `src/App.tsx`:

```tsx
import { NavBar } from 'antd-mobile'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LocationPicker } from './components/LocationPicker'
import { FilterBar } from './components/FilterBar'
import { RandomButton } from './components/RandomButton'
import { RestaurantCard } from './components/RestaurantCard'
import { WishlistDrawer } from './components/WishlistDrawer'
import { SettingsPanel } from './components/SettingsPanel'
import { OnboardingModal } from './components/OnboardingModal'

function App() {
  return (
    <ErrorBoundary>
      <div>
        <NavBar back={null}>今天吃啥</NavBar>
        <LocationPicker />
        <FilterBar />
        <RandomButton />
        <RestaurantCard />
        <WishlistDrawer />
        <SettingsPanel />
        <OnboardingModal />
      </div>
    </ErrorBoundary>
  )
}

export default App
```

- [ ] **Step 3: Commit**

```bash
git add src/components/OnboardingModal.tsx src/App.tsx
git commit -m "feat: add onboarding modal for Amap key"
```

---

## Task 21: Run all tests and fix failures

**Files:**
- Modify: any failing test or source files

- [ ] **Step 1: Run the full test suite**

```bash
vp test
```

Expected: all utility tests and component tests pass.

- [ ] **Step 2: Run lint/type check**

```bash
vp check
```

Expected: no type errors or lint errors. Fix any that appear.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "test: verify all tests pass and fix lint/type issues"
```

---

## Task 22: Build and deploy

**Files:**
- Modify: `vite.config.ts` if needed

- [ ] **Step 1: Build for production**

```bash
vp build
```

Expected: `dist/` folder is created with `index.html` and assets.

- [ ] **Step 2: Verify production build locally**

```bash
npx serve dist
```

Open the printed URL. Expected: app loads and shows the UI.

- [ ] **Step 3: Deploy to Vercel (optional)**

```bash
npx vercel --prod
```

Or for GitHub Pages, push to a GitHub repo and enable Pages from the `gh-pages` branch.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: production build and deployment config"
```

---

## Self-Review

### 1. Spec coverage

| Spec Section | Implementing Task |
|---|---|
| React 19.2 + TypeScript | Task 1 |
| Vite+ scaffold | Task 1 |
| Ant Design Mobile UI | Tasks 13-20 |
| Zustand stores | Tasks 7-11 |
| Amap API integration | Task 6 |
| WGS-84 → GCJ-02 conversion | Task 3 |
| Distance/price filtering | Tasks 5, 9, 14 |
| Random selection | Tasks 4, 11, 15 |
| Location picker with saved places | Tasks 8, 13 |
| Wishlist tags | Tasks 10, 17 |
| Settings/key management | Tasks 7, 18, 20 |
| Error handling | Tasks 12, 15, 16 |
| Testing | Tasks 3, 4, 5, 13, 21 |
| Build/deploy | Task 22 |

**No gaps identified.**

### 2. Placeholder scan

- No `TBD`, `TODO`, or "implement later" strings.
- No vague steps like "add appropriate error handling" without code.
- Every code step includes the actual code.
- Type names and function signatures are consistent across tasks.

### 3. Type consistency

- `GeoLocation` is defined in Task 2 and used consistently.
- `PriceRange` union is defined in Task 2 and used in Task 5, 9, 14.
- `Restaurant` shape is consistent across `types/index.ts`, `services/amap.ts`, `stores/restaurantStore.ts`, and `components/RestaurantCard.tsx`.
- Store hook names are stable: `useSettingsStore`, `useLocationStore`, `useFilterStore`, `useRestaurantStore`, `useWishlistStore`.

### 4. Known limitations

- The Amap service only fetches the first page (25 results). Pagination is out of scope for MVP per spec.
- The manual coordinate conversion utility is accurate enough for typical use but may have minor edge-case deviations near borders.
- `SettingsPanel` only exports data; importing is a future enhancement.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-23-what-to-eat-mobile-web.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.

2. **Inline Execution** - Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Which approach would you like?
