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
  interval?: number | undefined,
): {
  data: T | undefined;
  error: unknown;
  setData: Dispatch<SetStateAction<T | undefined>>;
  loadData: () => void;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | undefined>();
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
