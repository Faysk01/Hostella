import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage } from '../services/api';

/** Charge une ressource et la recharge quand `deps` change. Ignore les réponses obsolètes. */
export function useApi<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    const current = ++id.current;
    setLoading(true);
    setError(null);
    try {
      const result = await run();
      if (current === id.current) setData(result);
    } catch (e) {
      if (current === id.current) setError(errorMessage(e));
    } finally {
      if (current === id.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}

export function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
