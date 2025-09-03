import { ROOT } from './http'; // ya lo tienes en http.js

export async function downloadFile(path, filename, token = localStorage.getItem('token')) {
  const url = path.startsWith('http') ? path : `${ROOT}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Error ${res.status}: no se pudo descargar`);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || 'reporte.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
