import { describe, expect, it } from 'vitest'
import {
  classifyRestaurantCategory,
  normalizePoi,
  normalizePois,
} from '../poi'
import type { AmapPoi } from '../amap'

function poi(overrides: Partial<AmapPoi>): AmapPoi {
  return {
    id: overrides.id ?? 'poi-1',
    name: overrides.name ?? '测试餐厅',
    address: overrides.address ?? '广东省广州市天河区测试路1号',
    location: overrides.location ?? '113.3245,23.1065',
    type: overrides.type,
    typecode: overrides.typecode,
    adname: overrides.adname,
    business_area: overrides.business_area,
    biz_ext: overrides.biz_ext,
    distance: overrides.distance,
    tel: overrides.tel,
  }
}

describe('normalizePois', () => {
  it('excludes drinks, hotels, bars, desserts, and entertainment POIs', () => {
    const restaurants = normalizePois([
      poi({ id: 'meal', name: '荣记烧腊饭', type: '餐饮服务;中餐厅;中餐厅' }),
      poi({ id: 'tea', name: '喜茶', type: '餐饮服务;冷饮店;冷饮店' }),
      poi({ id: 'coffee', name: '星巴克咖啡', type: '餐饮服务;咖啡厅;咖啡厅' }),
      poi({ id: 'hotel', name: '广州酒家酒店', type: '住宿服务;宾馆酒店;宾馆酒店' }),
      poi({ id: 'bar', name: '胡桃里酒吧', type: '体育休闲服务;娱乐场所;酒吧' }),
      poi({ id: 'dessert', name: '满记甜品', type: '餐饮服务;糕饼店;糕饼店' }),
    ])

    expect(restaurants.map((restaurant) => restaurant.id)).toEqual(['meal'])
  })

  it('keeps everyday Guangdong meal POIs and removes duplicate same-name addresses', () => {
    const restaurants = normalizePois([
      poi({ id: 'rice-1', name: '明记烧腊饭', address: '体育西路1号' }),
      poi({ id: 'rice-2', name: '明记烧腊饭', address: '体育西路1号' }),
      poi({ id: 'cha', name: '新记茶餐厅', address: '天河南一路8号' }),
      poi({ id: 'noodle', name: '潮汕汤粉王', address: '林和中路9号' }),
    ])

    expect(restaurants.map((restaurant) => restaurant.id)).toEqual(['rice-1', 'cha', 'noodle'])
  })
})

describe('classifyRestaurantCategory', () => {
  it('assigns one primary category by priority', () => {
    expect(classifyRestaurantCategory('明记烧腊饭', '餐饮服务;中餐厅;中餐厅')).toBe('rice')
    expect(classifyRestaurantCategory('潮汕汤粉王', '餐饮服务;快餐厅;快餐厅')).toBe('noodles')
    expect(classifyRestaurantCategory('尊宝比萨简餐', '餐饮服务;快餐厅;快餐厅')).toBe('quick')
    expect(classifyRestaurantCategory('低卡轻食沙拉', '餐饮服务;餐饮相关场所;餐饮相关')).toBe('light')
  })

  it('adds normalized POI metadata to restaurants', () => {
    const restaurant = normalizePoi(
      poi({
        name: '新记茶餐厅',
        type: '餐饮服务;茶餐厅;茶餐厅',
        typecode: '050117',
        adname: '天河区',
        business_area: '体育中心',
        biz_ext: { rating: '4.5', cost: '38' },
      })
    )

    expect(restaurant).toMatchObject({
      name: '新记茶餐厅',
      category: 'quick',
      type: '餐饮服务;茶餐厅;茶餐厅',
      typecode: '050117',
      adname: '天河区',
      businessArea: '体育中心',
      rating: 4.5,
      cost: 38,
      surfaceKind: 'unknown',
    })
  })
})
