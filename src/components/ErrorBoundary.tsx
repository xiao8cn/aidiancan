import { Component, type ReactNode } from 'react'
import { ErrorBlock } from 'antd-mobile'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBlock fullPage title="页面出错了" description="请刷新页面重试" />
    }
    return this.props.children
  }
}
