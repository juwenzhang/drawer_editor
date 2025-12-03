import { ConfigProvider, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type React from 'react';
import { Suspense } from 'react';
import ErrorBoundary from './components/ui/ErrorBoundary';
import GlobalLoading from './components/ui/GlobalLoading';
import Loading, { SkeletonLoading } from './components/ui/Loading';

const { Content } = Layout;

function App() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 可以将错误发送到监控服务
    console.error('App Error:', error, errorInfo);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <ErrorBoundary onError={handleError}>
        <Layout style={{ minHeight: '100vh' }}>
          {/* 全局加载状态 */}
          <GlobalLoading />

          <Layout>
            <Content style={{ padding: 24 }}>
              {/* 编辑器组件有自己的加载状态 */}
              <ErrorBoundary
                fallback={
                  <div style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>编辑器加载失败</h2>
                    <p>无法加载编辑器组件，请刷新页面重试</p>
                    <button
                      onClick={() => window.location.reload()}
                      style={{ marginTop: 16 }}
                    >
                      刷新页面
                    </button>
                  </div>
                }
              >
                <SkeletonLoading />
              </ErrorBoundary>
            </Content>
          </Layout>
        </Layout>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
