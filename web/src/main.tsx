import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/config';
import './styles/index.less';
import { workletLoader } from '@/utils/worklet/loader';
import App from './App';

// 实现初始化我们的worklet吧
workletLoader
  .init()
  .then(() => {
    console.log('Worklets loaded successfully');
  })
  .catch(error => {
    console.warn('Failed to load worklets:', error);
  });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
