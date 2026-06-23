import { Selector, Slider, Space, Input } from 'antd-mobile'
import {
  useFilterStore,
  PRICE_SLIDER_MIN,
  PRICE_SLIDER_MAX,
  PRICE_SLIDER_STEP,
} from '../stores/filterStore'
import type { FoodCategory } from '../types'

const DISTANCE_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
  { label: '5km', value: 5000 },
]

const CATEGORY_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '米', value: 'rice' },
  { label: '面', value: 'noodles' },
  { label: '汉堡', value: 'burger' },
  { label: '轻食', value: 'light' },
]

function formatPriceLabel(value: number): string {
  return value >= PRICE_SLIDER_MAX ? `${PRICE_SLIDER_MAX}+` : `${value}`
}

function clampRating(value: number): number {
  return Math.min(5, Math.max(0, value))
}

export function FilterBar() {
  const {
    radius,
    minPrice,
    maxPrice,
    category,
    minRating,
    maxRating,
    setRadius,
    setPriceRange,
    setCategory,
    setMinRating,
    setMaxRating,
  } = useFilterStore()

  const handleMinRatingChange = (value: string) => {
    const num = Number(value)
    if (Number.isNaN(num)) return
    const clamped = clampRating(num)
    setMinRating(Math.min(clamped, maxRating))
  }

  const handleMaxRatingChange = (value: string) => {
    const num = Number(value)
    if (Number.isNaN(num)) return
    const clamped = clampRating(num)
    setMaxRating(Math.max(clamped, minRating))
  }

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
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>主食</div>
        <Selector
          options={CATEGORY_OPTIONS}
          value={[category]}
          onChange={(v) => setCategory(v[0] as FoodCategory)}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>价格区间</div>
        <div style={{ padding: '0 8px' }}>
          <Slider
            range
            min={PRICE_SLIDER_MIN}
            max={PRICE_SLIDER_MAX}
            step={PRICE_SLIDER_STEP}
            value={[minPrice, maxPrice]}
            onChange={(v) => {
              if (Array.isArray(v)) {
                setPriceRange(v as [number, number])
              }
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: '#333', textAlign: 'center' }}>
          ¥{formatPriceLabel(minPrice)} - ¥{formatPriceLabel(maxPrice)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>评分</div>
        <Space align="center">
          <Input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={String(minRating)}
            onChange={handleMinRatingChange}
            style={{ width: 70 }}
          />
          <span style={{ color: '#666' }}>-</span>
          <Input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={String(maxRating)}
            onChange={handleMaxRatingChange}
            style={{ width: 70 }}
          />
        </Space>
      </div>
    </Space>
  )
}
