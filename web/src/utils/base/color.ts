export type RGB = { r: number; g: number; b: number; a?: number };
export type HSL = { h: number; s: number; l: number; a?: number };
export type HSV = { h: number; s: number; v: number; a?: number };
export type Color = string | RGB | HSL | HSV;

/**
 * 从 HEX 颜色字符串转换为 RGB 颜色对象
 * @param hex 格式为 #RRGGBB 或 #RGB 的 HEX 颜色字符串
 * @returns 对应的 RGB 颜色对象
 */
export const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * 从 RGB 颜色对象转换为 HEX 颜色字符串
 * @param rgb 包含 r, g, b 可选的 a 属性的 RGB 颜色对象
 * @returns 对应的 HEX 颜色字符串
 */
export const rgbToHex = (rgb: RGB): string => {
  const { r, g, b } = rgb;
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * 从 RGB 颜色对象转换为 HSL 颜色对象
 * @param rgb 包含 r, g, b 可选的 a 属性的 RGB 颜色对象
 * @returns 对应的 HSL 颜色对象
 */
export const rgbToHsl = (rgb: RGB): HSL => {
  const { r, g, b } = rgb;
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;

  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r1:
        h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
        break;
      case g1:
        h = (b1 - r1) / d + 2;
        break;
      case b1:
        h = (r1 - g1) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * -darken 颜色
 * @param color 颜色字符串或 RGB 颜色对象
 * @param amount darken 比例，0-100 之间的数字
 * @returns darken 后的颜色字符串
 */
export const darken = (color: Color, amount: number): string => {
  if (typeof color === 'string') {
    const rgb = hexToRgb(color);
    const factor = 1 - amount / 100;
    return rgbToHex({
      r: Math.round(rgb.r * factor),
      g: Math.round(rgb.g * factor),
      b: Math.round(rgb.b * factor),
    });
  }
  return '';
};

/**
 * -lighten 颜色
 * @param color 颜色字符串或 RGB 颜色对象
 * @param amount lighten 比例，0-100 之间的数字
 * @returns lighten 后的颜色字符串
 */
export const lighten = (color: Color, amount: number): string => {
  if (typeof color === 'string') {
    const rgb = hexToRgb(color);
    const factor = 1 + amount / 100;
    return rgbToHex({
      r: Math.min(255, Math.round(rgb.r * factor)),
      g: Math.min(255, Math.round(rgb.g * factor)),
      b: Math.min(255, Math.round(rgb.b * factor)),
    });
  }
  return '';
};

/**
 * 计算两个颜色之间的对比度比
 * @param color1 第一个颜色字符串或 RGB 颜色对象
 * @param color2 第二个颜色字符串或 RGB 颜色对象
 * @returns 对比度比，范围为 1-21
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * 计算颜色的相对亮度值
 * @param rgb 包含 r, g, b 可选的 a 属性的 RGB 颜色对象
 * @returns 相对亮度值，范围为 0-1
 */
export const getLuminance = (rgb: RGB): number => {
  const { r, g, b } = rgb;

  const [r1, g1, b1] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
};

/**
 * 生成渐变颜色字符串
 * @param colors 颜色数组，每个元素为颜色字符串或 RGB 颜色对象
 * @param type 渐变类型，'linear' 或 'radial'，默认值为 'linear'
 * @returns 渐变颜色字符串
 */
export const generateGradient = (
  colors: string[],
  type: 'linear' | 'radial' = 'linear',
): string => {
  const stops = colors
    .map((color, index) => {
      const percentage = Math.round((index / (colors.length - 1)) * 100);
      return `${color} ${percentage}%`;
    })
    .join(', ');

  if (type === 'linear') {
    return `linear-gradient(135deg, ${stops})`;
  }
  return `radial-gradient(circle at center, ${stops})`;
};

/**
 * 生成随机颜色字符串
 * @returns 随机颜色字符串，格式为 '#RRGGBB'
 */
export const randomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * 获取 CSS 变量值
 * @param name CSS 变量名
 * @param fallback 可选的回退值，当变量不存在时使用
 * @returns CSS 变量值
 */
export const cssVar = (name: string, fallback?: string): string => {
  return `var(--${name}${fallback ? `, ${fallback}` : ''})`;
};

export const colorUtils = {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  darken,
  lighten,
  getContrastRatio,
  getLuminance,
  generateGradient,
  randomColor,
  cssVar,
};
