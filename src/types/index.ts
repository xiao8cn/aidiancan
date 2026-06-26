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

export type FoodCategory = 'all' | 'rice' | 'noodles' | 'quick' | 'light'
export type SurfaceKind = 'outdoor' | 'underground' | 'indoor' | 'unknown'
export type SurfaceMode = 'any' | 'outdoor' | 'underground' | 'indoor'

export interface FilterState {
  radius: number
  minPrice: number
  maxPrice: number
  category: FoodCategory
  minRating: number
  maxRating: number
  surfaceMode: SurfaceMode
}

export interface Restaurant {
  id: string
  name: string
  address: string
  location: GeoLocation
  category: FoodCategory
  surfaceKind: SurfaceKind
  tel?: string
  distance?: number
  rating?: number
  cost?: number
  type?: string
  typecode?: string
  adname?: string
  businessArea?: string
  raw?: {
    type?: string
    typecode?: string
    address?: string
  }
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface DiningHistoryEntry {
  id: string
  restaurant: Restaurant
  timestamp: number
}

export type CacheReadState = 'fresh' | 'stale' | 'miss'
export type RestaurantCacheState = 'network' | 'fresh-cache' | 'stale-cache'

export interface CacheReadResult<T> {
  data: T | null
  state: CacheReadState
}

export interface CachedPoiSearch {
  id: string
  cacheKey: string
  restaurants: Restaurant[]
  createdAt: number
  expiresAt: number
  staleAt: number
  location: GeoLocation
  radius: number
  category: FoodCategory
}

export interface CachedRouteSurface {
  id: string
  cacheKey: string
  surfaceKind: SurfaceKind
  createdAt: number
  expiresAt: number
}

export interface RestaurantState {
  items: Restaurant[]
  selected: Restaurant | null
  status: AsyncStatus
  error: string | null
  cacheState?: RestaurantCacheState
  lastUpdatedAt?: number
}
