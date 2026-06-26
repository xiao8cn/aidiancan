import { describe, expect, it } from 'vitest'
import { classifySurfaceKind } from '../route'

describe('classifySurfaceKind', () => {
  it('detects underground routes from route instructions and destination text', () => {
    expect(classifySurfaceKind(['进入地下通道', '沿体育西路步行'], '天河城B1层')).toBe('underground')
    expect(classifySurfaceKind(['从地铁通道前行'], '地下街A口')).toBe('underground')
  })

  it('detects indoor routes from mall and floor hints', () => {
    expect(classifySurfaceKind(['进入正佳广场', '乘扶梯至3楼'], '正佳广场3层')).toBe('indoor')
  })

  it('detects outdoor routes when road walking is explicit', () => {
    expect(classifySurfaceKind(['沿天河路向东步行', '右转进入体育东路'], '体育东路12号')).toBe('outdoor')
  })

  it('returns unknown when route text is insufficient', () => {
    expect(classifySurfaceKind([], '广州市天河区')).toBe('unknown')
  })
})
