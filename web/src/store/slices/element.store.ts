import { produce } from 'immer';
import { create } from 'zustand';
import { schemaTransformer } from '@/core/schema/transformer';
import type {
  ElementData,
  ElementId,
  ElementNode,
  ProjectConfig,
} from '@/core/schema/types';
import { schemaValidator } from '@/core/schema/validator';

export interface ElementStoreState {
  // 当前项目
  currentProject: ProjectConfig | null;

  // 元素映射表
  elements: Record<ElementId, ElementData>;

  // 元素树根ID
  rootElementId: ElementId | null;

  // 当前选中的元素ID
  selectedElementId: ElementId | null;

  // 当前拖拽的元素ID
  draggingElementId: ElementId | null;

  // 当前悬停的元素ID
  hoveredElementId: ElementId | null;

  // 操作历史
  history: Array<{
    type: string;
    data: any;
    timestamp: number;
  }>;

  // 当前历史索引
  historyIndex: number;

  // 动作
  // 项目相关
  createProject: (config?: Partial<ProjectConfig>) => void;
  updateProject: (updates: Partial<ProjectConfig>) => void;
  deleteProject: () => void;

  // 元素管理
  addElement: (element: ElementData, parentId?: ElementId) => void;
  updateElement: (id: ElementId, updates: Partial<ElementData>) => void;
  deleteElement: (id: ElementId) => void;
  duplicateElement: (id: ElementId) => void;
  moveElement: (id: ElementId, newParentId: ElementId, index?: number) => void;

  // 选择操作
  selectElement: (id: ElementId | null) => void;
  clearSelection: () => void;

  // 拖拽操作
  startDragging: (id: ElementId) => void;
  stopDragging: () => void;

  // 悬停操作
  setHoveredElement: (id: ElementId | null) => void;

  // 历史操作
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  addHistory: (type: string, data: any) => void; // 添加这行

  // 批量操作
  batchUpdate: (updates: Record<ElementId, Partial<ElementData>>) => void;

  // 导入导出
  importProject: (data: any) => void;
  exportProject: () => ProjectConfig;

  // 工具方法
  getElement: (id: ElementId) => ElementData | null;
  getElementTree: (rootId?: ElementId) => ElementNode | null;
  getSelectedElement: () => ElementData | null;
  getElementChildren: (id: ElementId) => ElementData[];
  getElementPath: (id: ElementId) => ElementData[];

  // 验证
  validateElement: (
    id: ElementId,
  ) => ReturnType<typeof schemaValidator.validateElement>;
  validateProject: () => ReturnType<typeof schemaValidator.validateProject>;
}

// 创建元素存储
export const createElementStore = () => {
  return create<ElementStoreState>((set, get) => ({
    // 初始状态
    currentProject: null,
    elements: {},
    rootElementId: null,
    selectedElementId: null,
    draggingElementId: null,
    hoveredElementId: null,
    history: [],
    historyIndex: -1,

    // 项目相关动作
    createProject: config => {
      const now = Date.now();
      const projectId = `project_${now}_${Math.random().toString(36).slice(2, 11)}`;

      const defaultProject: ProjectConfig = {
        id: projectId,
        name: config?.name || '新项目',
        description: config?.description,
        createdAt: now,
        updatedAt: now,
        canvas: {
          id: 'canvas',
          name: '画布',
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          grid: {
            enabled: true,
            size: 20,
            color: '#e8e8e8',
          },
          zoom: {
            current: 1,
            min: 0.1,
            max: 5,
            step: 0.1,
          },
          elements: [],
        },
        elements: {},
        version: '1.0.0',
      };

      const project = { ...defaultProject, ...config };

      set({
        currentProject: project,
        elements: project.elements,
        rootElementId: 'canvas',
        history: [],
        historyIndex: -1,
      });

      // 记录历史
      get().addHistory('createProject', { project });
    },

    updateProject: updates => {
      set(state => {
        if (!state.currentProject) return state;

        const updatedProject = {
          ...state.currentProject,
          ...updates,
          updatedAt: Date.now(),
        };

        return {
          ...state,
          currentProject: updatedProject,
        };
      });

      get().addHistory('updateProject', { updates });
    },

    deleteProject: () => {
      set({
        currentProject: null,
        elements: {},
        rootElementId: null,
        selectedElementId: null,
        draggingElementId: null,
        hoveredElementId: null,
        history: [],
        historyIndex: -1,
      });
    },

    // 元素管理动作
    addElement: (element, parentId) => {
      const { element: sanitized } =
        schemaValidator.validateAndSanitize(element);

      set(state =>
        produce(state, draft => {
          // 添加到元素映射表
          draft.elements[sanitized.id] = sanitized;

          // 设置父元素
          if (parentId && draft.elements[parentId]) {
            sanitized.parentId = parentId;

            // 添加到父元素的子元素列表
            const parent = draft.elements[parentId];
            if (!parent.childrenIds) {
              parent.childrenIds = [];
            }
            parent.childrenIds.push(sanitized.id);
          }

          // 如果是根元素
          if (!parentId && !draft.rootElementId) {
            draft.rootElementId = sanitized.id;
          }

          // 更新项目更新时间
          if (draft.currentProject) {
            draft.currentProject.updatedAt = Date.now();
          }
        }),
      );

      get().addHistory('addElement', { element: sanitized, parentId });
    },

    updateElement: (id, updates) => {
      set(state =>
        produce(state, draft => {
          const element = draft.elements[id];
          if (!element) return;

          // 保存旧状态用于历史记录
          const oldElement = { ...element };

          // 应用更新
          Object.assign(element, updates);
          element.metadata.updatedAt = Date.now();

          // 更新项目更新时间
          if (draft.currentProject) {
            draft.currentProject.updatedAt = Date.now();
          }

          // 记录历史
          get().addHistory('updateElement', {
            id,
            oldElement,
            newElement: element,
          });
        }),
      );
    },

    deleteElement: id => {
      set(state =>
        produce(state, draft => {
          const element = draft.elements[id];
          if (!element) return;

          // 保存用于历史记录
          const deletedElement = { ...element };

          // 从父元素的子元素列表中移除
          if (element.parentId && draft.elements[element.parentId]) {
            const parent = draft.elements[element.parentId];
            if (parent.childrenIds) {
              parent.childrenIds = parent.childrenIds.filter(
                childId => childId !== id,
              );
            }
          }

          // 递归删除子元素
          const deleteChildren = (elementId: ElementId) => {
            const elem = draft.elements[elementId];
            if (elem.childrenIds) {
              elem.childrenIds.forEach(childId => {
                deleteChildren(childId);
              });
            }
            delete draft.elements[elementId];
          };

          deleteChildren(id);

          // 如果删除的是根元素
          if (id === draft.rootElementId) {
            draft.rootElementId = null;
          }

          // 如果删除的是选中的元素
          if (id === draft.selectedElementId) {
            draft.selectedElementId = null;
          }

          // 更新项目更新时间
          if (draft.currentProject) {
            draft.currentProject.updatedAt = Date.now();
          }

          // 记录历史
          get().addHistory('deleteElement', { element: deletedElement });
        }),
      );
    },

    duplicateElement: id => {
      const original = get().elements[id];
      if (!original) return;

      // 创建副本
      const duplicate = {
        ...original,
        id: `element_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        name: `${original.name} 副本`,
        parentId: original.parentId,
        childrenIds: [],
        metadata: {
          ...original.metadata,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      // 添加副本
      get().addElement(duplicate, duplicate.parentId);

      // 递归复制子元素
      const duplicateChildren = (
        parentId: ElementId,
        originalParentId: ElementId,
      ) => {
        const children = get().elements[originalParentId]?.childrenIds || [];

        children.forEach(childId => {
          const child = get().elements[childId];
          if (child) {
            const childDuplicate = {
              ...child,
              id: `element_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
              parentId: parentId,
              childrenIds: [],
              metadata: {
                ...child.metadata,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            };

            get().addElement(childDuplicate, parentId);
            duplicateChildren(childDuplicate.id, childId);
          }
        });
      };

      duplicateChildren(duplicate.id, id);
    },

    moveElement: (id, newParentId, index) => {
      set(state =>
        produce(state, draft => {
          const element = draft.elements[id];
          const newParent = draft.elements[newParentId];

          if (!element || !newParent) return;

          // 从原父元素中移除
          const oldParentId = element.parentId;
          if (oldParentId && draft.elements[oldParentId]) {
            const oldParent = draft.elements[oldParentId];
            if (oldParent.childrenIds) {
              oldParent.childrenIds = oldParent.childrenIds.filter(
                childId => childId !== id,
              );
            }
          }

          // 添加到新父元素
          element.parentId = newParentId;
          if (!newParent.childrenIds) {
            newParent.childrenIds = [];
          }

          if (
            index !== undefined &&
            index >= 0 &&
            index < newParent.childrenIds.length
          ) {
            newParent.childrenIds.splice(index, 0, id);
          } else {
            newParent.childrenIds.push(id);
          }

          // 更新项目更新时间
          if (draft.currentProject) {
            draft.currentProject.updatedAt = Date.now();
          }

          // 记录历史
          get().addHistory('moveElement', {
            id,
            oldParentId,
            newParentId,
            index,
          });
        }),
      );
    },

    // 选择操作
    selectElement: id => {
      set(state => {
        // 先取消之前选中的元素
        const newElements = { ...state.elements };
        if (state.selectedElementId && newElements[state.selectedElementId]) {
          newElements[state.selectedElementId].state.selected = false;
        }

        // 设置新选中的元素
        if (id && newElements[id]) {
          newElements[id].state.selected = true;
        }

        return {
          ...state,
          elements: newElements,
          selectedElementId: id,
        };
      });

      // 触发选择事件
      if (id) {
        window.dispatchEvent(
          new CustomEvent('element:selected', {
            detail: { elementId: id },
          }),
        );
      }
    },

    clearSelection: () => {
      get().selectElement(null);
    },

    // 拖拽操作
    startDragging: id => {
      set({ draggingElementId: id });
    },

    stopDragging: () => {
      set({ draggingElementId: null });
    },

    // 悬停操作
    setHoveredElement: id => {
      set(state => {
        // 先取消之前悬停的元素
        const newElements = { ...state.elements };
        if (state.hoveredElementId && newElements[state.hoveredElementId]) {
          newElements[state.hoveredElementId].state.hovered = false;
        }

        // 设置新悬停的元素
        if (id && newElements[id]) {
          newElements[id].state.hovered = true;
        }

        return {
          ...state,
          elements: newElements,
          hoveredElementId: id,
        };
      });
    },

    // 历史操作
    addHistory: (type: string, data: any) => {
      set(state =>
        produce(state, draft => {
          // 移除当前索引之后的历史记录
          draft.history = draft.history.slice(0, draft.historyIndex + 1);

          // 添加新记录
          draft.history.push({
            type,
            data,
            timestamp: Date.now(),
          });

          // 更新索引
          draft.historyIndex = draft.history.length - 1;

          // 限制历史记录数量
          const MAX_HISTORY = 100;
          if (draft.history.length > MAX_HISTORY) {
            draft.history = draft.history.slice(-MAX_HISTORY);
            draft.historyIndex = draft.history.length - 1;
          }
        }),
      );
    },

    undo: () => {
      set(state => {
        if (state.historyIndex < 0) return state;

        // TODO: 实现撤销逻辑
        console.log('Undo:', state.history[state.historyIndex]);

        return {
          ...state,
          historyIndex: state.historyIndex - 1,
        };
      });
    },

    redo: () => {
      set(state => {
        if (state.historyIndex >= state.history.length - 1) return state;

        // TODO: 实现重做逻辑
        console.log('Redo:', state.history[state.historyIndex + 1]);

        return {
          ...state,
          historyIndex: state.historyIndex + 1,
        };
      });
    },

    clearHistory: () => {
      set({
        history: [],
        historyIndex: -1,
      });
    },

    // 批量操作
    batchUpdate: updates => {
      set(state =>
        produce(state, draft => {
          Object.entries(updates).forEach(([id, update]) => {
            const element = draft.elements[id];
            if (element) {
              Object.assign(element, update);
              element.metadata.updatedAt = Date.now();
            }
          });

          if (draft.currentProject) {
            draft.currentProject.updatedAt = Date.now();
          }
        }),
      );

      get().addHistory('batchUpdate', { updates });
    },

    // 导入导出
    importProject: data => {
      try {
        const project = schemaTransformer.simpleToProject(data);
        const result = schemaValidator.validateProject(project);

        if (!result.valid) {
          console.error('Invalid project data:', result.errors);
          return;
        }

        set({
          currentProject: project,
          elements: project.elements,
          rootElementId: 'canvas',
          selectedElementId: null,
          draggingElementId: null,
          hoveredElementId: null,
          history: [],
          historyIndex: -1,
        });

        get().addHistory('importProject', { project });
      } catch (error) {
        console.error('Failed to import project:', error);
      }
    },

    exportProject: () => {
      const state = get();

      if (!state.currentProject) {
        throw new Error('No project to export');
      }

      const project = {
        ...state.currentProject,
        elements: state.elements,
        updatedAt: Date.now(),
      };

      return schemaTransformer.projectToSimple(project);
    },

    // 工具方法
    getElement: id => {
      return get().elements[id] || null;
    },

    getElementTree: rootId => {
      const rootElementId = rootId || get().rootElementId;
      if (!rootElementId) return null;

      const buildTree = (elementId: ElementId): ElementNode | null => {
        const element = get().elements[elementId];
        if (!element) return null;

        const node: ElementNode = {
          ...element,
          children: [],
        };

        if (element.childrenIds) {
          element.childrenIds.forEach(childId => {
            const childNode = buildTree(childId);
            if (childNode) {
              node.children!.push(childNode);
            }
          });
        }

        return node;
      };

      return buildTree(rootElementId);
    },

    getSelectedElement: () => {
      const selectedId = get().selectedElementId;
      return selectedId ? get().elements[selectedId] || null : null;
    },

    getElementChildren: id => {
      const element = get().elements[id];
      if (!element || !element.childrenIds) return [];

      return element.childrenIds
        .map(childId => get().elements[childId])
        .filter(Boolean) as ElementData[];
    },

    getElementPath: id => {
      const path: ElementData[] = [];
      let currentId: ElementId | undefined = id;

      while (currentId) {
        const element: ElementData | undefined = get().elements[currentId];
        if (!element) break;

        path.unshift(element);
        currentId = element.parentId;
      }

      return path;
    },

    // 验证
    validateElement: id => {
      const element = get().elements[id];
      if (!element) {
        return {
          valid: false,
          errors: [
            {
              field: 'id',
              message: 'Element not found',
              code: 'ELEMENT_NOT_FOUND',
            },
          ],
          warnings: [],
        };
      }

      return schemaValidator.validateElement(element);
    },

    validateProject: () => {
      const project = get().currentProject;
      if (!project) {
        return {
          valid: false,
          errors: [
            {
              field: 'project',
              message: 'No project loaded',
              code: 'PROJECT_NOT_LOADED',
            },
          ],
          warnings: [],
        };
      }

      return schemaValidator.validateProject(project);
    },
  }));
};
