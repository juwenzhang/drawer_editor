import { useCallback, useEffect, useState } from 'react';
import { StorageManager, storageUtils } from '@/utils/base/storage';

export function useStorage<T>(
  key: string,
  initialValue: T,
  storageManager: StorageManager = storageUtils.defaultStorage,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = storageManager.get<T>(key);
    return stored !== null ? stored : initialValue;
  });

  useEffect(() => {
    const unsubscribe = storageManager.watch<T>(key, newValue => {
      if (newValue !== null) {
        setValue(newValue);
      }
    });
    return unsubscribe;
  }, [key, storageManager]);

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue(prev => {
        const valueToStore =
          newValue instanceof Function ? newValue(prev) : newValue;
        storageManager.set(key, valueToStore);
        return valueToStore;
      });
    },
    [key, storageManager],
  );

  const removeStoredValue = useCallback(() => {
    storageManager.remove(key);
    setValue(initialValue);
  }, [key, initialValue, storageManager]);

  return [value, setStoredValue, removeStoredValue] as const;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  return useStorage(key, initialValue);
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  const sessionStorage = new StorageManager('drawer', 'session');
  return useStorage(key, initialValue, sessionStorage);
}
