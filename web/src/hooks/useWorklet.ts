import { useCallback, useEffect, useState } from 'react';
import {
  type WorkletStatus,
  type WorkletType,
  workletLoader,
} from '@/utils/worklet/loader';

export function useWorklet() {
  const [status, setStatus] = useState<Map<WorkletType, WorkletStatus>>(
    workletLoader.getAllStatus(),
  );
  // @ts-expect-error
  const [isSupported, setIsSupported] = useState(workletLoader.isSupported());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const init = useCallback(
    async (types?: WorkletType[]): Promise<void> => {
      if (!isSupported) {
        throw new Error('Worklet API is not supported in this browser');
      }

      setIsLoading(true);
      setError(null);

      try {
        await workletLoader.init(types);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported],
  );

  const reload = useCallback(
    async (type?: WorkletType): Promise<void> => {
      workletLoader.reset();
      return init(type ? [type] : undefined);
    },
    [init],
  );

  useEffect(() => {
    const handleStatusChange = () => {
      setStatus(new Map(workletLoader.getAllStatus()));
    };

    const unsubscribe = workletLoader.on('*', handleStatusChange);
    return unsubscribe;
  }, []);

  const getWorkletStatus = useCallback((type: WorkletType): WorkletStatus => {
    return workletLoader.getStatus(type);
  }, []);

  const isAllLoaded = useCallback((): boolean => {
    return workletLoader.isAllLoaded();
  }, []);

  const isWorkletLoaded = useCallback((type: WorkletType): boolean => {
    return workletLoader.getStatus(type) === 'loaded';
  }, []);

  return {
    status,
    isSupported,
    isLoading,
    error,
    isAllLoaded: isAllLoaded(),

    init,
    reload,
    getWorkletStatus,
    isWorkletLoaded,

    isTextRendererLoaded: isWorkletLoaded('text-renderer'),
    isCanvasEngineLoaded: isWorkletLoaded('canvas-engine'),
    isLayoutEngineLoaded: isWorkletLoaded('layout-engine'),
    isGradientEngineLoaded: isWorkletLoaded('gradient-engine'),
  };
}

export function useWorkletLoader(
  types?: WorkletType[],
  autoLoad: boolean = true,
) {
  const worklet = useWorklet();
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (
      autoLoad &&
      worklet.isSupported &&
      !worklet.isAllLoaded &&
      !worklet.isLoading
    ) {
      worklet.init(types).then(() => {
        setHasLoaded(true);
      });
    }
  }, [autoLoad, worklet, types]);

  return {
    ...worklet,
    hasLoaded,
  };
}
