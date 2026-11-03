import { useCallback, useEffect, useState } from 'react';

export default function useAsyncResource(load, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await load());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load data.');
    } finally {
      setLoading(false);
    }
  }, dependencies); // Dependencies are explicitly supplied at the call site.

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload };
}
