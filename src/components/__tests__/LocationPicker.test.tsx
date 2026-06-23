/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LocationPicker } from '../LocationPicker'
import { useLocationStore } from '../../stores/locationStore'
import { useSettingsStore } from '../../stores/settingsStore'

describe('LocationPicker', () => {
  const originalNavigator = (globalThis as { navigator?: Navigator }).navigator

  beforeEach(() => {
    useLocationStore.setState({
      current: null,
      address: '',
      status: 'idle',
      error: null,
      errorCode: null,
      savedLocations: [
        { id: 'home', name: '家', address: '家地址', location: { lat: 1, lng: 2 } },
      ],
    })
    useSettingsStore.setState({ amapKey: 'test-key', isFirstVisit: false })
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.stubGlobal('navigator', originalNavigator)
    vi.restoreAllMocks()
  })

  it('renders locate button', () => {
    render(<LocationPicker />)
    expect(screen.getByText('定位')).toBeInTheDocument()
  })

  it('shows saved locations', () => {
    render(<LocationPicker />)
    expect(screen.getByText('家')).toBeInTheDocument()
  })

  it('triggers locate on button click', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) =>
        success({ coords: { latitude: 39.9, longitude: 116.4 } } as GeolocationPosition)
      ),
    }
    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    render(<LocationPicker />)
    fireEvent.click(screen.getByText('定位'))

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
  })

  it('selects a saved location on click', () => {
    render(<LocationPicker />)
    fireEvent.click(screen.getByText('家'))
    expect(useLocationStore.getState().current).toEqual({ lat: 1, lng: 2 })
  })

  it('renders search input and button', () => {
    render(<LocationPicker />)
    expect(screen.getByPlaceholderText('搜索地点（如：望京 SOHO）')).toBeInTheDocument()
  })

  it('searches place via Amap API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: '1',
          info: 'OK',
          pois: [
            {
              id: 'poi-1',
              name: '测试大厦',
              address: '测试路1号',
              location: '116.4,39.9',
            },
          ],
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LocationPicker />)
    const input = screen.getByPlaceholderText('搜索地点（如：望京 SOHO）')
    fireEvent.change(input, { target: { value: '测试大厦' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))

    await waitFor(() => {
      expect(screen.getByText('测试大厦')).toBeInTheDocument()
    })
  })
})
