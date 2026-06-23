import { Card, List, Space, Tag } from 'antd-mobile'
import { useRestaurantStore } from '../stores/restaurantStore'
import { useFilterStore } from '../stores/filterStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { filterRestaurants } from '../utils/filter'
import type { Restaurant } from '../types'

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
  const { items, selected } = useRestaurantStore()
  const filter = useFilterStore()
  const { tags, toggleRestaurantTag, getRestaurantTags } = useWishlistStore()

  const filtered = filterRestaurants(items, filter)
  const sorted = [...filtered].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))

  if (sorted.length === 0 && !selected) {
    return (
      <Card style={{ margin: '12px 16px' }}>
        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
          点击上方按钮，随机选一家餐厅
        </div>
      </Card>
    )
  }

  const recommended = selected ?? sorted[0]
  const others = sorted.filter((r) => r.id !== recommended.id)
  const recommendedTags = getRestaurantTags(recommended.id)

  return (
    <div style={{ margin: '12px 16px' }}>
      <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>🎯 推荐</div>
      <Card
        title={recommended.name}
        extra={recommended.distance !== undefined ? `${recommended.distance}m` : undefined}
      >
        <Space block direction="vertical">
          {recommended.rating !== undefined && <div>评分：{recommended.rating}</div>}
          {recommended.cost !== undefined && <div>人均：¥{recommended.cost}</div>}
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
