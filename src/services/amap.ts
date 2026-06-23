import type { FoodCategory, GeoLocation, Restaurant, SavedLocation } from '../types'

const PLACE_AROUND_URL = 'https://restapi.amap.com/v3/place/around'
const PLACE_TEXT_URL = 'https://restapi.amap.com/v3/place/text'
const GEOCODE_REGEO_URL = 'https://restapi.amap.com/v3/geocode/regeo'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const CATEGORY_KEYWORDS: Record<FoodCategory, string | undefined> = {
  all: undefined,
  rice: '米饭|盖浇饭|煲仔饭|中式快餐',
  noodles: '面|粉|拉面|牛肉面',
  burger: '汉堡|披萨|三明治',
  light: '轻食|沙拉|减脂餐',
}

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
  regeocode?: {
    formatted_address: string
  }
}

const cache = new Map<string, { timestamp: number; data: Restaurant[] }>()

function getCacheKey(location: GeoLocation, radius: number, category: FoodCategory): string {
  return `${location.lat.toFixed(4)},${location.lng.toFixed(4)},${radius},${category}`
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
    rating: poi.biz_ext?.rating ? Number(poi.biz_ext?.rating) : undefined,
    cost: poi.biz_ext?.cost ? Number(poi.biz_ext?.cost) : undefined,
  }
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
  const cacheKey = getCacheKey(location, radius, category)
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

  const keywords = CATEGORY_KEYWORDS[category]
  if (keywords) {
    params.set('keywords', keywords)
  }

  const response = await fetchWithRetry(`${PLACE_AROUND_URL}?${params.toString()}`)
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

export async function searchPlace(key: string, keywords: string): Promise<SavedLocation[]> {
  if (!keywords.trim()) return []

  const params = new URLSearchParams({
    key,
    keywords: keywords.trim(),
    types: '050000',
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
