import { useEffect, useRef } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Document | HTMLElement = window,
  options?: boolean | AddEventListenerOptions,
) {
  const savedHandler = useRef(handler);
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect(() => {
    if (!element || !element.addEventListener) return;
    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };
    element.addEventListener(eventName, eventListener, options);
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
  } = {},
) {
  useEventListener('keydown', (event: KeyboardEvent) => {
    const { ctrl, shift, alt, meta, preventDefault = true } = options;

    if (event.key.toLowerCase() !== key.toLowerCase()) return;
    if (ctrl && !event.ctrlKey) return;
    if (shift && !event.shiftKey) return;
    if (alt && !event.altKey) return;
    if (meta && !event.metaKey) return;
    if (preventDefault) {
      event.preventDefault();
    }
    callback(event);
  });
}
