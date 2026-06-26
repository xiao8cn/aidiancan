import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineBanner } from '../OfflineBanner'

describe('OfflineBanner', () => {
  it('shows an offline message when navigator is offline', () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true })

    render(<OfflineBanner />)

    expect(screen.getByText('离线中，只能查看最近缓存结果')).toBeInTheDocument()
  })
})
