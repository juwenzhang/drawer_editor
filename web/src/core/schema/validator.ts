import type { ElementData, ElementNode, ElementStyle } from './types';
import { ElementTypes } from './types';

// 验证错误
export interface ValidationError {
  // 错误字段
  field: string;
  // 错误信息
  message: string;
  // 错误值
  value?: any;
  // 错误代码
  code: string;
}

// 验证结果
export interface ValidationResult {
  // 是否有效
  valid: boolean;
  // 错误列表
  errors: ValidationError[];
  // 警告列表
  warnings: ValidationError[];
}

// 样式验证规则
interface StyleValidationRule {
  // 属性名
  property: keyof ElementStyle;
  // 验证函数
  validator: (value: any) => boolean;
  // 错误信息
  message: string;
  // 错误代码
  code: string;
  // 是否是警告
  isWarning?: boolean;
}

// 元素验证规则
interface ElementValidationRule {
  // 元素类型
  type: string;
  // 必需属性
  requiredProps?: string[];
  // 样式验证规则
  styleRules?: StyleValidationRule[];
}

// 验证器类
export class SchemaValidator {
  // 元素验证规则
  private static elementRules: ElementValidationRule[] = [
    {
      type: ElementTypes.TEXT,
      requiredProps: ['content'],
      styleRules: [
        {
          property: 'fontSize',
          validator: value => {
            if (typeof value === 'number') return value > 0;
            if (typeof value === 'string') {
              return /^\d+(px|rem|em|%)$/.test(value);
            }
            return false;
          },
          message: '字体大小必须是正数或有效的CSS值',
          code: 'STYLE_INVALID_FONT_SIZE',
        },
      ],
    },
    {
      type: ElementTypes.IMAGE,
      requiredProps: ['src'],
      styleRules: [
        {
          property: 'width',
          validator: value => {
            if (value === undefined || value === null) return true;
            if (typeof value === 'number') return value >= 0;
            if (typeof value === 'string') {
              return /^\d+(px|rem|em|%|vw|vh)$/.test(value) || value === 'auto';
            }
            return false;
          },
          message: '宽度必须是有效的CSS值',
          code: 'STYLE_INVALID_WIDTH',
        },
      ],
    },
  ];

  private static commonStyleRules: StyleValidationRule[] = [
    {
      property: 'width',
      validator: value => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'number') return value >= 0;
        if (typeof value === 'string') {
          return /^\d+(px|rem|em|%|vw|vh)$/.test(value) || value === 'auto';
        }
        return false;
      },
      message: '宽度必须是有效的CSS值',
      code: 'STYLE_INVALID_WIDTH',
      isWarning: true,
    },
    {
      property: 'height',
      validator: value => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'number') return value >= 0;
        if (typeof value === 'string') {
          return /^\d+(px|rem|em|%|vw|vh)$/.test(value) || value === 'auto';
        }
        return false;
      },
      message: '高度必须是有效的CSS值',
      code: 'STYLE_INVALID_HEIGHT',
      isWarning: true,
    },
    {
      property: 'color',
      validator: value => {
        if (value === undefined || value === null) return true;
        if (typeof value !== 'string') return false;
        return (
          /^#([0-9a-f]{3}){1,2}$/i.test(value) ||
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(value) ||
          /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(value)
        );
      },
      message: '颜色必须是有效的CSS颜色值',
      code: 'STYLE_INVALID_COLOR',
      isWarning: true,
    },
  ];

  static validateElement(element: ElementData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!element.id) {
      errors.push({
        field: 'id',
        message: '元素ID不能为空',
        code: 'ELEMENT_MISSING_ID',
      });
    }

    if (!element.type) {
      errors.push({
        field: 'type',
        message: '元素类型不能为空',
        code: 'ELEMENT_MISSING_TYPE',
      });
    }

    if (!element.name) {
      warnings.push({
        field: 'name',
        message: '建议为元素指定名称',
        code: 'ELEMENT_MISSING_NAME',
      });
    }

    const elementRule = SchemaValidator.elementRules.find(
      rule => rule.type === element.type,
    );

    if (elementRule) {
      // 验证必需属性
      if (elementRule.requiredProps) {
        elementRule.requiredProps.forEach(prop => {
          if (!element.props?.[prop]) {
            errors.push({
              field: `props.${prop}`,
              message: `必需属性 ${prop} 不能为空`,
              code: 'PROPERTY_MISSING',
            });
          }
        });
      }

      if (elementRule.styleRules) {
        SchemaValidator.validateStyle(
          element.style,
          elementRule.styleRules,
          errors,
          warnings,
        );
      }
    }

    SchemaValidator.validateStyle(
      element.style,
      SchemaValidator.commonStyleRules,
      errors,
      warnings,
    );

    if (element.childrenIds && element.childrenIds.length > 0) {
      warnings.push({
        field: 'childrenIds',
        message: '子元素验证需要单独进行',
        code: 'CHILDREN_VALIDATION_REQUIRED',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 验证元素树
  static validateElementTree(root: ElementNode): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const rootResult = SchemaValidator.validateElement(root);
    errors.push(...rootResult.errors);
    warnings.push(...rootResult.warnings);

    const validateNode = (node: ElementNode, parentId?: string) => {
      const nodeResult = SchemaValidator.validateElement(node);

      nodeResult.errors.forEach(error => {
        errors.push({
          ...error,
          field: `${parentId ? `${parentId}.` : ''}${node.id}.${error.field}`,
        });
      });

      nodeResult.warnings.forEach(warning => {
        warnings.push({
          ...warning,
          field: `${parentId ? `${parentId}.` : ''}${node.id}.${warning.field}`,
        });
      });

      if (node.children) {
        node.children.forEach(child => {
          validateNode(child, node.id);
        });
      }
    };

    if (root.children) {
      root.children.forEach(child => {
        validateNode(child, root.id);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 验证样式
  private static validateStyle(
    style: ElementStyle,
    rules: StyleValidationRule[],
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    rules.forEach(rule => {
      const value = style[rule.property];

      if (value !== undefined && value !== null) {
        const isValid = rule.validator(value);

        if (!isValid) {
          const error: ValidationError = {
            field: `style.${String(rule.property)}`,
            message: rule.message,
            value,
            code: rule.code,
          };

          if (rule.isWarning) {
            warnings.push(error);
          } else {
            errors.push(error);
          }
        }
      }
    });
  }

  // 验证项目配置
  static validateProject(project: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!project.id) {
      errors.push({
        field: 'id',
        message: '项目ID不能为空',
        code: 'PROJECT_MISSING_ID',
      });
    }

    if (!project.name) {
      errors.push({
        field: 'name',
        message: '项目名称不能为空',
        code: 'PROJECT_MISSING_NAME',
      });
    }

    if (!project.canvas) {
      errors.push({
        field: 'canvas',
        message: '画布配置不能为空',
        code: 'PROJECT_MISSING_CANVAS',
      });
    } else {
      if (!project.canvas.id) {
        errors.push({
          field: 'canvas.id',
          message: '画布ID不能为空',
          code: 'CANVAS_MISSING_ID',
        });
      }

      if (!project.canvas.width || project.canvas.width <= 0) {
        errors.push({
          field: 'canvas.width',
          message: '画布宽度必须大于0',
          code: 'CANVAS_INVALID_WIDTH',
        });
      }

      if (!project.canvas.height || project.canvas.height <= 0) {
        errors.push({
          field: 'canvas.height',
          message: '画布高度必须大于0',
          code: 'CANVAS_INVALID_HEIGHT',
        });
      }
    }

    if (!project.elements) {
      warnings.push({
        field: 'elements',
        message: '项目元素映射表为空',
        code: 'PROJECT_EMPTY_ELEMENTS',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 清理元素数据
  static sanitizeElement(element: ElementData): ElementData {
    const sanitized = { ...element };

    // 确保必需字段存在
    if (!sanitized.id) {
      sanitized.id = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!sanitized.type) {
      sanitized.type = ElementTypes.CONTAINER;
    }

    if (!sanitized.name) {
      sanitized.name = `未命名元素_${sanitized.type}`;
    }

    // 确保样式对象存在
    if (!sanitized.style) {
      sanitized.style = {};
    }

    // 确保状态对象存在
    if (!sanitized.state) {
      sanitized.state = {
        selected: false,
        hovered: false,
        active: false,
        locked: false,
        hidden: false,
      };
    }

    // 确保元数据对象存在
    if (!sanitized.metadata) {
      const now = Date.now();
      sanitized.metadata = {
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        tags: [],
        category: 'general',
      };
    }

    return sanitized;
  }

  static validateAndSanitize(element: ElementData): {
    element: ElementData;
    result: ValidationResult;
  } {
    const sanitized = SchemaValidator.sanitizeElement(element);
    const result = SchemaValidator.validateElement(sanitized);

    return {
      element: sanitized,
      result,
    };
  }
}

export const schemaValidator = {
  validateElement: SchemaValidator.validateElement,
  validateElementTree: SchemaValidator.validateElementTree,
  validateProject: SchemaValidator.validateProject,
  sanitizeElement: SchemaValidator.sanitizeElement,
  validateAndSanitize: SchemaValidator.validateAndSanitize,
};

export default schemaValidator;
