// src/api/http.js
export const ROOT = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

function buildUrl(path = "") {
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${ROOT}${p}`;
}

// Agrega Authorization si existe token y normaliza a /api/*
export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = buildUrl(`/api${String(path).startsWith("/") ? path : `/${path}`}`);
  return fetch(url, { ...opts, headers });
}
