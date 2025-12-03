import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
}

// 切换布局的核心吧，因为后续的布局的重置就是基于断点来实现的吧
export function useBreakpoint() {
  const { width } = useWindowSize();
  const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };
  const currentBreakpoint =
    Object.entries(breakpoints)
      .sort(([, a], [, b]) => b - a)
      .find(([, breakpoint]) => width >= breakpoint)?.[0] || 'xs';

  return {
    width,
    breakpoint: currentBreakpoint,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLargeDesktop: width >= 1536,
  };
}
