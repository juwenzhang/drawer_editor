import { BugOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Typography } from 'antd';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

const { Title, Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * 错误边界组件
 * 用于捕获子组件树中的 JavaScript 错误，并显示降级 UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 使下一次渲染能够显示降级 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 将错误信息记录到错误报告服务
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // 调用自定义错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    // 重置组件状态
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = (): void => {
    // 重新加载页面
    window.location.reload();
  };

  toggleDetails = (): void => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 如果提供了自定义降级 UI，则显示它
      if (fallback) {
        return fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.content}>
              <Alert
                type="error"
                showIcon
                icon={<BugOutlined />}
                message="应用程序发生错误"
                description="很抱歉，应用程序遇到了一个错误。请重试或刷新页面。"
                style={styles.alert}
              />

              <div style={styles.errorInfo}>
                <Title level={4}>错误信息</Title>
                <Paragraph>
                  <Text strong>错误类型：</Text>
                  <Text code>{error?.name || '未知错误'}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>错误信息：</Text>
                  <Text type="danger">{error?.message || '未知错误信息'}</Text>
                </Paragraph>

                {showDetails && errorInfo && (
                  <div style={styles.details}>
                    <Title level={5}>错误堆栈</Title>
                    <pre style={styles.stack}>{error?.stack}</pre>

                    <Title level={5} style={{ marginTop: 16 }}>
                      组件堆栈
                    </Title>
                    <pre style={styles.stack}>{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.actions}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
                style={styles.button}
              >
                重试组件
              </Button>
              <Button onClick={this.handleReload} style={styles.button}>
                刷新页面
              </Button>
              <Button type="text" onClick={this.toggleDetails}>
                {showDetails ? '隐藏详情' : '显示详情'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '24px',
    backgroundColor: '#f5f5f5',
  } as const,
  card: {
    maxWidth: '800px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '24px',
  } as const,
  content: {
    padding: '8px 0',
  } as const,
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '24px',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '24px',
  } as const,
  button: {
    minWidth: '120px',
  } as const,
  alert: {
    marginBottom: '24px',
  } as const,
  errorInfo: {
    marginTop: '16px',
  } as const,
  details: {
    marginTop: '16px',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '16px',
  } as const,
  stack: {
    padding: '12px',
    backgroundColor: '#fafafa',
    border: '1px solid #e8e8e8',
    borderRadius: '4px',
    fontSize: '12px',
    lineHeight: '1.5',
    overflow: 'auto',
    maxHeight: '300px',
    marginTop: '8px',
  } as const,
};

export default ErrorBoundary;
