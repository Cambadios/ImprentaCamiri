import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../api/http';

export function useApi(path, deps = []) {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const key = useMemo(() => path, [path]);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);

    apiFetch(path)
      .then(async (res) => {
        if (!res) return; // 401 ya redirigió
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => { if (!cancel) setData(json); })
      .catch((e) => { if (!cancel) setError(e); })
      .finally(() => { if (!cancel) setLoading(false); });

    return () => { cancel = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps.length ? deps : [key]);

  return { data, error, loading };
}
