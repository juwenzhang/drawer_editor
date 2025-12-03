import { useMemo } from 'react';
import { createControlStore } from '../slices/control.store';

let controlStore: ReturnType<typeof createControlStore>;

function initializeControlStore() {
  if (!controlStore) {
    controlStore = createControlStore();
  }
  return controlStore;
}

export function useControlStore() {
  const store = useMemo(() => initializeControlStore(), []);
  return store;
}

// 选择器 Hook
export function usePanels() {
  return useControlStore()(state => state.panels);
}

export function useEditingStyle() {
  return useControlStore()(state => state.editingStyle);
}

export function useEditingProps() {
  return useControlStore()(state => state.editingProps);
}

export function useStylePresets() {
  return useControlStore()(state => state.stylePresets);
}

export function useActivePanels() {
  return useControlStore()(state => state.getActivePanels());
}

export function useControlActions() {
  const store = useControlStore();

  return useMemo(
    () => ({
      // 面板控制
      togglePanel: store.getState().togglePanel,
      setPanelWidth: store.getState().setPanelWidth,
      setPanelHeight: store.getState().setPanelHeight,

      // 样式编辑
      setEditingStyle: store.getState().setEditingStyle,
      updateEditingStyle: store.getState().updateEditingStyle,
      clearEditingStyle: store.getState().clearEditingStyle,

      // 属性编辑
      setEditingProps: store.getState().setEditingProps,
      updateEditingProps: store.getState().updateEditingProps,
      clearEditingProps: store.getState().clearEditingProps,

      // 样式预设
      addStylePreset: store.getState().addStylePreset,
      removeStylePreset: store.getState().removeStylePreset,
      applyStylePreset: store.getState().applyStylePreset,
      updateStylePreset: store.getState().updateStylePreset,

      // 工具方法
      getActivePanels: store.getState().getActivePanels,
      getPanelVisibility: store.getState().getPanelVisibility,
    }),
    [store],
  );
}

// 导出存储实例
export { controlStore };
