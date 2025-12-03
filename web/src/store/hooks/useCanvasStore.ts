import { useMemo } from 'react';
import { createCanvasStore } from '../slices/canvas.store';

let canvasStore: ReturnType<typeof createCanvasStore>;

function initializeCanvasStore() {
  if (!canvasStore) {
    canvasStore = createCanvasStore();
  }
  return canvasStore;
}

export function useCanvasStore() {
  const store = useMemo(() => initializeCanvasStore(), []);
  return store;
}

export function useRulers() {
  return useCanvasStore()(state => state.rulers);
}

export function useGrid() {
  return useCanvasStore()(state => state.grid);
}

// 动作 Hook
export function useCanvasActions() {
  const store = useCanvasStore();

  return useMemo(
    () => ({
      resetViewport: store.getState().resetViewport,
      setZoom: store.getState().setZoom,
      zoomIn: store.getState().zoomIn,
      zoomOut: store.getState().zoomOut,
      resetZoom: store.getState().resetZoom,
      setCanvasSize: store.getState().setCanvasSize,
      toggleGrid: store.getState().toggleGrid,
    }),
    [store],
  );
}

export { canvasStore };
