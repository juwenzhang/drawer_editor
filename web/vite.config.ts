import react from '@vitejs/plugin-react';
// import { checker } from 'vite-plugin-checker'
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@core': resolve(__dirname, './src/core'),
      '@store': resolve(__dirname, './src/store'),
      '@utils': resolve(__dirname, './src/utils'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
        relativeUrls: true,
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 手动分块，一般的分块策略的是：
        // 1. 把 node_modules 中的代码分块
        // 2. 把公共的代码分块
        // 3. 把业务代码分块
        // 这里做的是：
        // 1. 把 react 相关的代码分块
        // 2. 把 zustand 相关的代码分块
        // 3. 把 i18n 相关的代码分块
        // 4. 把 utils 相关的代码分块
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'utils-vendor': ['lodash-es', 'nanoid', 'classnames'],
        },
      },
    },
  },
});
