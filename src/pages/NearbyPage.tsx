import { useRestaurantStore } from '../stores/restaurantStore'
import type { Restaurant } from '../types'

const categoryText: Record<Restaurant['category'], string> = {
  all: '全部',
  rice: '饭类',
  noodles: '粉面',
  quick: '快餐简餐',
  light: '轻食',
}

const surfaceText: Record<Restaurant['surfaceKind'], string> = {
  outdoor: '路上可达',
  underground: '地下通道',
  indoor: '商场/室内',
  unknown: '路线未知',
}

const statusText = {
  idle: {
    title: '还没有附近候选',
    body: '回到“今天”完成定位、筛选和随机选餐后，这里会展示同一批真实候选。',
  },
  loading: {
    title: '正在获取附近候选',
    body: '候选列表会在搜索完成后自动出现在这里。',
  },
  success: {
    title: '暂无可展示候选',
    body: '当前筛选条件下没有结果，可回到“今天”调整距离、分类或路线偏好。',
  },
  error: {
    title: '附近候选暂时不可用',
    body: '请回到“今天”重新定位或再次搜索，已有结果不会在这里被伪造。',
  },
}

function formatDistance(distance?: number) {
  if (typeof distance !== 'number') {
    return '距离未返回'
  }

  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} km`
  }

  return `${Math.round(distance)} m`
}

function getTypeText(restaurant: Restaurant) {
  return restaurant.type || restaurant.raw?.type || '类型未返回'
}

export function NearbyPage() {
  const items = useRestaurantStore((state) => state.items)
  const selected = useRestaurantStore((state) => state.selected)
  const status = useRestaurantStore((state) => state.status)
  const stateCopy = statusText[status]

  return (
    <section
      style={{
        minHeight: 'calc(100dvh - 101px)',
        padding: '18px 16px 32px',
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 36%, #f7f8fa 100%)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 26,
          padding: '0 10px',
          borderRadius: 999,
          background: 'rgba(255, 138, 0, 0.12)',
          color: '#ad4e00',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        附近候选
      </div>

      <h1
        style={{
          margin: '10px 0 6px',
          color: '#1f1f1f',
          fontSize: 26,
          lineHeight: 1.18,
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        比较刚搜到的选择
      </h1>
      <p
        style={{
          margin: 0,
          color: '#686f7a',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        这里复用“今天”页产生的真实候选，只做轻量比较，不接入地图或新的搜索链路。
      </p>

      {items.length > 0 ? (
        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              color: '#686f7a',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <span>来自当前搜索候选，共 {items.length} 家</span>
            <span style={{ color: '#ad4e00', fontWeight: 700 }}>
              {status === 'loading' ? '更新中' : '真实结果'}
            </span>
          </div>

          {items.map((restaurant) => {
            const isSelected = selected?.id === restaurant.id

            return (
              <article
                key={restaurant.id}
                style={{
                  border: isSelected
                    ? '1px solid rgba(255, 138, 0, 0.5)'
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: 8,
                  padding: 16,
                  background: '#fff',
                  boxShadow: '0 8px 24px rgba(31, 31, 31, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      style={{
                        margin: 0,
                        color: '#1f1f1f',
                        fontSize: 18,
                        lineHeight: 1.35,
                        fontWeight: 750,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {restaurant.name}
                    </h2>
                    <div
                      style={{
                        marginTop: 6,
                        color: '#7a808a',
                        fontSize: 13,
                        lineHeight: 1.5,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {getTypeText(restaurant)}
                    </div>
                  </div>

                  {isSelected ? (
                    <span
                      style={{
                        flex: '0 0 auto',
                        borderRadius: 999,
                        padding: '4px 8px',
                        background: '#fff3e0',
                        color: '#ad4e00',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      当前推荐
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <span style={chipStyle}>{formatDistance(restaurant.distance)}</span>
                  <span style={chipStyle}>{categoryText[restaurant.category]}</span>
                  <span style={chipStyle}>{surfaceText[restaurant.surfaceKind]}</span>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    paddingTop: 12,
                  }}
                >
                  <span style={{ color: '#8a9099', fontSize: 13, lineHeight: 1.5 }}>
                    路线状态仅展示，不触发导航
                  </span>
                  <button
                    disabled
                    type="button"
                    style={{
                      flex: '0 0 auto',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: 8,
                      padding: '7px 10px',
                      background: '#f5f6f7',
                      color: '#8a9099',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    路线待接入
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div
          aria-label="附近候选空状态"
          style={{
            marginTop: 18,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 8,
            padding: 16,
            background: '#fff',
            boxShadow: '0 8px 24px rgba(31, 31, 31, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#fff3e0',
                color: '#ad4e00',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              ·
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  margin: '0 0 6px',
                  color: '#1f1f1f',
                  fontSize: 18,
                  lineHeight: 1.35,
                  fontWeight: 750,
                }}
              >
                {stateCopy.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  color: '#7a808a',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {stateCopy.body}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              border: '1px dashed rgba(173, 78, 0, 0.28)',
              borderRadius: 8,
              padding: '12px 14px',
              background: '#fffaf2',
            }}
          >
            <div style={{ color: '#1f1f1f', fontSize: 15, fontWeight: 700 }}>
              去“今天”页生成候选
            </div>
            <div style={{ marginTop: 4, color: '#8a9099', fontSize: 13, lineHeight: 1.5 }}>
              Nearby 只消费已有真实结果；没有结果时展示空态，不写死商家、评分或距离。
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 26,
  borderRadius: 999,
  padding: '0 9px',
  background: '#f5f6f7',
  color: '#4d5560',
  fontSize: 12,
  fontWeight: 650,
} as const
