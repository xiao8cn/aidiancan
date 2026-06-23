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

export type FoodCategory = 'all' | 'rice' | 'noodles' | 'burger' | 'light'

export interface FilterState {
  radius: number
  minPrice: number
  maxPrice: number
  category: FoodCategory
  minRating: number
  maxRating: number
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
}
