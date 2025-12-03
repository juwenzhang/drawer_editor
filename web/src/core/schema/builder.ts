import { generateId } from '@/utils/base/common';
import {
  type ElementData,
  type ElementMetadata,
  type ElementNode,
  type ElementState,
  type ElementStyle,
  type ElementTypes,
  ElementTypes as ElementTypesEnum,
} from './types';

// 构建器配置
interface BuilderOptions {
  // 是否自动生成ID
  autoGenerateId?: boolean;
  // 是否自动设置时间戳
  autoSetTimestamp?: boolean;
  // 默认样式
  defaultStyle?: Partial<ElementStyle>;
  // 默认状态
  defaultState?: Partial<ElementState>;
}

// 默认配置
const DEFAULT_OPTIONS: BuilderOptions = {
  autoGenerateId: true,
  autoSetTimestamp: true,
  defaultStyle: {},
  defaultState: {
    selected: false,
    hovered: false,
    active: false,
    locked: false,
    hidden: false,
  },
};

// 元素构建器类
export class ElementBuilder {
  private options: BuilderOptions;
  private element: Partial<ElementData>;

  constructor(type: ElementTypes, options?: BuilderOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.element = { type };
    this.init();
  }

  private init(): void {
    if (this.options.autoGenerateId) {
      this.element.id = generateId();
    }

    if (this.options.autoSetTimestamp) {
      const now = Date.now();
      this.element.metadata = {
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        tags: [],
        category: 'general',
      };
    }

    if (this.options.defaultStyle) {
      this.element.style = { ...this.options.defaultStyle };
    }

    if (this.options.defaultState) {
      this.element.state = this.options.defaultState as ElementState;
    }
  }

  setId(id: string): this {
    this.element.id = id;
    return this;
  }

  setName(name: string): this {
    this.element.name = name;
    return this;
  }

  setStyle(style: Partial<ElementStyle>): this {
    if (!this.element.style) {
      this.element.style = {};
    }
    Object.assign(this.element.style, style);
    return this;
  }

  setStyleProperty<K extends keyof ElementStyle>(
    key: K,
    value: ElementStyle[K],
  ): this {
    if (!this.element.style) {
      this.element.style = {};
    }
    this.element.style[key] = value;
    return this;
  }

  // 设置状态
  setState(state: Partial<ElementState>): this {
    if (!this.element.state) {
      this.element.state = {
        selected: false,
        hovered: false,
        active: false,
        locked: false,
        hidden: false,
      };
    }
    Object.assign(this.element.state, state);
    return this;
  }

  // 设置元数据
  setMetadata(metadata: Partial<ElementMetadata>): this {
    if (!this.element.metadata) {
      this.element.metadata = {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        tags: [],
        category: 'general',
      };
    }
    Object.assign(this.element.metadata, metadata);
    return this;
  }

  // 设置属性
  setProps(props: Record<string, any>): this {
    if (!this.element.props) {
      this.element.props = {};
    }
    Object.assign(this.element.props, props);
    return this;
  }

  // 设置单个属性
  setProp(key: string, value: any): this {
    if (!this.element.props) {
      this.element.props = {};
    }
    this.element.props[key] = value;
    return this;
  }

  // 设置父元素ID
  setParentId(parentId: string): this {
    this.element.parentId = parentId;
    return this;
  }

  // 设置子元素ID列表
  setChildrenIds(childrenIds: string[]): this {
    this.element.childrenIds = childrenIds;
    return this;
  }

  // 添加子元素ID
  addChildId(childId: string): this {
    if (!this.element.childrenIds) {
      this.element.childrenIds = [];
    }
    this.element.childrenIds.push(childId);
    return this;
  }

  // 设置自定义数据
  setData(data: Record<string, any>): this {
    this.element.data = data;
    return this;
  }

  // 构建元素数据
  build(): ElementData {
    // 确保必需字段存在
    if (!this.element.id) {
      this.element.id = generateId();
    }

    if (!this.element.name) {
      this.element.name = `未命名_${this.element.type}`;
    }

    if (!this.element.style) {
      this.element.style = {};
    }

    if (!this.element.state) {
      this.element.state = {
        selected: false,
        hovered: false,
        active: false,
        locked: false,
        hidden: false,
      };
    }

    if (!this.element.metadata) {
      const now = Date.now();
      this.element.metadata = {
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        tags: [],
        category: 'general',
      };
    }

    return this.element as ElementData;
  }

  // 构建元素树节点
  buildNode(children?: ElementNode[]): ElementNode {
    const element = this.build();
    return {
      ...element,
      children: children || [],
    };
  }
}

// 预设元素构建器
export class PresetBuilder {
  // 创建容器元素
  static createContainer(options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.CONTAINER as ElementTypes,
      options,
    );
    return builder.setName('容器').setStyle({
      display: 'block',
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
    });
  }

  // 创建文本元素
  static createText(content: string, options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.TEXT as ElementTypes,
      options,
    );
    return builder.setName('文本').setProps({ content }).setStyle({
      display: 'inline-block',
      color: '#000000',
      fontSize: '16px',
      fontFamily: 'sans-serif',
      lineHeight: 1.5,
    });
  }

  // 创建按钮元素
  static createButton(text: string, options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.BUTTON as ElementTypes,
      options,
    );
    return builder.setName('按钮').setProps({ text }).setStyle({
      display: 'inline-block',
      padding: '8px 16px',
      backgroundColor: '#1677ff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      textAlign: 'center',
    });
  }

  // 创建图片元素
  static createImage(src: string, options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.IMAGE as ElementTypes,
      options,
    );
    return builder.setName('图片').setProps({ src }).setStyle({
      display: 'block',
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
    });
  }

  // 创建矩形元素
  static createRectangle(options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.RECTANGLE as ElementTypes,
      options,
    );
    return builder.setName('矩形').setStyle({
      display: 'block',
      width: '100px',
      height: '60px',
      backgroundColor: '#1677ff',
      borderRadius: '4px',
    });
  }

  // 创建圆形元素
  static createCircle(options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.CIRCLE as ElementTypes,
      options,
    );
    return builder.setName('圆形').setStyle({
      display: 'block',
      width: '60px',
      height: '60px',
      backgroundColor: '#52c41a',
      borderRadius: '50%',
    });
  }

  // 创建 Flex 容器
  static createFlexContainer(options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.FLEX as ElementTypes,
      options,
    );
    return builder.setName('Flex 容器').setStyle({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: '8px',
      padding: '16px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
    });
  }

  // 创建 Grid 容器
  static createGridContainer(options?: BuilderOptions): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.GRID as ElementTypes,
      options,
    );
    return builder.setName('Grid 容器').setStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      padding: '16px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
    });
  }

  // 创建输入框元素
  static createInput(
    placeholder?: string,
    options?: BuilderOptions,
  ): ElementBuilder {
    const builder = new ElementBuilder(
      ElementTypesEnum.INPUT as ElementTypes,
      options,
    );
    return builder
      .setName('输入框')
      .setProps({
        type: 'text',
        placeholder: placeholder || '请输入内容',
      })
      .setStyle({
        display: 'block',
        width: '200px',
        padding: '8px 12px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        fontSize: '14px',
      });
  }
}

export class ElementTreeBuilder {
  private root: ElementNode;
  private nodeMap: Map<string, ElementNode> = new Map();

  constructor(rootBuilder: ElementBuilder) {
    this.root = rootBuilder.buildNode();
    this.nodeMap.set(this.root.id, this.root);
  }

  addChild(parentId: string, childBuilder: ElementBuilder): this {
    const parent = this.nodeMap.get(parentId);
    if (!parent) {
      throw new Error(`Parent node not found: ${parentId}`);
    }

    const child = childBuilder.setParentId(parentId).buildNode();

    parent.children = parent.children || [];
    parent.children.push(child);

    if (parent.childrenIds) {
      parent.childrenIds.push(child.id);
    } else {
      parent.childrenIds = [child.id];
    }

    this.nodeMap.set(child.id, child);
    return this;
  }

  addChildren(parentId: string, childBuilders: ElementBuilder[]): this {
    childBuilders.forEach(builder => {
      this.addChild(parentId, builder);
    });
    return this;
  }

  getNode(id: string): ElementNode | undefined {
    return this.nodeMap.get(id);
  }

  getRoot(): ElementNode {
    return this.root;
  }

  build(): ElementNode {
    return this.root;
  }

  // 转换为扁平结构
  flatten(): Record<string, ElementData> {
    const result: Record<string, ElementData> = {};

    const traverse = (node: ElementNode) => {
      const { children, ...elementData } = node;
      result[node.id] = elementData;

      if (children) {
        children.forEach(child => traverse(child));
      }
    };

    traverse(this.root);
    return result;
  }
}

// 快速构建函数
export const schemaBuilder = {
  createElement: (type: ElementTypes, options?: BuilderOptions) =>
    new ElementBuilder(type, options),

  container: (options?: BuilderOptions) =>
    PresetBuilder.createContainer(options),

  text: (content: string, options?: BuilderOptions) =>
    PresetBuilder.createText(content, options),

  button: (text: string, options?: BuilderOptions) =>
    PresetBuilder.createButton(text, options),

  image: (src: string, options?: BuilderOptions) =>
    PresetBuilder.createImage(src, options),

  rectangle: (options?: BuilderOptions) =>
    PresetBuilder.createRectangle(options),

  circle: (options?: BuilderOptions) => PresetBuilder.createCircle(options),

  flexContainer: (options?: BuilderOptions) =>
    PresetBuilder.createFlexContainer(options),

  gridContainer: (options?: BuilderOptions) =>
    PresetBuilder.createGridContainer(options),

  input: (placeholder?: string, options?: BuilderOptions) =>
    PresetBuilder.createInput(placeholder, options),

  createTree: (rootBuilder: ElementBuilder) =>
    new ElementTreeBuilder(rootBuilder),
};

export default schemaBuilder;
