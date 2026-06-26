import type {
  CachedPoiSearch,
  CachedRouteSurface,
  CacheReadResult,
  FoodCategory,
  GeoLocation,
  Restaurant,
  SurfaceKind,
} from '../types'

const DB_NAME = 'aidiancan-cache'
const DB_VERSION = 1
const POI_STORE = 'poiSearches'
const ROUTE_STORE = 'routeSurfaces'
const POI_FRESH_TTL_MS = 6 * 60 * 60 * 1000
const POI_STALE_TTL_MS = 24 * 60 * 60 * 1000
const ROUTE_TTL_MS = 24 * 60 * 60 * 1000

function grid(value: number): string {
  return value.toFixed(3)
}

export function getPoiSearchCacheKey(
  location: GeoLocation,
  radius: number,
  category: FoodCategory
): string {
  return `poi:${grid(location.lat)}:${grid(location.lng)}:${radius}:${category}`
}

export function getRouteSurfaceCacheKey(origin: GeoLocation, destination: GeoLocation): string {
  return `route:${grid(origin.lat)}:${grid(origin.lng)}:${grid(destination.lat)}:${grid(destination.lng)}`
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openCacheDb(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) return Promise.resolve(null)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(POI_STORE)) {
        db.createObjectStore(POI_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(ROUTE_STORE)) {
        db.createObjectStore(ROUTE_STORE, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  const db = await openCacheDb()
  if (!db) return undefined

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = run(store)

    if (request) {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    }

    transaction.oncomplete = () => {
      if (!request) resolve(undefined)
      db.close()
    }
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

function readState<T extends { expiresAt: number; staleAt?: number }>(
  entry: T | undefined,
  now: number
): CacheReadResult<T> {
  if (!entry || now >= entry.expiresAt) return { data: null, state: 'miss' }
  if (entry.staleAt !== undefined && now >= entry.staleAt) return { data: entry, state: 'stale' }
  return { data: entry, state: 'fresh' }
}

export async function getCachedPoiSearch({
  location,
  radius,
  category,
  now = Date.now(),
}: {
  location: GeoLocation
  radius: number
  category: FoodCategory
  now?: number
}): Promise<CacheReadResult<CachedPoiSearch>> {
  const id = getPoiSearchCacheKey(location, radius, category)
  const entry = await withStore<CachedPoiSearch>(POI_STORE, 'readonly', (store) => store.get(id))
  return readState(entry, now)
}

export async function setCachedPoiSearch({
  location,
  radius,
  category,
  restaurants,
  now = Date.now(),
}: {
  location: GeoLocation
  radius: number
  category: FoodCategory
  restaurants: Restaurant[]
  now?: number
}): Promise<void> {
  const cacheKey = getPoiSearchCacheKey(location, radius, category)
  const entry: CachedPoiSearch = {
    id: cacheKey,
    cacheKey,
    restaurants,
    createdAt: now,
    staleAt: now + POI_FRESH_TTL_MS,
    expiresAt: now + POI_STALE_TTL_MS,
    location,
    radius,
    category,
  }
  await withStore(POI_STORE, 'readwrite', (store) => store.put(entry))
}

export async function getCachedRouteSurface({
  origin,
  destination,
  now = Date.now(),
}: {
  origin: GeoLocation
  destination: GeoLocation
  now?: number
}): Promise<CacheReadResult<CachedRouteSurface>> {
  const id = getRouteSurfaceCacheKey(origin, destination)
  const entry = await withStore<CachedRouteSurface>(ROUTE_STORE, 'readonly', (store) => store.get(id))
  return readState(entry, now)
}

export async function setCachedRouteSurface({
  origin,
  destination,
  surfaceKind,
  now = Date.now(),
}: {
  origin: GeoLocation
  destination: GeoLocation
  surfaceKind: SurfaceKind
  now?: number
}): Promise<void> {
  const cacheKey = getRouteSurfaceCacheKey(origin, destination)
  const entry: CachedRouteSurface = {
    id: cacheKey,
    cacheKey,
    surfaceKind,
    createdAt: now,
    expiresAt: now + ROUTE_TTL_MS,
  }
  await withStore(ROUTE_STORE, 'readwrite', (store) => store.put(entry))
}

export async function clearPoiSearchCache(): Promise<void> {
  await withStore(POI_STORE, 'readwrite', (store) => store.clear())
}

export async function clearRouteSurfaceCache(): Promise<void> {
  await withStore(ROUTE_STORE, 'readwrite', (store) => store.clear())
}

export async function clearIndexedDbCache(): Promise<void> {
  await Promise.all([clearPoiSearchCache(), clearRouteSurfaceCache()])
}
