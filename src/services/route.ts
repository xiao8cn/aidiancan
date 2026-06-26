import type { GeoLocation, Restaurant, SurfaceKind } from '../types'

const WALKING_ROUTE_URL = 'https://restapi.amap.com/v3/direction/walking'
const ROUTE_CACHE_TTL_MS = 30 * 60 * 1000

interface WalkingStep {
  instruction?: string
  road?: string
  action?: string
  assistant_action?: string
}

interface WalkingRouteResponse {
  status: string
  info: string
  route?: {
    paths?: Array<{
      steps?: WalkingStep[]
    }>
  }
}

const routeCache = new Map<string, { timestamp: number; value: SurfaceKind }>()

function hasAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word))
}

export function classifySurfaceKind(instructions: string[], destinationText = ''): SurfaceKind {
  const text = `${instructions.join(' ')} ${destinationText}`.toLowerCase()
  const routeText = instructions.join(' ').toLowerCase()
  if (!text.trim()) return 'unknown'

  if (
    hasAny(text, [
      '地下通道',
      '地铁通道',
      '地下街',
      '地下商业街',
      '负一层',
      '负1层',
      'b1',
      'b2',
      '地下',
    ])
  ) {
    return 'underground'
  }

  if (hasAny(text, ['商场', '广场', '购物中心', 'mall', '扶梯', '电梯', '楼', '层', '室内'])) {
    return 'indoor'
  }

  if (hasAny(routeText, ['沿', '道路', '路', '街', '大道', '步行', '右转', '左转', '人行道'])) {
    return 'outdoor'
  }

  return 'unknown'
}

function getRouteCacheKey(origin: GeoLocation, destination: GeoLocation): string {
  return [
    origin.lat.toFixed(5),
    origin.lng.toFixed(5),
    destination.lat.toFixed(5),
    destination.lng.toFixed(5),
  ].join(',')
}

export async function enrichSurfaceKinds(
  key: string,
  origin: GeoLocation,
  restaurants: Restaurant[],
  limit = 8
): Promise<Restaurant[]> {
  if (!key || restaurants.length === 0) return restaurants

  const enriched = [...restaurants]
  const targets = enriched.slice(0, limit)

  await Promise.all(
    targets.map(async (restaurant, index) => {
      const cacheKey = getRouteCacheKey(origin, restaurant.location)
      const cached = routeCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < ROUTE_CACHE_TTL_MS) {
        enriched[index] = { ...restaurant, surfaceKind: cached.value }
        return
      }

      const params = new URLSearchParams({
        key,
        origin: `${origin.lng},${origin.lat}`,
        destination: `${restaurant.location.lng},${restaurant.location.lat}`,
      })

      try {
        const response = await fetch(`${WALKING_ROUTE_URL}?${params.toString()}`)
        if (!response.ok) return
        const data: WalkingRouteResponse = await response.json()
        if (data.status !== '1') return

        const steps = data.route?.paths?.[0]?.steps ?? []
        const instructions = steps.flatMap((step) =>
          [step.instruction, step.road, step.action, step.assistant_action].filter(
            (value): value is string => Boolean(value)
          )
        )
        const surfaceKind = classifySurfaceKind(instructions, restaurant.address)
        routeCache.set(cacheKey, { timestamp: Date.now(), value: surfaceKind })
        enriched[index] = { ...restaurant, surfaceKind }
      } catch {
        // Route enrichment is best effort; POI search remains usable if it fails.
      }
    })
  )

  return enriched
}

export function clearRouteCache(): void {
  routeCache.clear()
}
