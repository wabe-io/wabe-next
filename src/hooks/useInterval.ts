import { useEffect, useRef } from 'react';

export const useInterval = (callback: () => void, delay: number) => {
  const callbackRef = useRef<() => void>();
  callbackRef.current = callback;

  useEffect(() => {
    const tick = () => {
      callbackRef.current && callbackRef.current();
    };

    if (delay > 0) {
      const handle = setInterval(tick, delay);
      return () => clearInterval(handle);
    }
  }, [delay]);
};
