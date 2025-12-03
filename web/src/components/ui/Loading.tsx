import { LoadingOutlined } from '@ant-design/icons';
import { Space, Spin, Typography } from 'antd';
import React, { type CSSProperties } from 'react';

const { Text } = Typography;

interface LoadingProps {
  /** 加载提示文字 */
  tip?: string;
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 是否显示蒙层 */
  mask?: boolean;
  /** 自定义大小 */
  size?: 'small' | 'default' | 'large';
  /** 自定义样式 */
  style?: CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 延迟显示（毫秒） */
  delay?: number;
}

const Loading: React.FC<LoadingProps> = ({
  tip = '加载中...',
  fullscreen = false,
  mask = false,
  size = 'default',
  style,
  className,
  delay = 0,
}) => {
  const [delayed, setDelayed] = React.useState(delay > 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setDelayed(false);
      }, delay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [delay]);

  if (delayed) {
    return null;
  }

  const getSizePx = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const spinIcon = <LoadingOutlined style={{ fontSize: getSizePx() }} spin />;

  const renderContent = () => (
    <Space direction="vertical" align="center" size="middle">
      <Spin indicator={spinIcon} size={size} />
      {tip && <Text type="secondary">{tip}</Text>}
    </Space>
  );

  const containerStyle: CSSProperties = fullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: mask ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
        zIndex: 9999,
        ...style,
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        ...style,
      };

  return (
    <div className={className} style={containerStyle}>
      {renderContent()}
    </div>
  );
};

export const SkeletonLoading: React.FC<{
  type?: 'card' | 'list' | 'text';
  count?: number;
}> = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div style={skeletonStyles.card}>
            <div style={skeletonStyles.cardHeader} />
            <div style={skeletonStyles.cardBody} />
          </div>
        );
      case 'list':
        return (
          <div style={skeletonStyles.listItem}>
            <div style={skeletonStyles.avatar} />
            <div style={skeletonStyles.listContent}>
              <div style={skeletonStyles.line} />
              <div style={skeletonStyles.lineShort} />
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <div style={skeletonStyles.text}>
            <div style={skeletonStyles.line} />
            <div style={skeletonStyles.line} />
            <div style={skeletonStyles.lineShort} />
          </div>
        );
    }
  };

  return (
    <div style={skeletonStyles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

const skeletonStyles = {
  container: {
    width: '100%',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as const,
  card: {
    width: '100%',
    padding: '16px',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    marginBottom: '12px',
  } as const,
  cardHeader: {
    height: '20px',
    width: '60%',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    marginBottom: '12px',
  } as const,
  cardBody: {
    height: '80px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  } as const,
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  } as const,
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    marginRight: '12px',
  } as const,
  listContent: {
    flex: 1,
  } as const,
  text: {
    width: '100%',
  } as const,
  line: {
    height: '16px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    marginBottom: '8px',
    width: '100%',
  } as const,
  lineShort: {
    height: '16px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    marginBottom: '8px',
    width: '60%',
  } as const,
};

// 添加 CSS 动画
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(
    `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
    styleSheet.cssRules.length,
  );
}

export default Loading;
