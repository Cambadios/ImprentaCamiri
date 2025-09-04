// src/api/maquinaria.js
import { apiFetch } from "../api/http"; // ajusta la ruta según tu estructura

export async function getMaquinariaMetrics(range = '30d', lowStock = 10) {
  const r = await apiFetch(`/dashboardMaquinaria/metrics?range=${encodeURIComponent(range)}&lowStock=${lowStock}`);
  return r.json();
}

export async function getPedidosTrend(scope = '12m') {
  const r = await apiFetch(`/dashboardMaquinaria/pedidos/trend?scope=${encodeURIComponent(scope)}`);
  return r.json();
}

export async function getTopVentas(range = '30d', limit = 7) {
  const r = await apiFetch(`/dashboardMaquinaria/ventas/top?range=${encodeURIComponent(range)}&limit=${limit}`);
  return r.json();
}

export async function getInsumosNeeds() {
  const r = await apiFetch('/dashboardMaquinaria/insumos/needs');
  return r.json();
}

export async function getMaintAlerts() {
  const r = await apiFetch('/dashboardMaquinaria/mantenimiento/alerts');
  return r.json();
}

export async function getStatusBreakdown(range = '30d') {
  const r = await apiFetch(`/dashboardMaquinaria/pedidos/status-breakdown?range=${encodeURIComponent(range)}`);
  return r.json();
}
