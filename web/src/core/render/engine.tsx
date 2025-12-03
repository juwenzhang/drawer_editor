import React, {
  type CSSProperties,
  createElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { workletLoader } from '@/utils/worklet/loader';
import {
  type ElementData,
  type ElementStyle,
  ElementTypes,
} from '../schema/types';

// 渲染上下文
export interface RenderContext {
  // 渲染模式
  mode: 'dom' | 'canvas' | 'worklet' | 'auto';
  // 主题
  theme: 'light' | 'dark';
  // 缩放比例
  zoom: number;
  // 是否处于编辑模式
  isEditing: boolean;
  // 是否显示辅助线
  showGuides: boolean;
  // 是否显示网格
  showGrid: boolean;
  // 自定义渲染器
  customRenderers?: Record<string, RenderFunction>;
}

// 渲染函数类型
export type RenderFunction = (
  element: ElementData,
  context: RenderContext,
  children?: ReactNode[],
) => ReactElement | null;

// 渲染选项
export interface RenderOptions extends Partial<RenderContext> {
  // 是否递归渲染子元素
  recursive?: boolean;
  // 最大递归深度
  maxDepth?: number;
  // 错误处理
  onError?: (error: Error, element: ElementData) => void;
}

// 默认渲染上下文
const DEFAULT_CONTEXT: RenderContext = {
  mode: 'auto',
  theme: 'light',
  zoom: 1,
  isEditing: false,
  showGuides: false,
  showGrid: false,
};

// 默认渲染选项
const DEFAULT_OPTIONS: RenderOptions = {
  recursive: true,
  maxDepth: 20,
};

// 渲染器类
export class RenderEngine {
  private context: RenderContext;
  private options: RenderOptions;
  private depth: number = 0;
  private customRenderers: Map<string, RenderFunction> = new Map();

  constructor(context?: Partial<RenderContext>, options?: RenderOptions) {
    this.context = { ...DEFAULT_CONTEXT, ...context };
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  // 更新上下文
  updateContext(context: Partial<RenderContext>): void {
    this.context = { ...this.context, ...context };
  }

  // 更新选项
  updateOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // 注册自定义渲染器
  registerRenderer(type: string, renderer: RenderFunction): void {
    this.customRenderers.set(type, renderer);
  }

  // 注销自定义渲染器
  unregisterRenderer(type: string): void {
    this.customRenderers.delete(type);
  }

  // 渲染元素
  render(element: ElementData): ReactElement | null {
    try {
      // 检查递归深度
      if (this.depth >= (this.options.maxDepth || 20)) {
        console.warn('Maximum render depth exceeded', element);
        return null;
      }

      this.depth++;

      // 处理隐藏元素
      if (element.state?.hidden) {
        return null;
      }

      // 检查自定义渲染器
      const customRenderer = this.customRenderers.get(element.type);
      if (customRenderer) {
        const children = this.options.recursive
          ? this.renderChildren(element)
          : undefined;

        return customRenderer(element, this.context, children);
      }

      // 使用内置渲染器
      const renderer = this.getBuiltInRenderer(element.type);
      const children = this.options.recursive
        ? this.renderChildren(element)
        : undefined;

      const result = renderer(element, this.context, children);

      this.depth--;
      return result;
    } catch (error) {
      this.depth--;

      if (this.options.onError) {
        this.options.onError(error as Error, element);
      } else {
        console.error('Render error:', error, element);
      }

      return null;
    }
  }

  // 渲染子元素
  private renderChildren(element: ElementData): ReactNode[] | undefined {
    if (!element.childrenIds || element.childrenIds.length === 0) {
      return undefined;
    }

    // 注意：这里需要从全局状态中获取子元素数据
    // 实际项目中应该从 store 中获取
    return undefined;
  }

  // 获取内置渲染器
  private getBuiltInRenderer(type: string): RenderFunction {
    const renderers: Record<string, RenderFunction> = {
      [ElementTypes.CONTAINER]: this.renderContainer.bind(this),
      [ElementTypes.TEXT]: this.renderText.bind(this),
      [ElementTypes.IMAGE]: this.renderImage.bind(this),
      [ElementTypes.BUTTON]: this.renderButton.bind(this),
      [ElementTypes.INPUT]: this.renderInput.bind(this),
      [ElementTypes.RECTANGLE]: this.renderRectangle.bind(this),
      [ElementTypes.CIRCLE]: this.renderCircle.bind(this),
      [ElementTypes.FLEX]: this.renderFlex.bind(this),
      [ElementTypes.GRID]: this.renderGrid.bind(this),
      [ElementTypes.CANVAS]: this.renderCanvas.bind(this),
      [ElementTypes.WORKLET]: this.renderWorklet.bind(this),
    };

    return renderers[type] || this.renderContainer.bind(this);
  }

  // 渲染容器
  private renderContainer(
    element: ElementData,
    context: RenderContext,
    children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    return createElement('div', props, children);
  }

  // 渲染文本
  private renderText(
    element: ElementData,
    context: RenderContext,
    _children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    const content = element.props?.content || '';

    // 如果是工作体模式且支持
    if (context.mode === 'worklet' || context.mode === 'auto') {
      if (workletLoader.isWorkletLoaded('text-renderer')) {
        props.style = {
          ...props.style,
          '--text-content': content,
          '--text-color': element.style?.color || 'currentColor',
          '--font-size': element.style?.fontSize || '16px',
          '--font-family': element.style?.fontFamily || 'inherit',
          '--font-weight': element.style?.fontWeight || 'normal',
          backgroundImage: 'paint(textRenderer)',
        };
      }
    }

    return createElement('span', props, content);
  }

  // 渲染图片
  private renderImage(
    element: ElementData,
    context: RenderContext,
    _children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    props.src = element.props?.src || '';
    props.alt = element.props?.alt || '';

    return createElement('img', props);
  }

  // 渲染按钮
  private renderButton(
    element: ElementData,
    context: RenderContext,
    children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    const text = element.props?.text || '';

    return createElement('button', props, children || text);
  }

  // 渲染输入框
  private renderInput(
    element: ElementData,
    context: RenderContext,
    _children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);

    // 设置输入框属性
    props.type = element.props?.type || 'text';
    props.placeholder = element.props?.placeholder || '';
    props.value = element.props?.value || '';
    props.disabled = element.props?.disabled || false;

    return createElement('input', props);
  }

  // 渲染矩形
  private renderRectangle(
    element: ElementData,
    context: RenderContext,
    children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    return createElement('div', props, children);
  }

  // 渲染圆形
  private renderCircle(
    element: ElementData,
    context: RenderContext,
    children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    return createElement('div', props, children);
  }

  // 渲染Flex容器
  private renderFlex(
    element: ElementData,
    context: RenderContext,
    children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    return createElement('div', props, children);
  }

  // 渲染Grid容器
  private renderGrid(
    element: ElementData,
    context: RenderContext,
    children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    return createElement('div', props, children);
  }

  // 渲染画布
  private renderCanvas(
    element: ElementData,
    context: RenderContext,
    _children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);

    // 如果是工作体模式，使用工作体渲染
    if (
      (context.mode === 'worklet' || context.mode === 'auto') &&
      workletLoader.isWorkletLoaded('canvas-engine')
    ) {
      props.style = {
        ...props.style,
        '--canvas-type': 'gradient',
        '--canvas-data': JSON.stringify({
          type: 'linear',
          colors: [
            { color: '#1677ff', stop: '0%' },
            { color: '#52c41a', stop: '100%' },
          ],
        }),
        backgroundImage: 'paint(canvasEngine)',
      };
    }

    return createElement('div', props);
  }

  private renderWorklet(
    element: ElementData,
    context: RenderContext,
    _children?: ReactNode[],
  ): ReactElement {
    const props = this.createElementProps(element, context);
    const workletType = element.props?.workletType || 'text';

    if (workletLoader.isWorkletLoaded(`${workletType}-renderer` as any)) {
      props.style = {
        ...props.style,
        '--worklet-type': workletType,
        '--worklet-data': JSON.stringify(element.props?.workletData || {}),
        backgroundImage: `paint(${workletType}Renderer)`,
      };
    }

    return createElement('div', props);
  }

  // 创建元素属性
  private createElementProps(
    element: ElementData,
    context: RenderContext,
  ): Record<string, any> {
    const props: Record<string, any> = {
      key: element.id,
      'data-element-id': element.id,
      'data-element-type': element.type,
      className: this.createElementClass(element, context),
      style: this.createElementStyle(element, context),
      onClick: this.handleElementClick.bind(this, element),
      onMouseEnter: this.handleElementMouseEnter.bind(this, element),
      onMouseLeave: this.handleElementMouseLeave.bind(this, element),
    };
    // 合并自定义属性
    if (element.props) {
      Object.assign(props, element.props);
    }
    // 处理数据属性
    if (element.data) {
      Object.entries(element.data).forEach(([key, value]) => {
        props[`data-${key}`] = value;
      });
    }

    return props;
  }

  private createElementClass(
    element: ElementData,
    context: RenderContext,
  ): string {
    const classes: string[] = [];
    // 基础类名
    classes.push('editor-element');
    classes.push(`element-${element.type}`);
    // 状态类名
    if (element.state?.selected) {
      classes.push('element-selected');
    }
    if (element.state?.hovered) {
      classes.push('element-hovered');
    }
    if (element.state?.locked) {
      classes.push('element-locked');
    }
    if (element.state?.active) {
      classes.push('element-active');
    }
    // 编辑模式类名
    if (context.isEditing) {
      classes.push('element-editable');
    }
    return classes.join(' ');
  }

  // 创建元素样式
  private createElementStyle(
    element: ElementData,
    context: RenderContext,
  ): CSSProperties {
    const style = { ...styleUtils.normalizeStyle(element.style) };
    // 应用缩放
    if (context.zoom !== 1) {
      style.transform = `scale(${context.zoom})`;
      style.transformOrigin = 'top left';
    }
    // 添加辅助线
    if (context.showGuides && element.state?.selected) {
      style.outline = '2px dashed #1677ff';
      style.outlineOffset = '2px';
    }
    return style;
  }

  // 处理元素点击
  private handleElementClick(
    element: ElementData,
    event: React.MouseEvent,
  ): void {
    event.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('element:select', {
        detail: { elementId: element.id },
      }),
    );
  }

  // 处理元素鼠标进入
  private handleElementMouseEnter(
    element: ElementData,
    event: React.MouseEvent,
  ): void {
    event.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('element:hover', {
        detail: { elementId: element.id },
      }),
    );
  }

  // 处理元素鼠标离开
  private handleElementMouseLeave(
    element: ElementData,
    event: React.MouseEvent,
  ): void {
    event.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('element:leave', {
        detail: { elementId: element.id },
      }),
    );
  }
}

export const styleUtils = {
  normalizeStyle(style?: ElementStyle): CSSProperties {
    if (!style) return {};
    const normalized: CSSProperties = {};
    Object.entries(style).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        normalized[key as keyof CSSProperties] = value;
      }
    });

    return normalized;
  },

  mergeStyles(...styles: (ElementStyle | undefined)[]): CSSProperties {
    const merged: ElementStyle = {};
    styles.forEach(style => {
      if (style) {
        Object.assign(merged, style);
      }
    });
    return this.normalizeStyle(merged);
  },

  styleToString(style: CSSProperties): string {
    return Object.entries(style)
      .map(([key, value]) => {
        const cssKey = key.replace(
          /[A-Z]/g,
          match => `-${match.toLowerCase()}`,
        );
        return `${cssKey}: ${value};`;
      })
      .join(' ');
  },
};

let renderEngineInstance: RenderEngine | null = null;
export function getRenderEngine(
  context?: Partial<RenderContext>,
  options?: RenderOptions,
): RenderEngine {
  if (!renderEngineInstance) {
    renderEngineInstance = new RenderEngine(context, options);
  }
  if (context) {
    renderEngineInstance.updateContext(context);
  }
  if (options) {
    renderEngineInstance.updateOptions(options);
  }
  return renderEngineInstance;
}

export function renderElement(
  element: ElementData,
  context?: Partial<RenderContext>,
  options?: RenderOptions,
): ReactElement | null {
  const engine = getRenderEngine(context, options);
  return engine.render(element);
}

export function renderElements(
  elements: ElementData[],
  context?: Partial<RenderContext>,
  options?: RenderOptions,
): ReactElement[] {
  const engine = getRenderEngine(context, options);

  return elements
    .map(element => engine.render(element))
    .filter(Boolean) as ReactElement[];
}

export const renderEngine = {
  getInstance: getRenderEngine,
  render: renderElement,
  renderAll: renderElements,
  styleUtils,
};
