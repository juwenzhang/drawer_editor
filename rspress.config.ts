import path from 'path';
import { defineConfig } from 'rspress/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'docs'),
  title: 'JUWENZHANG DEVELOPMENT RUNTIME',
  icon: 'https://rspress.rs/rspress-logo.webp',
  logo: {
    light: 'https://rspress.rs/rspress-logo.webp',
    dark: 'https://rspress.rs/rspress-logo.webp',
  },
  themeConfig: {
    lastUpdated: true,
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/juwenzhang/drawer_editor',
      },
      {
        icon: 'juejin',
        mode: 'link',
        content: 'https://juejin.cn/user/3877322821505440',
      },
    ],
    prevPageText: '上一篇(prevPageText) ⬅️',
    nextPageText: '下一篇(nextPageText) ➡️',
  },
  base: '/drawer_editor/',
});
