import { create } from 'zustand';
import type { ElementStyle } from '@/core/schema/types';

// 定义面板配置接口
interface BasePanelConfig {
  visible: boolean;
}

interface WidthPanelConfig extends BasePanelConfig {
  width: number;
  minWidth: number;
  maxWidth: number;
}

interface HeightPanelConfig extends BasePanelConfig {
  height: number;
  minHeight: number;
  maxHeight: number;
}

// 控制面板状态接口
export interface ControlStoreState {
  // 面板配置 - 使用明确的接口类型
  panels: {
    properties: WidthPanelConfig;
    layers: WidthPanelConfig;
    library: WidthPanelConfig;
    tools: HeightPanelConfig;
  };

  // 当前编辑的样式属性
  editingStyle: Partial<ElementStyle> | null;

  // 当前编辑的属性
  editingProps: Record<string, any> | null;

  // 样式预设
  stylePresets: {
    name: string;
    style: Partial<ElementStyle>;
  }[];

  // 动作
  // 面板控制 - 参数类型更明确
  togglePanel: (panel: keyof ControlStoreState['panels']) => void;
  setPanelWidth: (
    panel: 'properties' | 'layers' | 'library',
    width: number,
  ) => void;
  setPanelHeight: (panel: 'tools', height: number) => void;

  // 样式编辑
  setEditingStyle: (style: Partial<ElementStyle> | null) => void;
  updateEditingStyle: (updates: Partial<ElementStyle>) => void;
  clearEditingStyle: () => void;

  // 属性编辑
  setEditingProps: (props: Record<string, any> | null) => void;
  updateEditingProps: (updates: Record<string, any>) => void;
  clearEditingProps: () => void;

  // 样式预设
  addStylePreset: (name: string, style: Partial<ElementStyle>) => void;
  removeStylePreset: (name: string) => void;
  applyStylePreset: (name: string) => void;
  updateStylePreset: (name: string, style: Partial<ElementStyle>) => void;

  // 工具方法
  getActivePanels: () => Array<{
    name: keyof ControlStoreState['panels'];
    visible: boolean;
  }>;

  getPanelVisibility: (panel: keyof ControlStoreState['panels']) => boolean;
}

// 创建控制面板存储
export const createControlStore = () => {
  return create<ControlStoreState>((set, get) => ({
    // 初始状态
    panels: {
      properties: {
        visible: true,
        width: 320,
        minWidth: 240,
        maxWidth: 480,
      },

      layers: {
        visible: true,
        width: 280,
        minWidth: 200,
        maxWidth: 360,
      },

      library: {
        visible: true,
        width: 240,
        minWidth: 200,
        maxWidth: 320,
      },

      tools: {
        visible: true,
        height: 48,
        minHeight: 40,
        maxHeight: 80,
      },
    },

    editingStyle: null,
    editingProps: null,

    stylePresets: [
      {
        name: 'Primary Button',
        style: {
          backgroundColor: '#1677ff',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
      {
        name: 'Card',
        style: {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '16px',
        },
      },
      {
        name: 'Heading',
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '16px',
        },
      },
    ],

    // 面板控制动作
    togglePanel: panel => {
      set(state => ({
        panels: {
          ...state.panels,
          [panel]: {
            ...state.panels[panel],
            visible: !state.panels[panel].visible,
          },
        },
      }));
    },

    setPanelWidth: (panel, width) => {
      set(state => {
        const panelConfig = state.panels[panel];

        const clampedWidth = Math.max(
          panelConfig.minWidth,
          Math.min(width, panelConfig.maxWidth),
        );

        return {
          panels: {
            ...state.panels,
            [panel]: {
              ...panelConfig,
              width: clampedWidth,
            },
          },
        };
      });
    },

    setPanelHeight: (panel, height) => {
      set(state => {
        const panelConfig = state.panels[panel];

        const clampedHeight = Math.max(
          panelConfig.minHeight,
          Math.min(height, panelConfig.maxHeight),
        );

        return {
          panels: {
            ...state.panels,
            [panel]: {
              ...panelConfig,
              height: clampedHeight,
            },
          },
        };
      });
    },

    // 样式编辑动作
    setEditingStyle: style => {
      set({ editingStyle: style });
    },

    updateEditingStyle: updates => {
      set(state => ({
        editingStyle: state.editingStyle
          ? { ...state.editingStyle, ...updates }
          : updates,
      }));
    },

    clearEditingStyle: () => {
      set({ editingStyle: null });
    },

    // 属性编辑动作
    setEditingProps: props => {
      set({ editingProps: props });
    },

    updateEditingProps: updates => {
      set(state => ({
        editingProps: state.editingProps
          ? { ...state.editingProps, ...updates }
          : updates,
      }));
    },

    clearEditingProps: () => {
      set({ editingProps: null });
    },

    // 样式预设动作
    addStylePreset: (name, style) => {
      set(state => {
        // 检查是否已存在
        const exists = state.stylePresets.some(preset => preset.name === name);
        if (exists) {
          console.warn(`Style preset "${name}" already exists`);
          return state;
        }

        return {
          stylePresets: [...state.stylePresets, { name, style }],
        };
      });
    },

    removeStylePreset: name => {
      set(state => ({
        stylePresets: state.stylePresets.filter(preset => preset.name !== name),
      }));
    },

    applyStylePreset: name => {
      const preset = get().stylePresets.find(preset => preset.name === name);
      if (preset) {
        get().setEditingStyle(preset.style);
      }
    },

    updateStylePreset: (name, style) => {
      set(state => ({
        stylePresets: state.stylePresets.map(preset =>
          preset.name === name ? { ...preset, style } : preset,
        ),
      }));
    },

    // 工具方法
    getActivePanels: () => {
      const panels = get().panels;
      return Object.entries(panels).map(([name, config]) => ({
        name: name as keyof ControlStoreState['panels'],
        visible: config.visible,
      }));
    },

    getPanelVisibility: panel => {
      return get().panels[panel]?.visible || false;
    },
  }));
};
