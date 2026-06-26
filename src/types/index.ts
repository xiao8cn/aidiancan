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

export interface RestaurantState {
  items: Restaurant[]
  selected: Restaurant | null
  status: AsyncStatus
  error: string | null
}
