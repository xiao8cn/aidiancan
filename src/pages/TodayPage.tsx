import { FilterBar } from '../components/FilterBar'
import { LocationPicker } from '../components/LocationPicker'
import { OfflineBanner } from '../components/OfflineBanner'
import { OnboardingModal } from '../components/OnboardingModal'
import { RandomButton } from '../components/RandomButton'
import { RestaurantCard } from '../components/RestaurantCard'
import { SettingsPanel } from '../components/SettingsPanel'
import { WishlistDrawer } from '../components/WishlistDrawer'

function getMealMoment() {
  const hour = new Date().getHours()

  if (hour < 10) {
    return {
      label: '早饭',
      title: '先吃点热乎的',
      hint: '粉面、粥点、简餐优先，别把选择拖到上班路上。',
    }
  }

  if (hour < 14) {
    return {
      label: '午饭',
      title: '中午就近快点定',
      hint: '优先考虑附近、出餐快、走路压力小的日常餐。',
    }
  }

  if (hour < 18) {
    return {
      label: '下午',
      title: '先留一个晚饭方向',
      hint: '现在可以先筛口味，饭点再直接换一家或确认。',
    }
  }

  if (hour < 22) {
    return {
      label: '晚饭',
      title: '今晚吃点合适的',
      hint: '从真实附近结果里随机，少纠结，先给一个靠谱选择。',
    }
  }

  return {
    label: '夜宵',
    title: '别选太远的',
    hint: '夜里优先近、简单、还在营业的选择。',
  }
}

export function TodayPage() {
  const mealMoment = getMealMoment()

  return (
    <div
      style={{
        minHeight: 'calc(100dvh - 101px)',
        padding: '0 0 20px',
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 34%, #f7f8fa 100%)',
      }}
    >
      <OfflineBanner />

      <section
        style={{
          padding: '18px 16px 10px',
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
          {mealMoment.label}
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
          {mealMoment.title}
        </h1>
        <p
          style={{
            margin: 0,
            color: '#686f7a',
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {mealMoment.hint}
        </p>
      </section>

      <section
        aria-label="位置和筛选"
        style={{
          marginTop: 4,
          padding: '8px 0 2px',
          background: '#fff',
          borderTop: '1px solid rgba(0, 0, 0, 0.04)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ padding: '0 16px 2px', color: '#7a808a', fontSize: 13 }}>
          先确认位置，再缩小口味范围
        </div>
        <LocationPicker />
        <FilterBar />
      </section>

      <section
        aria-label="随机推荐"
        style={{
          paddingTop: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: '#1f1f1f', fontSize: 17, fontWeight: 700 }}>
              今天吃这家
            </div>
            <div style={{ marginTop: 3, color: '#8a9099', fontSize: 12 }}>
              结果来自当前定位、筛选和真实附近搜索
            </div>
          </div>
          <div
            style={{
              flex: '0 0 auto',
              color: '#ad4e00',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            快速决策
          </div>
        </div>
        <RandomButton />
        <RestaurantCard />
      </section>

      <WishlistDrawer />
      <SettingsPanel />
      <OnboardingModal />
    </div>
  )
}
