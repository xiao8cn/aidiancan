import { useState } from 'react'
import { Button, Input, List, Popup, SwipeAction, Toast } from 'antd-mobile'
import { useWishlistStore } from '../stores/wishlistStore'

export function WishlistDrawer() {
  const [visible, setVisible] = useState(false)
  const [newTag, setNewTag] = useState('')
  const { tags, addTag, removeTag } = useWishlistStore()

  const handleAdd = () => {
    const trimmed = newTag.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) {
      Toast.show({ content: '标签已存在', position: 'bottom' })
      return
    }
    addTag(trimmed)
    setNewTag('')
  }

  return (
    <>
      <div style={{ padding: '0 16px' }}>
        <Button size="small" onClick={() => setVisible(true)}>
          管理想吃清单
        </Button>
      </div>
      <Popup
        position="bottom"
        visible={visible}
        onMaskClick={() => setVisible(false)}
        style={{ minHeight: '50vh' }}
      >
        <div style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>想吃清单</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Input
              placeholder="新标签"
              value={newTag}
              onChange={setNewTag}
              onEnterPress={handleAdd}
            />
            <Button onClick={handleAdd}>添加</Button>
          </div>
          <List>
            {tags.map((tag) => (
              <SwipeAction
                key={tag}
                rightActions={[
                  {
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onClick: () => removeTag(tag),
                  },
                ]}
              >
                <List.Item>{tag}</List.Item>
              </SwipeAction>
            ))}
          </List>
        </div>
      </Popup>
    </>
  )
}
