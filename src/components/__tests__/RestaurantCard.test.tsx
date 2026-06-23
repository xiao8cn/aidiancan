import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RestaurantCard } from '../RestaurantCard'
import { useRestaurantStore } from '../../stores/restaurantStore'

describe('RestaurantCard', () => {
  beforeEach(() => {
    useRestaurantStore.setState({ items: [], selected: null, status: 'idle', error: null })
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
  })
})
