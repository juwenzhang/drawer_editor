export type WorkletType =
  | 'text-renderer'
  | 'canvas-engine'
  | 'layout-engine'
  | 'gradient-engine';

export interface WorkletConfig {
  type: WorkletType;
  url: string;
  dependencies?: WorkletType[];
  isRequired?: boolean;
  retryCount?: number;
}

export type WorkletStatus =
  | 'pending'
  | 'loading'
  | 'loaded'
  | 'error'
  | 'unsupported';

export type WorkletEvent =
  | { type: 'loadstart'; worklet: WorkletType }
  | { type: 'load'; worklet: WorkletType }
  | { type: 'error'; worklet: WorkletType; error: Error }
  | { type: 'progress'; loaded: number; total: number };

export const isWorkletSupported = (): boolean => {
  return 'paintWorklet' in CSS;
};

class WorkletRegistry {
  private static instance: WorkletRegistry;
  private configs: Map<WorkletType, WorkletConfig> = new Map();
  private status: Map<WorkletType, WorkletStatus> = new Map();
  private listeners: Map<string, Set<(event: WorkletEvent) => void>> =
    new Map();
  private loadedWorklets: Set<WorkletType> = new Set();

  private constructor() {
    this.initDefaultConfigs();
  }

  static getInstance(): WorkletRegistry {
    if (!WorkletRegistry.instance) {
      WorkletRegistry.instance = new WorkletRegistry();
    }
    return WorkletRegistry.instance;
  }

  private initDefaultConfigs(): void {
    const defaultConfigs: WorkletConfig[] = [
      {
        type: 'text-renderer',
        url: '/worklets/text-renderer.js',
        isRequired: true,
        retryCount: 3,
      },
      {
        type: 'canvas-engine',
        url: '/worklets/canvas-engine.js',
        isRequired: true,
        retryCount: 3,
      },
      {
        type: 'layout-engine',
        url: '/worklets/layout-engine.js',
        isRequired: false,
        retryCount: 2,
      },
      {
        type: 'gradient-engine',
        url: '/worklets/gradient-engine.js',
        isRequired: false,
        retryCount: 2,
      },
    ];

    defaultConfigs.forEach(config => {
      this.register(config);
    });
  }

  register(config: WorkletConfig): void {
    this.configs.set(config.type, config);
    this.status.set(config.type, 'pending');
  }

  async loadWorklet(type: WorkletType): Promise<void> {
    if (!isWorkletSupported()) {
      const error = new Error('Worklet API is not supported in this browser');
      this.status.set(type, 'error');
      this.emitEvent({ type: 'error', worklet: type, error });
      throw error;
    }

    const config = this.configs.get(type);
    if (!config) {
      const error = new Error(`Worklet config not found for type: ${type}`);
      this.status.set(type, 'error');
      this.emitEvent({ type: 'error', worklet: type, error });
      throw error;
    }

    if (config.dependencies) {
      for (const dep of config.dependencies) {
        const depStatus = this.status.get(dep);
        if (depStatus !== 'loaded') {
          await this.loadWorklet(dep);
        }
      }
    }

    if (this.status.get(type) === 'loaded') {
      return;
    }

    this.status.set(type, 'loading');
    this.emitEvent({ type: 'loadstart', worklet: type });

    let lastError: Error | null = null;
    const maxRetries = config.retryCount || 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await (CSS as any).paintWorklet.addModule(config.url);
        this.status.set(type, 'loaded');
        this.loadedWorklets.add(type);
        this.emitEvent({ type: 'load', worklet: type });
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Failed to load worklet ${type} (attempt ${attempt}/${maxRetries}):`,
          error,
        );

        if (attempt === maxRetries) {
          this.status.set(type, 'error');
          this.emitEvent({
            type: 'error',
            worklet: type,
            error: lastError,
          });

          if (config.isRequired) {
            throw lastError;
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 100));
        }
      }
    }
  }

  async loadWorklets(types?: WorkletType[]): Promise<void> {
    const workletsToLoad = types || Array.from(this.configs.keys());
    const total = workletsToLoad.length;
    let loaded = 0;

    for (const type of workletsToLoad) {
      try {
        await this.loadWorklet(type);
        loaded++;
        this.emitEvent({ type: 'progress', loaded, total });
      } catch (error) {
        const config = this.configs.get(type);
        if (config?.isRequired) {
          throw error;
        }
        loaded++;
        this.emitEvent({ type: 'progress', loaded, total });
      }
    }
  }

  getStatus(type: WorkletType): WorkletStatus {
    return this.status.get(type) || 'pending';
  }

  getAllStatus(): Map<WorkletType, WorkletStatus> {
    return new Map(this.status);
  }

  isAllLoaded(): boolean {
    const requiredWorklets = Array.from(this.configs.values())
      .filter(config => config.isRequired)
      .map(config => config.type);

    return requiredWorklets.every(type => this.status.get(type) === 'loaded');
  }

  getLoadedWorklets(): WorkletType[] {
    return Array.from(this.loadedWorklets);
  }

  addEventListener(
    event: string,
    callback: (event: WorkletEvent) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const callbacks = this.listeners.get(event)!;
    callbacks.add(callback);

    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  private emitEvent(event: WorkletEvent): void {
    const callbacks = this.listeners.get('*') || new Set();
    callbacks.forEach(callback => callback(event));

    const specificCallbacks = this.listeners.get(event.type) || new Set();
    specificCallbacks.forEach(callback => callback(event));
  }

  reset(): void {
    this.loadedWorklets.clear();
    this.status.forEach((_, key) => {
      this.status.set(key, 'pending');
    });
  }
}

export const workletRegistry = WorkletRegistry.getInstance();

export const workletLoader = {
  async init(types?: WorkletType[]): Promise<void> {
    return workletRegistry.loadWorklets(types);
  },
  isWorkletLoaded(type: WorkletType): boolean {
    return workletRegistry.getLoadedWorklets().includes(type);
  },
  isSupported: isWorkletSupported,
  getStatus(type: WorkletType): WorkletStatus {
    return workletRegistry.getStatus(type);
  },
  getAllStatus(): Map<WorkletType, WorkletStatus> {
    return workletRegistry.getAllStatus();
  },
  isAllLoaded(): boolean {
    return workletRegistry.isAllLoaded();
  },
  on(event: string, callback: (event: WorkletEvent) => void): () => void {
    return workletRegistry.addEventListener(event, callback);
  },
  reset(): void {
    workletRegistry.reset();
  },
};

export default workletLoader;
