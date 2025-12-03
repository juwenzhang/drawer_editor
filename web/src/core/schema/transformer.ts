import type {
  ElementData,
  ElementNode,
  ElementStyle,
  ProjectConfig,
} from './types';

// 转换选项
interface TransformOptions {
  // 是否包含元数据
  includeMetadata?: boolean;
  // 是否包含状态
  includeState?: boolean;
  // 是否包含子元素
  includeChildren?: boolean;
  // 是否扁平化
  flatten?: boolean;
}

// 转换器类
export class SchemaTransformer {
  // 元素节点转扁平结构
  static nodeToFlat(node: ElementNode): Record<string, ElementData> {
    const result: Record<string, ElementData> = {};

    const traverse = (current: ElementNode) => {
      const { children, ...elementData } = current;
      result[current.id] = elementData;

      if (children) {
        children.forEach(child => traverse(child));
      }
    };

    traverse(node);
    return result;
  }

  // 扁平结构转元素树
  static flatToTree(
    flatData: Record<string, ElementData>,
    rootId: string,
  ): ElementNode | null {
    const data = flatData[rootId];
    if (!data) return null;

    const node: ElementNode = {
      ...data,
      children: [],
    };

    // 查找子元素
    const childIds = data.childrenIds || [];
    childIds.forEach(childId => {
      const childNode = SchemaTransformer.flatToTree(flatData, childId);
      if (childNode) {
        node.children!.push(childNode);
      }
    });

    return node;
  }

  // 元素数据转CSS属性
  static styleToCss(style: ElementStyle): Record<string, string> {
    const css: Record<string, string> = {};

    Object.entries(style).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // 转换驼峰为连字符
        const cssKey = key.replace(
          /[A-Z]/g,
          match => `-${match.toLowerCase()}`,
        );
        css[cssKey] = String(value);
      }
    });

    return css;
  }

  // CSS属性转元素样式
  static cssToStyle(css: Record<string, string>): ElementStyle {
    const style: ElementStyle = {};

    Object.entries(css).forEach(([key, value]) => {
      const styleKey = key.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      ) as keyof ElementStyle;

      let finalValue: any = value;

      if (/^\d+$/.test(value)) {
        finalValue = parseInt(value, 10);
      } else if (/^\d*\.\d+$/.test(value)) {
        finalValue = parseFloat(value);
      } else if (/^true|false$/i.test(value)) {
        finalValue = value.toLowerCase() === 'true';
      }

      style[styleKey] = finalValue;
    });

    return style;
  }

  static elementToSimple(
    element: ElementData,
    options?: TransformOptions,
  ): any {
    const {
      includeMetadata = false,
      includeState = false,
      includeChildren = true,
    } = options || {};

    const simple: any = {
      id: element.id,
      type: element.type,
      name: element.name,
      style: element.style,
      props: element.props || {},
    };

    if (includeMetadata) {
      simple.metadata = element.metadata;
    }

    if (includeState) {
      simple.state = element.state;
    }

    if (includeChildren && element.childrenIds) {
      simple.children = element.childrenIds;
    }

    return simple;
  }

  static simpleToElement(simple: any, parentId?: string): ElementData {
    const now = Date.now();

    return {
      id:
        simple.id ||
        `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: simple.type || 'container',
      name: simple.name || `未命名_${simple.type || '元素'}`,
      style: simple.style || {},
      state: simple.state || {
        selected: false,
        hovered: false,
        active: false,
        locked: false,
        hidden: false,
      },
      metadata: simple.metadata || {
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        tags: [],
        category: 'general',
      },
      parentId: parentId || simple.parentId,
      childrenIds: simple.children || [],
      props: simple.props || {},
      data: simple.data || {},
    };
  }

  static projectToSimple(project: ProjectConfig): any {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      canvas: {
        id: project.canvas.id,
        name: project.canvas.name,
        width: project.canvas.width,
        height: project.canvas.height,
        backgroundColor: project.canvas.backgroundColor,
        grid: project.canvas.grid,
        zoom: project.canvas.zoom,
      },
      elements: project.elements,
      version: project.version,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  static simpleToProject(simple: any): ProjectConfig {
    const now = Date.now();

    return {
      id:
        simple.id ||
        `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: simple.name || '未命名项目',
      description: simple.description,
      createdAt: simple.createdAt || now,
      updatedAt: simple.updatedAt || now,
      canvas: {
        id: simple.canvas?.id || 'canvas',
        name: simple.canvas?.name || '画布',
        width: simple.canvas?.width || 800,
        height: simple.canvas?.height || 600,
        backgroundColor: simple.canvas?.backgroundColor || '#ffffff',
        grid: simple.canvas?.grid || {
          enabled: true,
          size: 20,
          color: '#e8e8e8',
        },
        zoom: simple.canvas?.zoom || {
          current: 1,
          min: 0.1,
          max: 5,
          step: 0.1,
        },
        elements: simple.canvas?.elements || [],
      },
      elements: simple.elements || {},
      version: simple.version || '1.0.0',
    };
  }

  static createSnapshot(element: ElementData): any {
    return {
      id: element.id,
      type: element.type,
      style: { ...element.style },
      state: { ...element.state },
      props: element.props ? { ...element.props } : {},
      parentId: element.parentId,
      childrenIds: element.childrenIds ? [...element.childrenIds] : undefined,
      data: element.data ? { ...element.data } : {},
      metadata: {
        ...element.metadata,
        updatedAt: Date.now(),
      },
    };
  }

  static applySnapshot(element: ElementData, snapshot: any): ElementData {
    return {
      ...element,
      style: snapshot.style || element.style,
      state: snapshot.state || element.state,
      props: snapshot.props || element.props,
      parentId:
        snapshot.parentId !== undefined ? snapshot.parentId : element.parentId,
      childrenIds: snapshot.childrenIds || element.childrenIds,
      data: snapshot.data || element.data,
      metadata: {
        ...element.metadata,
        ...snapshot.metadata,
        updatedAt: snapshot.metadata?.updatedAt || element.metadata.updatedAt,
      },
    };
  }

  static diffElements(
    before: ElementData,
    after: ElementData,
  ): {
    changed: boolean;
    changes: Record<string, { before: any; after: any }>;
  } {
    const changes: Record<string, { before: any; after: any }> = {};
    let changed = false;

    // 比较样式
    if (JSON.stringify(before.style) !== JSON.stringify(after.style)) {
      changes.style = { before: before.style, after: after.style };
      changed = true;
    }

    // 比较状态
    if (JSON.stringify(before.state) !== JSON.stringify(after.state)) {
      changes.state = { before: before.state, after: after.state };
      changed = true;
    }

    // 比较属性
    if (JSON.stringify(before.props) !== JSON.stringify(after.props)) {
      changes.props = { before: before.props, after: after.props };
      changed = true;
    }

    return { changed, changes };
  }
}

export const schemaTransformer = {
  nodeToFlat: SchemaTransformer.nodeToFlat,
  flatToTree: SchemaTransformer.flatToTree,
  styleToCss: SchemaTransformer.styleToCss,
  cssToStyle: SchemaTransformer.cssToStyle,
  elementToSimple: SchemaTransformer.elementToSimple,
  simpleToElement: SchemaTransformer.simpleToElement,
  projectToSimple: SchemaTransformer.projectToSimple,
  simpleToProject: SchemaTransformer.simpleToProject,
  createSnapshot: SchemaTransformer.createSnapshot,
  applySnapshot: SchemaTransformer.applySnapshot,
  diffElements: SchemaTransformer.diffElements,
};

export default schemaTransformer;
