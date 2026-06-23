# 今天吃啥 - 手机网页设计文档

**日期**：2026-06-23  
**版本**：MVP v1.0  
**状态**：待实现

---

## 1. 项目概述

一款手机网页应用，解决用户中午/晚上不知道吃什么的问题。根据用户位置搜索附近餐厅，支持筛选条件后随机推荐一家。

### 1.1 核心目标

- 3 秒内完成定位/选位置
- 一键随机选一家附近餐厅
- 展示餐厅关键信息（名称、距离、评分、地址、电话）
- 本地维护"想吃清单"标签，辅助决策

### 1.2 非目标

- 不接入用户系统/登录
- 不做餐厅详情页/导航/外卖跳转（MVP 阶段）
- 不做算法推荐/历史记录分析
- 不做后端服务（纯前端 MVP）

---

## 2. 用户故事

1. 作为上班族，我中午不知道吃什么，打开网页后能快速定位公司位置，筛选 1km 内、人均 ¥30-50 的餐厅，然后随机选一家。
2. 作为用户，我想给某家餐厅标记"想吃"标签，方便下次随机到时知道这家是我的偏好。
3. 作为用户，当定位不准或失败时，我能手动输入地址或选择常用地点（家/公司）。

---

## 3. 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | React 19.2 + TypeScript |
| 构建工具 | Vite+（`vp` CLI，基于 Vite 的统一工具链） |
| UI 组件库 | Ant Design Mobile |
| 状态管理 | Zustand + persist（localStorage） |
| 地图/POI 数据 | 高德地图 Web Service API |
| 坐标转换 | 自定义 WGS-84 → GCJ-02 工具函数 |
| 测试 | Vitest + React Testing Library（Vite+ 内置 Vitest） |
| 部署 | Vercel / GitHub Pages |

---

## 4. 架构设计

### 4.1 整体架构

纯前端单页应用。浏览器定位获取 WGS-84 坐标，转换为 GCJ-02 后调用高德周边搜索 API，结果经筛选后随机展示。

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  浏览器定位  │────▶│ 坐标转换工具  │────▶│ 高德 POI 搜索 API │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  本地存储    │◀────│  Zustand     │◀────│   筛选 + 随机    │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  餐厅卡片展示    │
                                         └─────────────────┘
```

### 4.2 页面结构

单屏滚动布局：

- 顶部标题
- 位置选择器（当前位置 + 重新定位 + 手动输入 + 常用地点）
- 筛选栏（距离、价格区间）
- 随机按钮
- 餐厅结果卡片
- 设置入口（高德 key、想吃清单、常用地点管理）

---

## 5. 组件设计

| 组件 | 文件路径 | 职责 |
|---|---|---|
| `App` | `src/App.tsx` | 页面骨架、全局错误边界、主题配置 |
| `LocationPicker` | `src/components/LocationPicker.tsx` | GPS 定位、地址展示、手动输入、常用地点选择 |
| `FilterBar` | `src/components/FilterBar.tsx` | 距离、价格区间筛选 |
| `RandomButton` | `src/components/RandomButton.tsx` | 触发随机选择、加载状态 |
| `RestaurantCard` | `src/components/RestaurantCard.tsx` | 展示选中餐厅信息 |
| `WishlistDrawer` | `src/components/WishlistDrawer.tsx` | 管理想吃标签、给餐厅打标签 |
| `SettingsPanel` | `src/components/SettingsPanel.tsx` | 高德 key 配置、数据导入导出、重置 |
| `ErrorBoundary` | `src/components/ErrorBoundary.tsx` | 捕获渲染错误，防止白屏 |

---

## 6. 状态管理

使用 Zustand，按领域拆分为 5 个 store：

| Store | 数据 | 持久化 |
|---|---|---|
| `useLocationStore` | 当前坐标、地址文本、定位状态、常用地点列表 | localStorage |
| `useFilterStore` | 距离半径、价格区间 | localStorage |
| `useRestaurantStore` | 餐厅列表、当前选中餐厅、加载状态、错误信息 | 不持久化 |
| `useWishlistStore` | 想吃标签列表、餐厅→标签映射 | localStorage |
| `useSettingsStore` | 高德 key、是否首次使用 | localStorage |

---

## 7. 数据流

1. 用户打开应用，尝试浏览器定位
2. 定位成功 → WGS-84 转 GCJ-02 → 保存到 `locationStore`
3. 用户调整筛选条件 → 触发 `amapService.searchNearby()`
4. `amapService` 调用高德 `v3/place/around` 接口
5. 返回结果保存到 `restaurantStore`
6. 用户点击"随机选一家" → 从过滤后的列表中随机抽取 → 更新当前选中餐厅
7. 用户可给当前餐厅添加想吃标签 → 保存到 `wishlistStore`

---

## 8. API 集成

### 8.1 高德 API

- **接口**：`https://restapi.amap.com/v3/place/around`
- **关键参数**：
  - `key`：高德 Web Service Key
  - `location`：经度,纬度（GCJ-02）
  - `radius`：搜索半径（米）
  - `types`：`050000`（餐饮美食大类）
  - `offset`：每页数量，最大 25
  - `page`：页码
- **返回字段使用**：
  - `name`：餐厅名称
  - `address`：地址
  - `location`：经纬度
  - `tel`：电话
  - `distance`：距离
  - `biz_ext.rating`：评分（如有）
  - `biz_ext.cost`：人均消费（如有，不可靠）

### 8.2 缓存策略

- 同一坐标 + 同一半径，5 分钟内不重复请求
- 使用 Zustand 内存缓存短期结果

### 8.3 坐标转换

浏览器 `navigator.geolocation` 返回 WGS-84 坐标，需转换为 GCJ-02 后再调用高德 API。使用本地 `wgs84ToGcj02()` 函数实现。

---

## 9. 筛选与随机逻辑

### 9.1 筛选条件

| 距离 | 价格区间 |
|---|---|
| 500m | ¥：[0, 30) |
| 1km | ¥¥：[30, 60) |
| 2km | ¥¥¥：[60, ∞) |
| 5km | 不限 |

**无价格信息餐厅的处理**：当高德未返回人均消费时，默认归入「不限」选项；选择具体价格区间时，不显示这类餐厅，避免误导。

### 9.2 随机算法

对过滤后的餐厅列表进行均匀随机抽样：

```typescript
const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
const selected = filteredRestaurants[randomIndex];
```

MVP 阶段使用简单随机，后续可扩展为加权随机（考虑评分、距离等）。

---

## 10. 错误处理

| 场景 | 处理方式 |
|---|---|
| 浏览器定位失败/用户拒绝 | 提示定位失败，切换到手动输入模式 |
| 高德 key 无效/过期 | 顶部横幅提示检查 key，跳转设置面板 |
| 高德 API 返回空结果 | 提示扩大搜索范围或更换位置 |
| 网络请求失败 | 重试 1 次，仍失败提示网络问题 |
| 随机时列表为空 | 禁用按钮或提示先搜索 |
| 本地存储损坏 | 捕获异常，重置为默认状态 |
| 组件渲染崩溃 | Error Boundary 兜底，显示友好错误页 |

---

## 11. 存储设计

### 11.1 localStorage 键

| 键 | 内容 |
|---|---|
| `wte-settings` | 高德 key、首次使用标记 |
| `wte-location` | 当前坐标、地址、常用地点 |
| `wte-filter` | 距离、价格区间 |
| `wte-wishlist` | 想吃标签、餐厅标签映射 |

### 11.2 数据导入导出

设置面板提供 JSON 导入导出功能，方便备份和迁移。

---

## 12. 测试策略

| 类型 | 工具 | 覆盖范围 |
|---|---|---|
| 单元测试 | Vitest（Vite+ 内置） | 坐标转换、价格过滤、随机算法 |
| 组件测试 | React Testing Library | LocationPicker、FilterBar、RestaurantCard |
| 端到端测试 | Playwright | 定位 → 筛选 → 随机 → 展示全流程（可选） |
| 代码检查 | Oxlint / Oxfmt（Vite+ 内置） | 统一代码风格和基础质量检查 |
| 手动测试 | 真机 | 浏览器定位、高德 key、UI 交互 |

---

## 13. 部署

- 创建项目：`vp create`（选择 React + TypeScript 模板）
- 开发命令：`vp dev`
- 构建命令：`vp build`
- 输出目录：`dist/`
- 推荐部署到 Vercel 或 GitHub Pages
- 环境变量：高德 key 由用户在设置面板输入，不通过构建时环境变量注入

---

## 14. 安全与限制

- 高德 key 存储在前端 localStorage 中，存在泄露风险。MVP 阶段仅适合个人使用或信任的小范围用户。
- 若后续要公开发布，必须迁移到后端代理方案。
- 高德 API 有调用配额限制，需合理使用缓存。

---

## 15. 后续可扩展方向

- 加入 PWA，支持添加到主屏幕和离线缓存
- 后端代理保护高德 key
- 历史记录与去重（排除最近吃过的）
- 接入大众点评/美团获取更准确的人均消费和热门菜品
- 分享卡片（生成餐厅图片分享）

---

## 16. 验收标准

- [ ] 用户能在 3 秒内完成定位或手动选位置
- [ ] 能根据距离和价格区间筛选附近餐厅
- [ ] 点击按钮后随机展示一家餐厅
- [ ] 餐厅卡片展示名称、距离、评分、地址、电话
- [ ] 能给餐厅添加/移除想吃标签
- [ ] 能配置高德 key 并验证有效性
- [ ] 定位失败、key 错误、网络错误时有明确提示
- [ ] 在主流手机浏览器（Safari、Chrome、微信内置浏览器）可正常使用
