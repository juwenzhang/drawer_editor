import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from './useStorage';

type Theme = 'light' | 'dark' | 'system';

// https://developer.mozilla.org/zh-CN/docs/Web/API/Window/matchMedia 全局的事件监听的变化，媒体查询相关的吧
// https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme 系统偏好相关的媒体查询信息吧
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const resolveTheme = useCallback((theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }, []);

  const applyTheme = useCallback(
    (newTheme: Theme) => {
      const actualTheme = resolveTheme(newTheme);
      document.documentElement.setAttribute('data-theme', actualTheme);
      setResolvedTheme(actualTheme);
    },
    [resolveTheme],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  }, [setTheme]);

  const setCustomTheme = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
    },
    [setTheme],
  );

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme: setCustomTheme,
    isLight: resolvedTheme === 'light',
    isDark: resolvedTheme === 'dark',
    isSystem: theme === 'system',
  };
}
