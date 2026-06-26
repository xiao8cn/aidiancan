import { useState } from 'react'
import { NavBar, TabBar } from 'antd-mobile'
import { TodayPage } from '../pages/TodayPage'
import { NearbyPage } from '../pages/NearbyPage'
import { ProfilePage } from '../pages/ProfilePage'

type TabKey = 'today' | 'nearby' | 'profile'

const tabs: Array<{ key: TabKey; title: string }> = [
  { key: 'today', title: '今天' },
  { key: 'nearby', title: '附近' },
  { key: 'profile', title: '我的' },
]

const tabTitles: Record<TabKey, string> = {
  today: '今天吃啥',
  nearby: '附近餐厅',
  profile: '我的',
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabKey>('today')

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 56 }}>
      <NavBar back={null}>{tabTitles[activeTab]}</NavBar>
      <main>
        {activeTab === 'today' && <TodayPage />}
        {activeTab === 'nearby' && <NearbyPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
      <div
        style={{
          position: 'fixed',
          left: '50%',
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 480,
          transform: 'translateX(-50%)',
          borderTop: '1px solid #eee',
          background: '#fff',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <TabBar activeKey={activeTab} onChange={(key) => setActiveTab(key as TabKey)}>
          {tabs.map((tab) => (
            <TabBar.Item key={tab.key} title={tab.title} />
          ))}
        </TabBar>
      </div>
    </div>
  )
}
