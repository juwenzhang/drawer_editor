/**
 * 下载文件，核心是利用 a 链接的能力实现吧，以及 URL 进行构建在线链接实现吧
 * @param content 文件内容，字符串或 Blob 对象
 * @param filename 文件名
 * @param type 文件类型，默认值为 'text/plain'
 */
export const downloadFile = (
  content: string | Blob,
  filename: string,
  type: string = 'text/plain',
): void => {
  let blob: Blob;

  if (typeof content === 'string') {
    blob = new Blob([content], { type });
  } else {
    blob = content;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 读取文件内容为文本字符串
 * @param file 文件对象
 * @returns 包含文件内容的 Promise 字符串
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      resolve(event.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * 读取文件内容为 Data URL 字符串
 * @param file 文件对象
 * @returns 包含文件内容的 Promise Data URL 字符串
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      resolve(event.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 读取图片文件为 HTMLImageElement 对象
 * @param file 图片文件对象
 * @returns 包含图片内容的 Promise HTMLImageElement 对象
 */
export const readImageFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 导出 JSON 数据为文件
 * @param data 要导出的 JSON 数据
 * @param filename 导出的文件名，默认值为 'data.json'
 */
export const exportJSON = (data: any, filename: string): void => {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, filename, 'application/json');
};

/**
 * 导入 JSON 文件内容为 JavaScript 对象
 * @param file JSON 文件对象
 * @returns 包含 JSON 内容的 Promise JavaScript 对象
 */
export const importJSON = (file: File): Promise<any> => {
  return readFileAsText(file).then(content => {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Invalid JSON file');
    }
  });
};

/**
 * 生成文件名，默认值为 'export-YYYY-MM-DD-HH-MM-SS.json'
 * @param prefix 文件名前缀，默认值为 'export'
 * @param extension 文件扩展名，默认值为 'json'
 * @returns 生成的文件名
 */
export const generateFilename = (
  prefix: string = 'export',
  extension: string = 'json',
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}.${extension}`;
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 复制操作是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

/**
 * 格式化文件大小，将字节数转换为人类可读的文件大小字符串
 * @param bytes 文件大小字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
};

export const fileUtils = {
  downloadFile,
  readFileAsText,
  readFileAsDataURL,
  readImageFile,
  exportJSON,
  importJSON,
  generateFilename,
  copyToClipboard,
  formatFileSize,
};
