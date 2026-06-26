import { useDiningHistoryStore } from '../stores/diningHistoryStore'
import { useFilterStore } from '../stores/filterStore'
import { useWishlistStore } from '../stores/wishlistStore'

const categoryLabels = {
  all: '全部',
  rice: '饭类',
  noodles: '粉面',
  quick: '快餐简餐',
  light: '轻食',
}

const surfaceModeLabels = {
  any: '不限路线',
  outdoor: '路上优先',
  underground: '地下通道',
  indoor: '商场内',
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function formatPrice(minPrice: number, maxPrice: number) {
  if (minPrice === 0 && maxPrice >= 200) return '人均不限'
  if (minPrice === 0) return `人均 ${maxPrice} 元以内`
  if (maxPrice >= 200) return `人均 ${minPrice} 元以上`
  return `人均 ${minPrice}-${maxPrice} 元`
}

function SummaryRow({
  title,
  value,
  note,
  tone = 'default',
}: {
  title: string
  value: string
  note: string
  tone?: 'default' | 'muted'
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: 8,
        padding: '12px 14px',
        background: tone === 'muted' ? '#f7f8fa' : '#fffaf2',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            color: '#1f1f1f',
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {title}
        </span>
        <span
          style={{
            flex: '0 0 auto',
            color: tone === 'muted' ? '#8a9099' : '#ad4e00',
            fontSize: 13,
            fontWeight: 750,
          }}
        >
          {value}
        </span>
      </div>
      <p
        style={{
          margin: '6px 0 0',
          color: '#7a808a',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {note}
      </p>
    </div>
  )
}

export function ProfilePage() {
  const recommended = useDiningHistoryStore((state) => state.recommended)
  const eaten = useDiningHistoryStore((state) => state.eaten)
  const radius = useFilterStore((state) => state.radius)
  const minPrice = useFilterStore((state) => state.minPrice)
  const maxPrice = useFilterStore((state) => state.maxPrice)
  const category = useFilterStore((state) => state.category)
  const minRating = useFilterStore((state) => state.minRating)
  const maxRating = useFilterStore((state) => state.maxRating)
  const surfaceMode = useFilterStore((state) => state.surfaceMode)
  const tags = useWishlistStore((state) => state.tags)
  const restaurantTags = useWishlistStore((state) => state.restaurantTags)

  const lastRecommended = recommended[0]
  const lastEaten = eaten[0]
  const taggedRestaurantCount = Object.keys(restaurantTags).length
  const appliedRestaurantTagCount = Object.values(restaurantTags).reduce(
    (total, currentTags) => total + currentTags.length,
    0
  )

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
        我的
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
        个人中心入口
      </h1>
      <p
        style={{
          margin: 0,
          color: '#686f7a',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        这里仅展示本机保存的真实历史、筛选偏好和想吃清单摘要；管理操作请回到“今天”页入口完成。
      </p>

      <div
        aria-label="我的只读摘要"
        style={{
          marginTop: 18,
          display: 'grid',
          gap: 14,
        }}
      >
        <section
          aria-label="历史摘要"
          style={{
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 8,
            padding: 16,
            background: '#fff',
            boxShadow: '0 8px 24px rgba(31, 31, 31, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 10px',
              color: '#1f1f1f',
              fontSize: 18,
              lineHeight: 1.35,
              fontWeight: 750,
            }}
          >
            历史记录
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <SummaryRow
              title="推荐过"
              value={`${recommended.length} 条`}
              note={
                lastRecommended
                  ? `最近推荐：${lastRecommended.restaurant.name}，${formatTime(
                      lastRecommended.timestamp
                    )}`
                  : '暂无推荐记录。去“今天”完成一次随机推荐后会显示在这里。'
              }
              tone={lastRecommended ? 'default' : 'muted'}
            />
            <SummaryRow
              title="吃过"
              value={`${eaten.length} 条`}
              note={
                lastEaten
                  ? `最近吃过：${lastEaten.restaurant.name}，${formatTime(lastEaten.timestamp)}`
                  : '暂无已吃记录。标记“已吃这家”后会显示在这里。'
              }
              tone={lastEaten ? 'default' : 'muted'}
            />
          </div>
        </section>

        <section
          aria-label="偏好摘要"
          style={{
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 8,
            padding: 16,
            background: '#fff',
            boxShadow: '0 8px 24px rgba(31, 31, 31, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 10px',
              color: '#1f1f1f',
              fontSize: 18,
              lineHeight: 1.35,
              fontWeight: 750,
            }}
          >
            当前筛选偏好
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <SummaryRow title="范围" value={`${radius} 米`} note="来自当前筛选半径。" />
            <SummaryRow
              title="分类与价格"
              value={categoryLabels[category]}
              note={`${formatPrice(minPrice, maxPrice)}；评分 ${minRating}-${maxRating}`}
            />
            <SummaryRow
              title="路线偏好"
              value={surfaceModeLabels[surfaceMode]}
              note="这里只展示当前筛选状态，不修改路线筛选。"
            />
          </div>
        </section>

        <section
          aria-label="收藏偏好摘要"
          style={{
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 8,
            padding: 16,
            background: '#fff',
            boxShadow: '0 8px 24px rgba(31, 31, 31, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 10px',
              color: '#1f1f1f',
              fontSize: 18,
              lineHeight: 1.35,
              fontWeight: 750,
            }}
          >
            收藏偏好
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <SummaryRow
              title="标签"
              value={`${tags.length} 个`}
              note={
                tags.length > 0
                  ? `${tags.join(' / ')}；想吃清单请在“今天”页入口中管理。`
                  : '暂无收藏标签。想吃清单请在“今天”页入口中管理。'
              }
              tone={tags.length > 0 ? 'default' : 'muted'}
            />
            <SummaryRow
              title="已标记餐厅"
              value={`${taggedRestaurantCount} 家`}
              note={
                taggedRestaurantCount > 0
                  ? `共应用 ${appliedRestaurantTagCount} 个标签；管理请在“今天”页想吃清单入口完成。`
                  : '暂无餐厅收藏标记。管理请在“今天”页想吃清单入口完成。'
              }
              tone={taggedRestaurantCount > 0 ? 'default' : 'muted'}
            />
          </div>
        </section>

        <section
          aria-label="设置入口"
          aria-disabled="true"
          style={{
            border: '1px dashed rgba(0, 0, 0, 0.12)',
            borderRadius: 8,
            padding: 16,
            background: '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h2
                style={{
                  margin: '0 0 6px',
                  color: '#1f1f1f',
                  fontSize: 18,
                  lineHeight: 1.35,
                  fontWeight: 750,
                }}
              >
                设置与数据管理
              </h2>
              <p
                style={{
                  margin: 0,
                  color: '#7a808a',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                管理操作请在“今天”页使用设置入口；本页仅展示只读摘要，不打开设置面板。
              </p>
            </div>
            <span
              style={{
                flex: '0 0 auto',
                color: '#8a9099',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              只读
            </span>
          </div>
        </section>
      </div>
    </section>
  )
}
