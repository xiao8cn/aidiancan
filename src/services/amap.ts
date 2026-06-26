import type {
  FoodCategory,
  GeoLocation,
  Restaurant,
  RestaurantCacheState,
  SavedLocation,
} from '../types'
import { getCachedPoiSearch, setCachedPoiSearch } from './indexedDbCache'
import { normalizePois } from './poi'
import { enrichSurfaceKinds } from './route'

const PLACE_AROUND_URL = 'https://restapi.amap.com/v3/place/around'
const PLACE_TEXT_URL = 'https://restapi.amap.com/v3/place/text'
const GEOCODE_REGEO_URL = 'https://restapi.amap.com/v3/geocode/regeo'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const CATEGORY_KEYWORDS: Record<FoodCategory, string | undefined> = {
  all: undefined,
  rice: '烧腊饭|煲仔饭|快餐饭|盖浇饭',
  noodles: '汤粉|河粉|肠粉|粥|面',
  quick: '茶餐厅|快餐|简餐|便当',
  light: '轻食|沙拉|减脂餐',
}

export interface AmapPoi {
  id: string
  name: string
  address: string
  location: string
  tel?: string
  distance?: string
  type?: string
  typecode?: string
  adname?: string
  business_area?: string
  biz_ext?: {
    rating?: string
    cost?: string
  }
}

interface AmapResponse {
  status: string
  info: string
  pois?: AmapPoi[]
  regeocode?: {
    formatted_address: string
  }
}

const cache = new Map<string, { timestamp: number; data: Restaurant[] }>()

export interface SearchNearbyResult {
  restaurants: Restaurant[]
  cacheState: RestaurantCacheState
  lastUpdatedAt: number
}

function getCacheKey(location: GeoLocation, radius: number, category: FoodCategory): string {
  return `${location.lat.toFixed(4)},${location.lng.toFixed(4)},${radius},${category}`
}

async function fetchWithRetry(url: string, retries = 1): Promise<Response> {
  try {
    const response = await fetch(url)
    if (response.ok) return response
    throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    if (retries > 0) {
      return fetchWithRetry(url, retries - 1)
    }
    throw err
  }
}

export async function searchNearby(
  key: string,
  location: GeoLocation,
  radius: number,
  category: FoodCategory = 'all'
): Promise<Restaurant[]> {
  const result = await searchNearbyWithMeta(key, location, radius, category)
  return result.restaurants
}

export async function searchNearbyWithMeta(
  key: string,
  location: GeoLocation,
  radius: number,
  category: FoodCategory = 'all'
): Promise<SearchNearbyResult> {
  const cacheKey = getCacheKey(location, radius, category)
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { restaurants: cached.data, cacheState: 'fresh-cache', lastUpdatedAt: cached.timestamp }
  }

  const indexedDbCache = await getCachedPoiSearch({ location, radius, category })
  if (indexedDbCache.state === 'fresh' && indexedDbCache.data) {
    cache.set(cacheKey, { timestamp: Date.now(), data: indexedDbCache.data.restaurants })
    return {
      restaurants: indexedDbCache.data.restaurants,
      cacheState: 'fresh-cache',
      lastUpdatedAt: indexedDbCache.data.createdAt,
    }
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

  const keywords = CATEGORY_KEYWORDS[category]
  if (keywords) {
    params.set('keywords', keywords)
  }

  try {
    const pages = await Promise.all([1, 2].map(async (page) => {
      params.set('page', String(page))
      const response = await fetchWithRetry(`${PLACE_AROUND_URL}?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Amap API request failed: ${response.status}`)
      }

      const data: AmapResponse = await response.json()
      if (data.status !== '1') {
        throw new Error(`Amap API error: ${data.info}`)
      }
      return data.pois ?? []
    }))

    const restaurants = await enrichSurfaceKinds(key, location, normalizePois(pages.flat()))
    cache.set(cacheKey, { timestamp: Date.now(), data: restaurants })
    await setCachedPoiSearch({ location, radius, category, restaurants })
    return { restaurants, cacheState: 'network', lastUpdatedAt: Date.now() }
  } catch (err) {
    if (indexedDbCache.state === 'stale' && indexedDbCache.data) {
      cache.set(cacheKey, { timestamp: Date.now(), data: indexedDbCache.data.restaurants })
      return {
        restaurants: indexedDbCache.data.restaurants,
        cacheState: 'stale-cache',
        lastUpdatedAt: indexedDbCache.data.createdAt,
      }
    }
    throw err
  }
}

export async function searchPlace(key: string, keywords: string): Promise<SavedLocation[]> {
  if (!keywords.trim()) return []

  const params = new URLSearchParams({
    key,
    keywords: keywords.trim(),
    offset: '10',
    page: '1',
    extensions: 'base',
  })

  const response = await fetchWithRetry(`${PLACE_TEXT_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Amap API request failed: ${response.status}`)
  }

  const data: AmapResponse = await response.json()
  if (data.status !== '1') {
    throw new Error(`Amap API error: ${data.info}`)
  }

  return (data.pois ?? [])
    .filter((poi) => poi.location)
    .map((poi) => {
      const [lng, lat] = poi.location.split(',').map(Number)
      return {
        id: poi.id,
        name: poi.name,
        address: poi.address || poi.name,
        location: { lat, lng },
      }
    })
}

export async function reverseGeocode(key: string, location: GeoLocation): Promise<string> {
  const params = new URLSearchParams({
    key,
    location: `${location.lng},${location.lat}`,
    extensions: 'base',
  })

  const response = await fetchWithRetry(`${GEOCODE_REGEO_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Amap API request failed: ${response.status}`)
  }

  const data: AmapResponse = await response.json()
  if (data.status !== '1') {
    throw new Error(`Amap API error: ${data.info}`)
  }

  return data.regeocode?.formatted_address || ''
}

export function clearAmapCache(): void {
  cache.clear()
}
