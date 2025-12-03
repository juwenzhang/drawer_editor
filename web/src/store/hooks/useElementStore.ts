import { useMemo } from 'react';
import { createElementStore } from '../slices/element.store';

let elementStore: ReturnType<typeof createElementStore>;

function initializeElementStore() {
  if (!elementStore) {
    elementStore = createElementStore();
  }
  return elementStore;
}

export function useElementStore() {
  const store = useMemo(() => initializeElementStore(), []);
  return store;
}

export function useElements() {
  return useElementStore()(state => state.elements);
}

export function useSelectedElement() {
  return useElementStore()(state => state.selectedElementId);
}

// 动作 Hook
export function useElementActions() {
  const store = useElementStore();

  return useMemo(
    () => ({
      addElement: store.getState().addElement,
      updateElement: store.getState().updateElement,
      deleteElement: store.getState().deleteElement,
      selectElement: store.getState().selectElement,
      clearSelection: store.getState().clearSelection,
      moveElement: store.getState().moveElement,
      duplicateElement: store.getState().duplicateElement,
      createProject: store.getState().createProject,
      updateProject: store.getState().updateProject,
      deleteProject: store.getState().deleteProject,
      exportProject: store.getState().exportProject,
      importProject: store.getState().importProject,
    }),
    [store],
  );
}

export { elementStore };
