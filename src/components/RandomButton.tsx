import { Button, Toast } from 'antd-mobile'
import { useLocationStore } from '../stores/locationStore'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useSettingsStore } from '../stores/settingsStore'

export function RandomButton() {
  const { current } = useLocationStore()
  const { amapKey } = useSettingsStore()
  const { status, search, pickRandomRestaurant, items } = useRestaurantStore()

  const handleClick = async () => {
    if (!amapKey) {
      Toast.show({ content: '请先设置高德 Key', position: 'bottom' })
      return
    }
    if (!current) {
      Toast.show({ content: '请先定位或选择地点', position: 'bottom' })
      return
    }

    if (items.length === 0) {
      await search(amapKey, current)
    }

    const { status: searchStatus, error: searchError, items: currentItems } = useRestaurantStore.getState()

    if (searchStatus === 'error') {
      Toast.show({ content: searchError || '搜索失败', position: 'bottom' })
      return
    }

    if (currentItems.length === 0) {
      Toast.show({ content: '没有符合条件的餐厅，试试扩大范围', position: 'bottom' })
      return
    }

    pickRandomRestaurant()
    if (useRestaurantStore.getState().selected === null) {
      Toast.show({ content: '没有符合价格条件的餐厅，试试选择"不限"', position: 'bottom' })
    }
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      <Button
        block
        size="large"
        color="primary"
        loading={status === 'loading'}
        onClick={handleClick}
      >
        🎲 随机选一家
      </Button>
    </div>
  )
}
