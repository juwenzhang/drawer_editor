import { produce } from 'immer';
import { create } from 'zustand';

// 画布状态接口
export interface CanvasStoreState {
  // 画布尺寸
  width: number;
  height: number;

  // 视口位置
  viewportX: number;
  viewportY: number;

  // 缩放级别
  zoom: number;
  minZoom: number;
  maxZoom: number;
  zoomStep: number;

  // 网格配置
  grid: {
    enabled: boolean;
    size: number;
    color: string;
    snapToGrid: boolean;
  };

  // 标尺配置
  rulers: {
    enabled: boolean;
    color: string;
    fontSize: number;
  };

  // 辅助线
  guides: {
    enabled: boolean;
    color: string;
    snapToGuides: boolean;
  };

  // 编辑模式
  editMode: 'select' | 'drag' | 'draw' | 'text' | 'shape';

  // 工具状态
  tools: {
    // 选择工具
    selection: {
      active: boolean;
      marquee: {
        x: number;
        y: number;
        width: number;
        height: number;
      } | null;
    };

    // 绘图工具
    drawing: {
      active: boolean;
      type: 'rectangle' | 'circle' | 'line' | 'path';
      color: string;
      strokeWidth: number;
    };
  };

  // 动作
  // 画布控制
  setCanvasSize: (width: number, height: number) => void;
  moveViewport: (x: number, y: number) => void;
  resetViewport: () => void;

  // 缩放控制
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;

  // 网格控制
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  setGridColor: (color: string) => void;
  toggleSnapToGrid: () => void;

  // 标尺控制
  toggleRulers: () => void;
  setRulerColor: (color: string) => void;
  setRulerFontSize: (size: number) => void;

  // 辅助线控制
  toggleGuides: () => void;
  setGuideColor: (color: string) => void;
  toggleSnapToGuides: () => void;

  // 编辑模式控制
  setEditMode: (mode: CanvasStoreState['editMode']) => void;

  // 工具控制
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;

  startDrawing: (type: CanvasStoreState['tools']['drawing']['type']) => void;
  updateDrawing: (x: number, y: number) => void;
  endDrawing: () => void;

  // 坐标转换
  screenToCanvas: (
    screenX: number,
    screenY: number,
  ) => { x: number; y: number };
  canvasToScreen: (
    canvasX: number,
    canvasY: number,
  ) => { x: number; y: number };

  // 工具方法
  getViewportBounds: () => {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  isInViewport: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => boolean;
}

// 创建画布存储
export const createCanvasStore = () => {
  return create<CanvasStoreState>((set, get) => ({
    // 初始状态
    width: 800,
    height: 600,

    viewportX: 0,
    viewportY: 0,

    zoom: 1,
    minZoom: 0.1,
    maxZoom: 5,
    zoomStep: 0.1,

    grid: {
      enabled: true,
      size: 20,
      color: '#e8e8e8',
      snapToGrid: true,
    },

    rulers: {
      enabled: true,
      color: '#999999',
      fontSize: 12,
    },

    guides: {
      enabled: true,
      color: '#1677ff',
      snapToGuides: true,
    },

    editMode: 'select',

    tools: {
      selection: {
        active: false,
        marquee: null,
      },

      drawing: {
        active: false,
        type: 'rectangle',
        color: '#1677ff',
        strokeWidth: 2,
      },
    },

    // 画布控制动作
    setCanvasSize: (width, height) => {
      set({ width, height });
    },

    moveViewport: (x, y) => {
      set({ viewportX: x, viewportY: y });
    },

    resetViewport: () => {
      set({ viewportX: 0, viewportY: 0 });
    },

    // 缩放控制动作
    zoomIn: () => {
      set(state => ({
        zoom: Math.min(state.zoom + state.zoomStep, state.maxZoom),
      }));
    },

    zoomOut: () => {
      set(state => ({
        zoom: Math.max(state.zoom - state.zoomStep, state.minZoom),
      }));
    },

    setZoom: zoom => {
      set(state => ({
        zoom: Math.max(state.minZoom, Math.min(zoom, state.maxZoom)),
      }));
    },

    resetZoom: () => {
      set({ zoom: 1 });
    },

    // 网格控制动作
    toggleGrid: () => {
      set(state => ({
        grid: { ...state.grid, enabled: !state.grid.enabled },
      }));
    },

    setGridSize: size => {
      set(state => ({
        grid: { ...state.grid, size },
      }));
    },

    setGridColor: color => {
      set(state => ({
        grid: { ...state.grid, color },
      }));
    },

    toggleSnapToGrid: () => {
      set(state => ({
        grid: { ...state.grid, snapToGrid: !state.grid.snapToGrid },
      }));
    },

    // 标尺控制动作
    toggleRulers: () => {
      set(state => ({
        rulers: { ...state.rulers, enabled: !state.rulers.enabled },
      }));
    },

    setRulerColor: color => {
      set(state => ({
        rulers: { ...state.rulers, color },
      }));
    },

    setRulerFontSize: size => {
      set(state => ({
        rulers: { ...state.rulers, fontSize: size },
      }));
    },

    // 辅助线控制动作
    toggleGuides: () => {
      set(state => ({
        guides: { ...state.guides, enabled: !state.guides.enabled },
      }));
    },

    setGuideColor: color => {
      set(state => ({
        guides: { ...state.guides, color },
      }));
    },

    toggleSnapToGuides: () => {
      set(state => ({
        guides: { ...state.guides, snapToGuides: !state.guides.snapToGuides },
      }));
    },

    // 编辑模式控制动作
    setEditMode: mode => {
      set({ editMode: mode });
    },

    // 工具控制动作
    startSelection: (x, y) => {
      set({
        editMode: 'select',
        tools: {
          ...get().tools,
          selection: {
            active: true,
            marquee: { x, y, width: 0, height: 0 },
          },
        },
      });
    },

    updateSelection: (x, y) => {
      set(state => {
        if (!state.tools.selection.active || !state.tools.selection.marquee) {
          return state;
        }

        const marquee = state.tools.selection.marquee;
        const width = x - marquee.x;
        const height = y - marquee.y;

        return produce(state, draft => {
          if (draft.tools.selection.marquee) {
            draft.tools.selection.marquee.width = width;
            draft.tools.selection.marquee.height = height;
          }
        });
      });
    },

    endSelection: () => {
      set(state => ({
        tools: {
          ...state.tools,
          selection: {
            ...state.tools.selection,
            active: false,
            marquee: null,
          },
        },
      }));
    },

    startDrawing: type => {
      set({
        editMode: 'draw',
        tools: {
          ...get().tools,
          drawing: {
            ...get().tools.drawing,
            active: true,
            type,
          },
        },
      });
    },

    updateDrawing: (x, y) => {
      // 实现绘图更新逻辑
      console.log('Update drawing:', x, y);
    },

    endDrawing: () => {
      set(state => ({
        tools: {
          ...state.tools,
          drawing: {
            ...state.tools.drawing,
            active: false,
          },
        },
      }));
    },

    // 坐标转换方法
    screenToCanvas: (screenX, screenY) => {
      const state = get();
      const x = (screenX - state.viewportX) / state.zoom;
      const y = (screenY - state.viewportY) / state.zoom;
      return { x, y };
    },

    canvasToScreen: (canvasX, canvasY) => {
      const state = get();
      const x = canvasX * state.zoom + state.viewportX;
      const y = canvasY * state.zoom + state.viewportY;
      return { x, y };
    },

    // 工具方法
    getViewportBounds: () => {
      const state = get();
      return {
        x: -state.viewportX / state.zoom,
        y: -state.viewportY / state.zoom,
        width: state.width / state.zoom,
        height: state.height / state.zoom,
      };
    },

    isInViewport: (x, y, width, height) => {
      const viewport = get().getViewportBounds();

      return (
        x + width > viewport.x &&
        x < viewport.x + viewport.width &&
        y + height > viewport.y &&
        y < viewport.y + viewport.height
      );
    },
  }));
};
