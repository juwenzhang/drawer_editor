import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type RenderContext,
  type RenderOptions,
  renderEngine,
} from '@/core/render/engine';
import type { ElementData, ElementNode } from '@/core/schema/types';
import { useTheme } from './useTheme';
import { useWorklet } from './useWorklet';

export interface UseRendererOptions extends Partial<RenderOptions> {
  // 自动检测工作体支持
  autoDetectWorklet?: boolean;
  // 默认渲染模式
  defaultMode?: 'dom' | 'canvas' | 'worklet' | 'auto';
  // 是否启用编辑模式
  editable?: boolean;
}

export function useRenderer(options: UseRendererOptions = {}) {
  const {
    autoDetectWorklet = true,
    defaultMode = 'auto',
    editable = false,
    ...renderOptions
  } = options;

  const { resolvedTheme } = useTheme();
  const worklet = useWorklet();
  const [renderMode, setRenderMode] = useState<
    'dom' | 'canvas' | 'worklet' | 'auto'
  >(defaultMode);
  const [zoom, setZoom] = useState(1);
  const [showGuides, setShowGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // 渲染上下文
  const renderContext = useMemo<RenderContext>(
    () => ({
      mode: renderMode,
      theme: resolvedTheme,
      zoom,
      isEditing: editable,
      showGuides,
      showGrid,
    }),
    [renderMode, resolvedTheme, zoom, editable, showGuides, showGrid],
  );

  // 自动检测工作体支持
  useEffect(() => {
    if (autoDetectWorklet) {
      if (worklet.isAllLoaded && renderMode === 'auto') {
        setRenderMode('worklet');
      } else if (renderMode === 'worklet' && !worklet.isAllLoaded) {
        setRenderMode('dom');
      }
    }
  }, [worklet.isAllLoaded, autoDetectWorklet, renderMode]);

  // 渲染单个元素
  const render = useCallback(
    (element: ElementData, customOptions?: Partial<RenderOptions>) => {
      const mergedOptions = { ...renderOptions, ...customOptions };
      return renderEngine.render(element, renderContext, mergedOptions);
    },
    [renderContext, renderOptions],
  );

  // 批量渲染元素
  const renderAll = useCallback(
    (elements: ElementData[], customOptions?: Partial<RenderOptions>) => {
      const mergedOptions = { ...renderOptions, ...customOptions };
      return renderEngine.renderAll(elements, renderContext, mergedOptions);
    },
    [renderContext, renderOptions],
  );

  // 渲染元素树
  const renderTree = useCallback(
    (root: ElementNode, customOptions?: Partial<RenderOptions>) => {
      // 展平树结构并渲染
      const flattenTree = (node: ElementNode): ElementData[] => {
        const elements: ElementData[] = [node];

        if (node.children) {
          node.children.forEach(child => {
            elements.push(...flattenTree(child));
          });
        }

        return elements;
      };

      const elements = flattenTree(root);
      return renderAll(elements, customOptions);
    },
    [renderAll],
  );

  // 切换渲染模式
  const toggleRenderMode = useCallback(() => {
    setRenderMode(current => {
      switch (current) {
        case 'dom':
          return 'worklet';
        case 'worklet':
          return 'canvas';
        case 'canvas':
          return 'dom';
        default:
          return 'auto';
      }
    });
  }, []);

  // 设置渲染模式
  const setCustomRenderMode = useCallback(
    (mode: 'dom' | 'canvas' | 'worklet' | 'auto') => {
      setRenderMode(mode);
    },
    [],
  );

  // 缩放控制
  const zoomIn = useCallback(() => {
    setZoom(current => Math.min(current + 0.1, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(current => Math.max(current - 0.1, 0.1));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const setCustomZoom = useCallback((value: number) => {
    setZoom(Math.max(0.1, Math.min(value, 3)));
  }, []);

  const registerRenderer = useCallback(
    (
      type: string,
      renderer: (
        element: ElementData,
        context: RenderContext,
      ) => React.ReactElement,
    ) => {
      const engine = renderEngine.getInstance(renderContext, renderOptions);
      engine.registerRenderer(type, renderer);
    },
    [renderContext, renderOptions],
  );

  return {
    renderMode,
    zoom,
    showGuides,
    showGrid,
    renderContext,

    render,
    renderAll,
    renderTree,

    toggleRenderMode,
    setRenderMode: setCustomRenderMode,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom: setCustomZoom,
    setShowGuides,
    setShowGrid,
    registerRenderer,

    isDomMode: renderMode === 'dom',
    isCanvasMode: renderMode === 'canvas',
    isWorkletMode: renderMode === 'worklet',
    isAutoMode: renderMode === 'auto',
    canUseWorklet: worklet.isAllLoaded && renderMode !== 'dom',
  };
}
