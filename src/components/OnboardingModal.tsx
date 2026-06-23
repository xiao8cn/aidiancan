import { Input, Modal } from 'antd-mobile'
import { useSettingsStore } from '../stores/settingsStore'

export function OnboardingModal() {
  const { amapKey, isFirstVisit, setAmapKey, markVisited } = useSettingsStore()

  const canStart = amapKey.trim().length > 0

  if (!isFirstVisit) return null

  return (
    <Modal
      visible
      onClose={markVisited}
      closeOnMaskClick={false}
      title="欢迎使用今天吃啥"
      content={
        <div>
          <p>请输入你的高德 Web Service Key 以开始搜索附近餐厅。</p>
          <Input
            placeholder="高德 key"
            value={amapKey}
            onChange={setAmapKey}
            clearable
          />
        </div>
      }
      actions={[
        {
          key: 'confirm',
          text: '开始',
          disabled: !canStart,
          onClick: markVisited,
        },
      ]}
    />
  )
}
