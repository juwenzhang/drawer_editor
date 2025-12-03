import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export class RequestError extends Error {
  code: number;
  data?: any;

  constructor(code: number, message: string, data?: any) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
    this.data = data;
  }
}

export const createRequest = (baseURL: string = '/api'): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if ((config as RequestConfig).showLoading !== false) {
        window.dispatchEvent(
          new CustomEvent('request:loading', { detail: true }),
        );
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse<ResponseData>) => {
      if ((response.config as RequestConfig).showLoading !== false) {
        window.dispatchEvent(
          new CustomEvent('request:loading', { detail: false }),
        );
      }

      const { data } = response;
      if (data.code !== 0) {
        if ((response.config as RequestConfig).showError !== false) {
          window.dispatchEvent(
            new CustomEvent('request:error', {
              detail: { message: data.message },
            }),
          );
        }
        return Promise.reject(
          new RequestError(data.code, data.message, data.data),
        );
      }
      return data.data;
    },
    (error: AxiosError) => {
      if (
        error.config &&
        (error.config as RequestConfig).showLoading !== false
      ) {
        window.dispatchEvent(
          new CustomEvent('request:loading', { detail: false }),
        );
      }
      let errorMessage = '请求失败';
      let errorCode = 500;

      if (error.response) {
        errorCode = error.response.status;

        switch (error.response.status) {
          case 400:
            errorMessage = '请求参数错误';
            break;
          case 401:
            errorMessage = '未授权，请重新登录';
            window.dispatchEvent(new CustomEvent('auth:logout'));
            break;
          case 403:
            errorMessage = '禁止访问';
            break;
          case 404:
            errorMessage = '资源不存在';
            break;
          case 500:
            errorMessage = '服务器错误';
            break;
          case 502:
            errorMessage = '网关错误';
            break;
          case 503:
            errorMessage = '服务不可用';
            break;
          default:
            errorMessage = `请求失败 (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = '网络错误，请检查网络连接';
      } else {
        errorMessage = error.message;
      }

      if ((error.config as RequestConfig)?.showError !== false) {
        window.dispatchEvent(
          new CustomEvent('request:error', {
            detail: { message: errorMessage },
          }),
        );
      }

      return Promise.reject(new RequestError(errorCode, errorMessage));
    },
  );
  return instance;
};
export const request = createRequest();

export const requestUtils = {
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return request.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return request.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return request.put(url, data, config);
  },

  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return request.delete(url, config);
  },

  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return request.patch(url, data, config);
  },

  upload<T = any>(url: string, file: File, config?: RequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return request.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  download(
    url: string,
    filename?: string,
    config?: RequestConfig,
  ): Promise<void> {
    return request
      .get(url, {
        ...config,
        responseType: 'blob',
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob as unknown as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  },
};
