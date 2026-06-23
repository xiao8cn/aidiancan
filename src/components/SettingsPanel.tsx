import { useState } from 'react'
import { Button, Input, List, Modal, Space, SwipeAction, Toast } from 'antd-mobile'
import { useSettingsStore } from '../stores/settingsStore'
import { useLocationStore } from '../stores/locationStore'
import { useFilterStore } from '../stores/filterStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useRestaurantStore } from '../stores/restaurantStore'

const APP_STORAGE_KEYS = ['wte-settings', 'wte-location', 'wte-filter', 'wte-wishlist']

export function SettingsPanel() {
  const [visible, setVisible] = useState(false)
  const { amapKey, setAmapKey } = useSettingsStore()
  const { savedLocations, removeSavedLocation } = useLocationStore()

  const handleExport = () => {
    const { amapKey, isFirstVisit } = useSettingsStore.getState()
    const { savedLocations, current, address } = useLocationStore.getState()
    const { radius, minPrice, maxPrice, category, minRating, maxRating } = useFilterStore.getState()
    const { tags, restaurantTags } = useWishlistStore.getState()
    const data = {
      settings: { amapKey, isFirstVisit },
      location: { savedLocations, current, address },
      filter: { radius, minPrice, maxPrice, category, minRating, maxRating },
      wishlist: { tags, restaurantTags },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'what-to-eat-backup.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)
    Toast.show({ content: '导出成功', position: 'bottom' })
  }

  const handleClear = () => {
    Modal.confirm({
      title: '清除所有数据',
      content: '确定要清除所有本地数据吗？此操作不可恢复。',
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => {
        APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
        useSettingsStore.setState({ amapKey: '', isFirstVisit: true })
        useLocationStore.setState({
          current: null,
          address: '',
          status: 'idle',
          error: null,
          errorCode: null,
          savedLocations: [
            { id: 'home', name: '家', address: '常用地点：家', location: { lat: 39.9042, lng: 116.4074 } },
            { id: 'company', name: '公司', address: '常用地点：公司', location: { lat: 39.9042, lng: 116.4074 } },
          ],
        })
        useFilterStore.setState({
          radius: 1000,
          minPrice: 0,
          maxPrice: 200,
          category: 'all',
          minRating: 3,
          maxRating: 5,
        })
        useWishlistStore.setState({ tags: ['想吃', '聚餐', '快餐', '清淡'], restaurantTags: {} })
        useRestaurantStore.setState({ items: [], selected: null, status: 'idle', error: null })
        Toast.show({ content: '已清除本地数据', position: 'bottom' })
      },
    })
  }

  return (
    <>
      <div style={{ padding: '12px 16px' }}>
        <Button size="small" fill="outline" onClick={() => setVisible(true)}>
          设置
        </Button>
      </div>
      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        closeOnMaskClick
        showCloseButton
        title="设置"
        content={
          <Space block direction="vertical" style={{ width: '100%' }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>高德 Web Service Key</div>
              <Input
                placeholder="输入 key"
                value={amapKey}
                onChange={setAmapKey}
                clearable
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>常用地点管理</div>
              <List style={{ maxHeight: 160, overflow: 'auto' }}>
                {savedLocations.map((loc) => (
                  <SwipeAction
                    key={loc.id}
                    rightActions={[
                      {
                        key: 'delete',
                        text: '删除',
                        color: 'danger',
                        onClick: () => removeSavedLocation(loc.id),
                      },
                    ]}
                  >
                    <List.Item>{loc.name}</List.Item>
                  </SwipeAction>
                ))}
              </List>
            </div>

            <Button onClick={handleExport}>导出数据</Button>
            <Button color="danger" onClick={handleClear}>
              清除所有数据
            </Button>
          </Space>
        }
      />
    </>
  )
}
