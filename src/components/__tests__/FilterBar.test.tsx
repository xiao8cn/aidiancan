import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterBar } from '../FilterBar'
import { useFilterStore, PRICE_SLIDER_MAX } from '../../stores/filterStore'

describe('FilterBar', () => {
  beforeEach(() => {
    useFilterStore.setState({
      radius: 1000,
      minPrice: 0,
      maxPrice: PRICE_SLIDER_MAX,
      category: 'all',
      minRating: 3,
      maxRating: 5,
      surfaceMode: 'any',
    })
  })

  it('renders distance options', () => {
    render(<FilterBar />)
    expect(screen.getByText('距离')).toBeInTheDocument()
    expect(screen.getByText('500m')).toBeInTheDocument()
    expect(screen.getByText('1km')).toBeInTheDocument()
    expect(screen.getByText('2km')).toBeInTheDocument()
    expect(screen.getByText('5km')).toBeInTheDocument()
  })

  it('renders price range label and current amount', () => {
    render(<FilterBar />)
    expect(screen.getByText('价格区间')).toBeInTheDocument()
    expect(screen.getByText(`¥0 - ¥${PRICE_SLIDER_MAX}+`)).toBeInTheDocument()
  })

  it('renders category options', () => {
    render(<FilterBar />)
    expect(screen.getByText('餐品')).toBeInTheDocument()
    expect(screen.getByText('饭类')).toBeInTheDocument()
    expect(screen.getByText('粉面粥')).toBeInTheDocument()
    expect(screen.getByText('快餐简餐')).toBeInTheDocument()
    expect(screen.getByText('轻食')).toBeInTheDocument()
  })

  it('renders route surface options', () => {
    render(<FilterBar />)
    expect(screen.getByText('路线')).toBeInTheDocument()
    expect(screen.getByText('不限')).toBeInTheDocument()
    expect(screen.getByText('路上')).toBeInTheDocument()
    expect(screen.getByText('地下')).toBeInTheDocument()
    expect(screen.getByText('商场内')).toBeInTheDocument()
  })

  it('renders rating inputs', () => {
    render(<FilterBar />)
    expect(screen.getByText('评分')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })
})
