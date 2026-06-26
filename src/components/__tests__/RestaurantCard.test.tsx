import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RestaurantCard } from '../RestaurantCard'
import { useDiningHistoryStore } from '../../stores/diningHistoryStore'
import { useRestaurantStore } from '../../stores/restaurantStore'
import { useFilterStore } from '../../stores/filterStore'
import { useWishlistStore } from '../../stores/wishlistStore'

describe('RestaurantCard', () => {
  beforeEach(() => {
    useRestaurantStore.setState({
      items: [],
      selected: null,
      status: 'idle',
      error: null,
      cacheState: undefined,
      lastUpdatedAt: undefined,
    })
    useDiningHistoryStore.setState({ recommended: [], eaten: [] })
    useFilterStore.setState({
      radius: 1000,
      minPrice: 0,
      maxPrice: 200,
      category: 'all',
      minRating: 0,
      maxRating: 5,
      surfaceMode: 'any',
    })
    useWishlistStore.setState({ tags: ['想吃'], restaurantTags: {} })
  })

  it('renders placeholder when no restaurant is selected', () => {
    render(<RestaurantCard />)
    expect(screen.getByText('点击上方按钮，随机选一家餐厅')).toBeInTheDocument()
  })

  it('renders selected restaurant info', () => {
    useRestaurantStore.setState({
      selected: {
        id: '1',
        name: '测试餐厅',
        address: '测试地址',
        location: { lat: 39.9, lng: 116.4 },
        category: 'quick',
        surfaceKind: 'outdoor',
        distance: 500,
        rating: 4.5,
        cost: 80,
        tel: '010-12345678',
      },
    })
    render(<RestaurantCard />)
    expect(screen.getByText('测试餐厅')).toBeInTheDocument()
    expect(screen.getByText('地址：测试地址')).toBeInTheDocument()
    expect(screen.getByText('评分：4.5')).toBeInTheDocument()
    expect(screen.getByText('人均：¥80')).toBeInTheDocument()
    expect(screen.getByText('电话：010-12345678')).toBeInTheDocument()
    expect(screen.getByText('路线：路上')).toBeInTheDocument()
    expect(screen.getByText('已吃这家')).toBeInTheDocument()
    expect(screen.getByText('换一家')).toBeInTheDocument()
  })

  it('shows the last recommendation and recent eaten history', () => {
    useDiningHistoryStore.getState().addRecommendation({
      id: 'last',
      name: '上次餐厅',
      address: '上次地址',
      location: { lat: 23, lng: 113 },
      category: 'quick',
      surfaceKind: 'unknown',
    })
    useDiningHistoryStore.getState().addEaten({
      id: 'eaten',
      name: '已吃餐厅',
      address: '已吃地址',
      location: { lat: 23, lng: 113 },
      category: 'rice',
      surfaceKind: 'unknown',
    })

    render(<RestaurantCard />)

    expect(screen.getByText('上次推荐：上次餐厅')).toBeInTheDocument()
    expect(screen.getByText('最近已吃：已吃餐厅')).toBeInTheDocument()
  })

  it('shows when results come from cache', () => {
    useRestaurantStore.setState({
      items: [],
      selected: {
        id: 'cached',
        name: '缓存餐厅',
        address: '缓存地址',
        location: { lat: 23, lng: 113 },
        category: 'quick',
        surfaceKind: 'unknown',
      },
      status: 'success',
      error: null,
      cacheState: 'stale-cache',
      lastUpdatedAt: 1000,
    })

    render(<RestaurantCard />)

    expect(screen.getByText('使用离线缓存结果')).toBeInTheDocument()
  })
})
