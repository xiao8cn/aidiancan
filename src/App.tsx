import { NavBar } from 'antd-mobile'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LocationPicker } from './components/LocationPicker'
import { FilterBar } from './components/FilterBar'
import { RandomButton } from './components/RandomButton'
import { RestaurantCard } from './components/RestaurantCard'
import { WishlistDrawer } from './components/WishlistDrawer'
import { SettingsPanel } from './components/SettingsPanel'
import { OnboardingModal } from './components/OnboardingModal'
import { OfflineBanner } from './components/OfflineBanner'

function App() {
  return (
    <ErrorBoundary>
      <div>
        <NavBar back={null}>今天吃啥</NavBar>
        <OfflineBanner />
        <LocationPicker />
        <FilterBar />
        <RandomButton />
        <RestaurantCard />
        <WishlistDrawer />
        <SettingsPanel />
        <OnboardingModal />
      </div>
    </ErrorBoundary>
  )
}

export default App
