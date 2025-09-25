// frontend/src/pages/admin/bi/userUrlState.js
import { useEffect, useState } from "react";

export function useUrlState(initial = {}) {
  const params = new URLSearchParams(window.location.search);
  const init = { ...initial };
  for (const [k, v] of params.entries()) init[k] = init[k] ?? v;

  const [state, setState] = useState(init);

  useEffect(() => {
    const p = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return;
      p.set(k, Array.isArray(v) ? v.join(",") : v);
    });
    const q = p.toString();
    const url = q ? `${window.location.pathname}?${q}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [state]);

  return [state, setState];
}
