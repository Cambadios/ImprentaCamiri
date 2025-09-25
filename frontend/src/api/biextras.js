// /src/api/biextras.js
import { apiFetch } from "./http";

export async function biAutocompleteClientes(q) {
  const res = await apiFetch(`/bi/clientes?q=${encodeURIComponent(q)}&page=1&limit=8`);
  if (!res?.ok) return { items: [] };
  return res.json();
}

export function exportToCsv(filename, rows) {
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = Object.keys(rows[0] || {});
  const csv = [header.map(esc).join(",")]
    .concat(rows.map(r => header.map(h => esc(r[h])).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
