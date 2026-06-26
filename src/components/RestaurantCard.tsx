import { Button, Card, List, Space, Tag, Toast } from 'antd-mobile'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useFilterStore } from '../stores/filterStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useDiningHistoryStore } from '../stores/diningHistoryStore'
import { filterRestaurants } from '../utils/filter'
import type { Restaurant, SurfaceKind } from '../types'

const SURFACE_LABELS: Record<SurfaceKind, string> = {
  outdoor: '路上',
  underground: '地下',
  indoor: '商场内',
  unknown: '未知',
}

function CompactItem({ restaurant }: { restaurant: Restaurant }) {
  const meta: string[] = []
  if (restaurant.rating !== undefined) meta.push(`评分 ${restaurant.rating}`)
  if (restaurant.cost !== undefined) meta.push(`人均 ¥${restaurant.cost}`)

  return (
    <List.Item
      key={restaurant.id}
      description={`${restaurant.distance !== undefined ? `${restaurant.distance}m · ` : ''}${restaurant.address}`}
      arrow={false}
    >
      <div style={{ fontWeight: 500 }}>{restaurant.name}</div>
      {meta.length > 0 && (
        <div style={{ fontSize: 12, color: '#666' }}>{meta.join(' · ')}</div>
      )}
    </List.Item>
  )
}

export function RestaurantCard() {
  const { items, selected, pickRandomRestaurant } = useRestaurantStore()
  const filter = useFilterStore()
  const { tags, toggleRestaurantTag, getRestaurantTags } = useWishlistStore()
  const { recommended: recommendedHistory, eaten, addEaten } = useDiningHistoryStore()

  const filtered = filterRestaurants(items, filter)
  const sorted = [...filtered].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
  const lastRecommended = recommendedHistory[0]
  const recentEaten = eaten[0]

  const historySummary = (
    <Space block direction="vertical" style={{ margin: '12px 16px 0' }}>
      {lastRecommended && (
        <Tag color="primary">上次推荐：{lastRecommended.restaurant.name}</Tag>
      )}
      {recentEaten && <Tag color="success">最近已吃：{recentEaten.restaurant.name}</Tag>}
    </Space>
  )

  if (sorted.length === 0 && !selected) {
    return (
      <>
        {historySummary}
        <Card style={{ margin: '12px 16px' }}>
          <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
            点击上方按钮，随机选一家餐厅
          </div>
        </Card>
      </>
    )
  }

  const recommended = selected ?? sorted[0]
  const others = sorted.filter((r) => r.id !== recommended.id)
  const recommendedTags = getRestaurantTags(recommended.id)

  const handleMarkEaten = () => {
    addEaten(recommended)
    Toast.show({ content: '已记录到最近已吃', position: 'bottom' })
  }

  return (
    <div style={{ margin: '12px 16px' }}>
      {historySummary}
      <div style={{ fontSize: 14, color: '#666', margin: '12px 0 8px' }}>🎯 推荐</div>
      <Card
        title={recommended.name}
        extra={recommended.distance !== undefined ? `${recommended.distance}m` : undefined}
      >
        <Space block direction="vertical">
          {recommended.rating !== undefined && <div>评分：{recommended.rating}</div>}
          {recommended.cost !== undefined && <div>人均：¥{recommended.cost}</div>}
          <div>路线：{SURFACE_LABELS[recommended.surfaceKind]}</div>
          <div>地址：{recommended.address}</div>
          {recommended.tel && <div>电话：{recommended.tel}</div>}

          <Space wrap>
            {tags.map((tag) => (
              <Tag
                key={tag}
                color={recommendedTags.includes(tag) ? 'primary' : 'default'}
                onClick={() => toggleRestaurantTag(recommended.id, tag)}
              >
                {tag}
              </Tag>
            ))}
          </Space>
          <Space block>
            <Button size="small" color="primary" onClick={handleMarkEaten}>
              已吃这家
            </Button>
            <Button size="small" fill="outline" onClick={pickRandomRestaurant}>
              换一家
            </Button>
          </Space>
        </Space>
      </Card>

      {others.length > 0 && (
        <>
          <div style={{ fontSize: 14, color: '#666', margin: '16px 0 8px' }}>其他结果</div>
          <List>
            {others.map((restaurant) => (
              <CompactItem key={restaurant.id} restaurant={restaurant} />
            ))}
          </List>
        </>
      )}
    </div>
  )
}
