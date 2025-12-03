import { debounce as lodashDebounce } from 'lodash-es';
import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const debouncedFn = useCallback(
    lodashDebounce((...args: any[]) => fnRef.current(...args), delay),
    [delay],
  );
  return debouncedFn as unknown as T;
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  deps: any[] = [],
): [T, () => void] {
  const fnRef = useRef(fn);
  const debouncedRef = useRef<ReturnType<typeof lodashDebounce>>();
  fnRef.current = fn;
  const debouncedFn = useCallback(
    (...args: any[]) => {
      if (!debouncedRef.current) {
        debouncedRef.current = lodashDebounce(
          (...args: any[]) => fnRef.current(...args),
          delay,
        );
      }
      return debouncedRef.current(...args);
    },
    [delay, ...deps],
  );
  const cancel = useCallback(() => {
    if (debouncedRef.current) {
      debouncedRef.current.cancel();
    }
  }, []);

  return [debouncedFn as T, cancel];
}
