import type { CSSProperties } from 'react';

// 元素信息的指定吧
export type ElementId = string;
export type ElementType = string;

export const ElementTypes = {
  // 基础元素
  CONTAINER: 'container',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  INPUT: 'input',

  // 布局元素
  FLEX: 'flex',
  GRID: 'grid',
  STACK: 'stack',

  // 形状元素
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',

  // 图表元素
  CHART: 'chart',
  PROGRESS: 'progress',

  // 自定义元素
  CUSTOM: 'custom',

  // 画布元素
  CANVAS: 'canvas',
  WORKLET: 'worklet',
} as const;
export type ElementTypes = keyof typeof ElementTypes;

export interface ElementState {
  // 选中状态
  selected: boolean;
  // 悬停状态
  hovered: boolean;
  // 激活状态
  active: boolean;
  // 锁定状态
  locked: boolean;
  // 隐藏状态
  hidden: boolean;
}

export interface ElementMetadata {
  // 创建时间
  createdAt: number;
  // 更新时间
  updatedAt: number;
  // 创建者
  createdBy?: string;
  // 版本
  version: string;
  // 标签
  tags: string[];
  // 描述
  description?: string;
  // 分类
  category?: string;
}

export interface ElementStyle {
  // 布局
  display?: CSSProperties['display'];
  position?: CSSProperties['position'];
  top?: CSSProperties['top'];
  right?: CSSProperties['right'];
  bottom?: CSSProperties['bottom'];
  left?: CSSProperties['left'];
  zIndex?: CSSProperties['zIndex'];

  // 尺寸
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  minWidth?: CSSProperties['minWidth'];
  minHeight?: CSSProperties['minHeight'];
  maxWidth?: CSSProperties['maxWidth'];
  maxHeight?: CSSProperties['maxHeight'];

  // 间距
  margin?: CSSProperties['margin'];
  marginTop?: CSSProperties['marginTop'];
  marginRight?: CSSProperties['marginRight'];
  marginBottom?: CSSProperties['marginBottom'];
  marginLeft?: CSSProperties['marginLeft'];
  padding?: CSSProperties['padding'];
  paddingTop?: CSSProperties['paddingTop'];
  paddingRight?: CSSProperties['paddingRight'];
  paddingBottom?: CSSProperties['paddingBottom'];
  paddingLeft?: CSSProperties['paddingLeft'];

  // 背景
  backgroundColor?: CSSProperties['backgroundColor'];
  backgroundImage?: CSSProperties['backgroundImage'];
  backgroundSize?: CSSProperties['backgroundSize'];
  backgroundPosition?: CSSProperties['backgroundPosition'];
  backgroundRepeat?: CSSProperties['backgroundRepeat'];

  // 边框
  border?: CSSProperties['border'];
  borderWidth?: CSSProperties['borderWidth'];
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: CSSProperties['borderColor'];
  borderRadius?: CSSProperties['borderRadius'];
  boxShadow?: CSSProperties['boxShadow'];

  // 文本
  color?: CSSProperties['color'];
  fontFamily?: CSSProperties['fontFamily'];
  fontSize?: CSSProperties['fontSize'];
  fontWeight?: CSSProperties['fontWeight'];
  fontStyle?: CSSProperties['fontStyle'];
  lineHeight?: CSSProperties['lineHeight'];
  textAlign?: CSSProperties['textAlign'];
  textDecoration?: CSSProperties['textDecoration'];
  textOverflow?: CSSProperties['textOverflow'];
  whiteSpace?: CSSProperties['whiteSpace'];

  // Flex 布局
  flex?: CSSProperties['flex'];
  flexDirection?: CSSProperties['flexDirection'];
  flexWrap?: CSSProperties['flexWrap'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  alignContent?: CSSProperties['alignContent'];
  gap?: CSSProperties['gap'];

  // Grid 布局
  gridTemplateColumns?: CSSProperties['gridTemplateColumns'];
  gridTemplateRows?: CSSProperties['gridTemplateRows'];
  gridTemplateAreas?: CSSProperties['gridTemplateAreas'];
  gridArea?: CSSProperties['gridArea'];

  // 变换
  transform?: CSSProperties['transform'];
  transformOrigin?: CSSProperties['transformOrigin'];
  transition?: CSSProperties['transition'];

  // 效果
  opacity?: CSSProperties['opacity'];
  filter?: CSSProperties['filter'];
  backdropFilter?: CSSProperties['backdropFilter'];

  // 其他
  cursor?: CSSProperties['cursor'];
  overflow?: CSSProperties['overflow'];
  overflowX?: CSSProperties['overflowX'];
  overflowY?: CSSProperties['overflowY'];
  visibility?: CSSProperties['visibility'];
  objectFit?: CSSProperties['objectFit'];

  // 自定义属性，核心作用于 canvas + worklet 吧
  customProperties?: Record<string, string | number>;
}

// Worklet 配置
export interface WorkletConfig {
  type: string;
  inputProperties?: string[];
  parameters?: Record<string, any>;
}

export interface ElementData {
  // 元素类型
  type: ElementType;
  // 元素ID
  id: ElementId;
  // 元素名称
  name: string;
  // 元素样式
  style: ElementStyle;
  // 元素状态
  state: ElementState;
  // 元素元数据
  metadata: ElementMetadata;
  // 父元素ID
  parentId?: ElementId;
  // 子元素ID列表
  childrenIds?: ElementId[];
  // 元素属性
  props?: Record<string, any>;
  // Worklet 配置
  worklet?: WorkletConfig;
  // 自定义数据
  data?: Record<string, any>;
}

export interface ElementNode extends ElementData {
  children?: ElementNode[];
}

// 画布配置
export interface CanvasConfig {
  // 画布ID
  id: string;
  // 画布名称
  name: string;
  // 画布宽度
  width: number;
  // 画布高度
  height: number;
  // 背景颜色
  backgroundColor: string;
  // 网格配置
  grid?: {
    // 是否显示网格
    enabled: boolean;
    // 网格大小
    size: number;
    // 网格颜色
    color: string;
  };
  // 缩放配置
  zoom?: {
    // 当前缩放
    current: number;
    // 最小缩放
    min: number;
    // 最大缩放
    max: number;
    // 缩放步长
    step: number;
  };
  // 元素列表
  elements: ElementId[];
}

// 项目配置
export interface ProjectConfig {
  // 项目ID
  id: string;
  // 项目名称
  name: string;
  // 项目描述
  description?: string;
  // 创建时间
  createdAt: number;
  // 更新时间
  updatedAt: number;
  // 画布配置
  canvas: CanvasConfig;
  // 元素映射表
  elements: Record<ElementId, ElementData>;
  // 版本
  version: string;
}

// 操作历史
export interface HistoryRecord {
  // 操作ID
  id: string;
  // 操作类型
  type: string;
  // 操作数据
  data: any;
  // 时间戳
  timestamp: number;
  // 前一个状态
  prevState: any;
  // 后一个状态
  nextState: any;
}

// 编辑器状态
export interface EditorState {
  // 当前项目
  currentProject: ProjectConfig | null;
  // 当前选中的元素ID
  selectedElementId: ElementId | null;
  // 当前拖拽的元素ID
  draggingElementId: ElementId | null;
  // 当前缩放
  zoom: number;
  // 操作历史
  history: HistoryRecord[];
  // 当前历史索引
  historyIndex: number;
  // 是否正在操作
  isOperating: boolean;
}
