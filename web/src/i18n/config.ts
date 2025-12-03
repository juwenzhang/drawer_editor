// https://react.i18next.com/getting-started
// 核心依赖的是两个包吧：i18next 和 react-i18next

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// import enTranslation from './locales/en.json'
// import zhCNTranslation from './locales/zh-CN.json'
// const resources = {
//     en: {
//         translation: enTranslation
//     },
//     'zh-CN': {
//         translation: zhCNTranslation
//     }
// }

// 开始基于 esmodule 的特性实现自动化的构建我们的 resources
// 核心是 vite 的特性吧，注意这里的需要指定 tsconfig.json 的配置吧，就是 types: [ "vite/client" ]
const buildResources = (): Record<string, any> => {
  const resources: Record<string, any> = {};
  const files = import.meta.glob('./locales/*.json');
  for (const path in files) {
    const lang = path.split('/').pop()?.split('.')[0];
    if (lang) {
      resources[lang] = {
        translation: files[path],
      };
    }
  }
  return resources;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: buildResources(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true, // 开启 suspense 模式，默认是 false
    },
  });

export default i18n;
