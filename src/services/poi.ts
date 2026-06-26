import type { FoodCategory, Restaurant, SurfaceKind } from '../types'
import type { AmapPoi } from './amap'
import { classifySurfaceKind } from './route'

const EXCLUDED_WORDS = [
  '奶茶',
  '茶饮',
  '饮品',
  '冷饮',
  '咖啡',
  '星巴克',
  '瑞幸',
  '酒吧',
  '甜品',
  '糖水',
  '蛋糕',
  '面包',
  '酒店',
  '宾馆',
  '住宿',
  'ktv',
  '网吧',
  '棋牌',
  '娱乐城',
  '便利店',
]

const EXCLUDED_TYPES = ['住宿服务', '娱乐场所', '咖啡厅', '冷饮店', '糕饼店', '酒吧']

function includesAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase()
  return words.some((word) => lower.includes(word.toLowerCase()))
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function classifyRestaurantCategory(name: string, type = ''): FoodCategory {
  const text = `${name} ${type}`.toLowerCase()

  if (includesAny(text, ['轻食', '沙拉', '减脂', '低卡', '健康餐'])) return 'light'
  if (includesAny(text, ['粉', '面', '拉面', '汤粉', '河粉', '肠粉', '粥'])) return 'noodles'
  if (includesAny(text, ['饭', '烧腊', '煲仔', '盖浇', '快餐饭', '木桶饭'])) return 'rice'
  if (includesAny(text, ['茶餐厅', '快餐', '简餐', '汉堡', '披萨', '三明治', '便当'])) return 'quick'

  return 'quick'
}

export function shouldKeepPoi(poi: AmapPoi): boolean {
  if (!poi.location) return false
  const text = `${poi.name} ${poi.address ?? ''} ${poi.type ?? ''}`
  if (includesAny(text, EXCLUDED_WORDS)) return false
  if (includesAny(poi.type ?? '', EXCLUDED_TYPES)) return false
  return true
}

export function normalizePoi(poi: AmapPoi): Restaurant {
  const [lng, lat] = poi.location.split(',').map(Number)
  const type = poi.type
  const surfaceKind: SurfaceKind = classifySurfaceKind([], `${poi.name} ${poi.address ?? ''}`)

  return {
    id: poi.id,
    name: poi.name,
    address: poi.address || poi.name,
    location: { lat, lng },
    tel: poi.tel,
    distance: parseNumber(poi.distance),
    rating: parseNumber(poi.biz_ext?.rating),
    cost: parseNumber(poi.biz_ext?.cost),
    category: classifyRestaurantCategory(poi.name, type),
    surfaceKind,
    type,
    typecode: poi.typecode,
    adname: poi.adname,
    businessArea: poi.business_area,
    raw: {
      type,
      typecode: poi.typecode,
      address: poi.address,
    },
  }
}

export function normalizePois(pois: AmapPoi[]): Restaurant[] {
  const seen = new Set<string>()
  const restaurants: Restaurant[] = []

  for (const poi of pois) {
    if (!shouldKeepPoi(poi)) continue
    const normalized = normalizePoi(poi)
    const key = `${normalized.name.trim()}::${normalized.address.trim()}`
    if (seen.has(key)) continue
    seen.add(key)
    restaurants.push(normalized)
  }

  return restaurants
}
