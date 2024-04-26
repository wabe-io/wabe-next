import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export const useServerAction = <T>(
  actionFn: () => Promise<T>,
  params?: {
    interval?: number | undefined;
    initialData?: T;
  },
): {
  data: T | undefined;
  error: unknown;
  setData: Dispatch<SetStateAction<T | undefined>>;
  loadData: () => void;
  loading: boolean;
} => {
  const interval = params?.interval;
  const initialData = params?.initialData;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<unknown>(false);

  const loadData = useCallback(() => {
    setLoading(true);
    actionFn()
      .then((d) => setData(d))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [actionFn]);

  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (interval && interval > 0) {
      const handle = setInterval(() => {
        loadDataRef.current && loadDataRef.current();
      }, interval);

      return () => clearTimeout(handle);
    }
  }, [interval, loadData]);

  return {
    data,
    error,
    setData,
    loadData,
    loading,
  };
};
