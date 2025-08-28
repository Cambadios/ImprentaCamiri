import { useMemo, useState } from 'react';

export function useDashboardRange() {
  const now = new Date();
  const fromDefault = new Date(now.getTime() - 29*24*60*60*1000);

  const [from, setFrom] = useState(fromDefault);
  const [to, setTo]     = useState(now);

  const qs = useMemo(() => {
    const f = from ? from.toISOString().slice(0,10) : '';
    const t = to ? to.toISOString().slice(0,10) : '';
    const params = new URLSearchParams();
    if (f) params.set('from', f);
    if (t) params.set('to', t);
    return `?${params.toString()}`;
  }, [from, to]);

  return { from, to, setFrom, setTo, qs };
}
