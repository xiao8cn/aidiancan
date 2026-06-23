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
    expect(screen.getByText('主食')).toBeInTheDocument()
    expect(screen.getByText('米')).toBeInTheDocument()
    expect(screen.getByText('面')).toBeInTheDocument()
    expect(screen.getByText('汉堡')).toBeInTheDocument()
    expect(screen.getByText('轻食')).toBeInTheDocument()
  })

  it('renders rating inputs', () => {
    render(<FilterBar />)
    expect(screen.getByText('评分')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })
})
