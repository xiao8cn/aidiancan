import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GeoLocation, SavedLocation, AsyncStatus } from '../types'
import { wgs84ToGcj02 } from '../utils/coordinate'

interface LocationState {
  current: GeoLocation | null
  address: string
  status: AsyncStatus
  error: string | null
  errorCode: number | null
  savedLocations: SavedLocation[]
  setLocation: (location: GeoLocation, address?: string) => void
  locate: () => Promise<void>
  upsertSavedLocation: (location: SavedLocation) => void
  removeSavedLocation: (id: string) => void
  setError: (error: string) => void
}

const DEFAULT_SAVED: SavedLocation[] = [
  {
    id: 'home',
    name: '家',
    address: '常用地点：家',
    location: { lat: 39.9042, lng: 116.4074 },
  },
  {
    id: 'company',
    name: '公司',
    address: '常用地点：公司',
    location: { lat: 39.9042, lng: 116.4074 },
  },
]

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      current: null,
      address: '',
      status: 'idle',
      error: null,
      errorCode: null,
      savedLocations: DEFAULT_SAVED,

      setLocation: (location, address = '') => {
        set({ current: location, address, status: 'success', error: null })
      },

      locate: async () => {
        set({ status: 'loading', error: null, errorCode: null })
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          set({ status: 'error', error: '当前环境不支持定位', errorCode: null })
          return
        }
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            })
          })

          const wgs84 = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          const gcj02 = wgs84ToGcj02(wgs84)
          get().setLocation(gcj02, '当前位置')
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : '定位失败'
          const code =
            err && typeof err === 'object' && 'code' in err
              ? Number((err as { code: unknown }).code)
              : null
          set({ status: 'error', error: message, errorCode: Number.isNaN(code) ? null : code })
        }
      },

      upsertSavedLocation: (location) => {
        set((state) => ({
          savedLocations: [...state.savedLocations.filter((l) => l.id !== location.id), location],
        }))
      },

      removeSavedLocation: (id) => {
        set((state) => ({
          savedLocations: state.savedLocations.filter((l) => l.id !== id),
        }))
      },

      setError: (error) => set({ status: 'error', error, errorCode: null }),
    }),
    { name: 'wte-location' }
  )
)
