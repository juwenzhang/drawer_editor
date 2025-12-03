import type { TFunction } from 'i18next';
import i18n from './config';

export type Language = keyof typeof i18n.options.resources;
export interface I18nUtils {
  /**
   * 切换语言
   * @param language 目标语言
   * @returns 翻译函数
   */
  changeLanguage: (language: Language) => Promise<TFunction>;
  /**
   * 获取当前语言
   * @returns 当前语言
   */
  getCurrentLanguage: () => Language;
  /**
   * 格式化翻译字符串
   * @param key 翻译键
   * @param params 格式化参数
   * @returns 格式化后的字符串
   */
  format: (key: string, params?: Record<string, any>) => string;
  /**
   * 批量格式化翻译字符串
   * @param keys 翻译键数组
   * @param namespace 命名空间
   * @returns 格式化后的字符串键值对
   */
  batch: (keys: string[], namespace?: string) => Record<string, string>;
}

export const i18nUtils: I18nUtils = {
  changeLanguage: (language: Language): Promise<TFunction> => {
    return i18n.changeLanguage(language);
  },
  getCurrentLanguage: () => {
    return i18n.language as Language;
  },
  format: (key: string, params?: Record<string, any>) => {
    return i18n.t(key, params);
  },
  batch(keys: string[], namespace?: string): Record<string, string> {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      const fullKey = namespace ? `${namespace}:${key}` : key;
      result[key] = i18n.t(fullKey);
    });
    return result;
  },
};

export const useI18n = () => {
  const { t } = i18n;
  const instance = i18n;
  return {
    t,
    language: instance.language as Language,
    changeLanguage: (lang: Language) => instance.changeLanguage(lang),
    isChinese: () => instance.language === 'zh-CN',
    isEnglish: () => instance.language === 'en',
  };
};
