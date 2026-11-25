import { useCallback, useEffect, useRef, useState } from 'react';

export default function useAsyncResource(load, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const generation = useRef(0);

  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError(null);
    try {
      const result = await load();
      if (current === generation.current) setData(result);
    } catch (loadError) {
      if (current === generation.current) setError(loadError instanceof Error ? loadError.message : 'Unable to load data.');
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, dependencies); // Dependencies are explicitly supplied at the call site.

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload };
}
