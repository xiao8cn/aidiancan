import { useState } from 'react'
import { Button, Input, List, Space, Tag, Toast } from 'antd-mobile'
import { LocationOutline, SearchOutline } from 'antd-mobile-icons'
import { useLocationStore } from '../stores/locationStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useRestaurantStore } from '../stores/restaurantStore'
import { searchPlace, reverseGeocode } from '../services/amap'
import type { SavedLocation } from '../types'

export function LocationPicker() {
  const { current, address, status, error, savedLocations, locate, setLocation, upsertSavedLocation } =
    useLocationStore()
  const { amapKey } = useSettingsStore()
  const { clearRestaurants } = useRestaurantStore()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<SavedLocation[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const handleLocate = async () => {
    clearRestaurants()
    await locate()
    const { error: locateError, current: located } = useLocationStore.getState()
    if (locateError) {
      Toast.show({ content: `定位失败：${locateError}`, position: 'bottom' })
      return
    }
    if (amapKey && located) {
      try {
        const formatted = await reverseGeocode(amapKey, located)
        if (formatted) {
          setLocation(located, formatted)
        }
      } catch {
        // keep default '当前位置' if regeo fails
      }
    }
  }

  const handleSearch = async () => {
    const keyword = searchKeyword.trim()
    if (!keyword) return
    if (!amapKey) {
      Toast.show({ content: '请先设置高德 Key', position: 'bottom' })
      return
    }
    setSearchLoading(true)
    try {
      const results = await searchPlace(amapKey, keyword)
      setSearchResults(results)
      if (results.length === 0) {
        Toast.show({ content: '未找到相关地点', position: 'bottom' })
      }
    } catch (err) {
      Toast.show({
        content: err instanceof Error ? err.message : '地点搜索失败',
        position: 'bottom',
      })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectResult = (result: SavedLocation) => {
    clearRestaurants()
    setLocation(result.location, `${result.name} · ${result.address}`)
    setSearchResults([])
    setSearchKeyword('')
  }

  const handleSaveCurrent = () => {
    if (!current) return
    upsertSavedLocation({
      id: `saved-${Date.now()}`,
      name: address || '保存的位置',
      address: address || '保存的位置',
      location: current,
    })
    Toast.show({ content: '已保存到常用地点', position: 'bottom' })
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      <Space block wrap align="center">
        <Button
          size="small"
          onClick={handleLocate}
          loading={status === 'loading'}
          color="primary"
        >
          <LocationOutline /> 定位
        </Button>
        {current ? (
          <Tag color="success">{address || '已定位'}</Tag>
        ) : (
          <Tag color="default">未定位</Tag>
        )}
        {current && (
          <Button size="mini" fill="outline" onClick={handleSaveCurrent}>
            保存
          </Button>
        )}
      </Space>

      {error && (
        <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
          {error}，请选择下方常用地点或搜索地点
        </div>
      )}

      <Space block wrap style={{ marginTop: 12 }}>
        {savedLocations.map((loc) => (
          <Button
            key={loc.id}
            size="mini"
            onClick={() => {
              clearRestaurants()
              setLocation(loc.location, loc.address)
            }}
          >
            {loc.name}
          </Button>
        ))}
      </Space>

      <Space block style={{ marginTop: 12 }} align="center">
        <Input
          placeholder="搜索地点（如：望京 SOHO）"
          value={searchKeyword}
          onChange={setSearchKeyword}
          onEnterPress={handleSearch}
          style={{ flex: 1 }}
        />
        <Button size="small" loading={searchLoading} onClick={handleSearch}>
          <SearchOutline />
        </Button>
      </Space>

      {searchResults.length > 0 && (
        <List style={{ marginTop: 8, maxHeight: 200, overflow: 'auto' }}>
          {searchResults.map((result) => (
            <List.Item
              key={result.id}
              onClick={() => handleSelectResult(result)}
              description={result.address}
              arrow={false}
            >
              {result.name}
            </List.Item>
          ))}
        </List>
      )}
    </div>
  )
}
