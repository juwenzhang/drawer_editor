export type StorageType = 'local' | 'session';

/**
 * 获取指定类型的存储对象
 * @param type 存储类型，默认值为 'local'
 * @returns 对应的存储对象
 */
const getStorage = (type: StorageType): Storage => {
  return type === 'local' ? localStorage : sessionStorage;
};

/**
 * 设置指定键名的存储项
 * @param key 要设置的存储项的键名
 * @param value 要设置的存储项的值
 * @param type 存储类型，默认值为 'local'
 */
export const setItem = <T>(
  key: string,
  value: T,
  type: StorageType = 'local',
): void => {
  try {
    const storage = getStorage(type);
    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
  } catch (error) {
    console.error('存储信息 --> storage 失败了吧，核心原因是:', error);
  }
};

/**
 * 获取指定键名的存储项
 * @param key 要获取的存储项的键名
 * @param type 存储类型，默认值为 'local'
 * @returns 对应的存储项的值，若不存在则返回 null
 */
export const getItem = <T>(
  key: string,
  type: StorageType = 'local',
): T | null => {
  try {
    const storage = getStorage(type);
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('获取信息 <-- storage 失败了吧，核心原因是:', error);
    return null;
  }
};

/**
 * 删除指定键名的存储项
 * @param key 要删除的存储项的键名
 * @param type 存储类型，默认值为 'local'
 */
export const removeItem = (key: string, type: StorageType = 'local'): void => {
  try {
    const storage = getStorage(type);
    storage.removeItem(key);
  } catch (error) {
    console.error('删除信息 <-- storage 失败了吧，核心原因是:', error);
  }
};

/**
 * 清空指定类型的存储对象
 * @param type 存储类型，默认值为 'local'
 */
export const clear = (type: StorageType = 'local'): void => {
  try {
    const storage = getStorage(type);
    storage.clear();
  } catch (error) {
    console.error('清空信息 <-- storage 失败了吧，核心原因是:', error);
  }
};

/**
 * 存储观察者类，用于监听指定键名的存储项变化
 * 核心的设计参考的是 vue 的响应式系统吧
 * 首先全局的 listener 的数据结构用的 Map 进行管理，后续的事件添加是通过 Set 进行管理的
 * 以及参考了 hash 表的实现吧
 */
export class StorageObserver {
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * 监听指定键名的存储项变化
   * @param key 要监听的存储项的键名
   * @param callback 变化时要调用的回调函数
   * @returns 取消监听的函数
   */
  watch<T>(key: string, callback: (value: T | null) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    const callbacks = this.listeners.get(key)!;
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  /**
   * 触发指定键名的存储项变化事件
   * @param key 要触发变化事件的存储项的键名
   * @param value 要触发变化事件的存储项的值
   */
  trigger(key: string, value: any): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }
}

export class StorageManager {
  private prefix: string;
  private observer: StorageObserver;
  private type: StorageType;

  constructor(prefix: string = 'drawer', type: StorageType = 'local') {
    this.prefix = prefix;
    this.observer = new StorageObserver();
    this.type = type;

    if (type === 'local') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  /**
   * 处理 storage 事件，触发对应的变化事件
   * @param event 触发的 storage 事件对象
   */
  private handleStorageEvent(event: StorageEvent): void {
    if (event.storageArea === getStorage(this.type) && event.key) {
      this.observer.trigger(
        event.key.replace(`${this.prefix}:`, ''),
        event.newValue ? JSON.parse(event.newValue) : null,
      );
    }
  }

  /**
   * 获取完整的存储项键名
   * @param key 要获取的存储项的键名
   * @returns 完整的存储项键名，格式为 `${prefix}:${key}`
   */
  private getFullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * 设置指定键名的存储项
   * @param key 要设置的存储项的键名
   * @param value 要设置的存储项的值
   */
  set<T>(key: string, value: T): void {
    const fullKey = this.getFullKey(key);
    setItem(fullKey, value, this.type);
    this.observer.trigger(key, value);
  }

  /**
   * 获取指定键名的存储项
   * @param key 要获取的存储项的键名
   * @returns 对应的存储项的值，若不存在则返回 null
   */
  get<T>(key: string): T | null {
    const fullKey = this.getFullKey(key);
    return getItem<T>(fullKey, this.type);
  }

  /**
   * 删除指定键名的存储项
   * @param key 要删除的存储项的键名
   */
  remove(key: string): void {
    const fullKey = this.getFullKey(key);
    removeItem(fullKey, this.type);
    this.observer.trigger(key, null);
  }

  /**
   * 监听指定键名的存储项变化
   * @param key 要监听的存储项的键名
   * @param callback 变化时要调用的回调函数
   * @returns 取消监听的函数
   */
  watch<T>(key: string, callback: (value: T | null) => void): () => void {
    return this.observer.watch(key, callback);
  }

  /**
   * 清空所有以指定前缀开头的存储项
   */
  clearAll(): void {
    const storage = getStorage(this.type);
    const keys: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(`${this.prefix}:`)) {
        keys.push(key);
      }
    }

    keys.forEach(key => storage.removeItem(key));
  }
}

export const defaultStorage = new StorageManager();
export const storageUtils = {
  setItem,
  getItem,
  removeItem,
  clear,
  StorageManager,
  defaultStorage,
};
