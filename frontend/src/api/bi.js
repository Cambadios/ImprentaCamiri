// /src/api/bi.js
import { apiFetch } from "../api/http";

// Util: arma querystring (arrays -> csv)
function qs(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return;
    if (Array.isArray(v)) q.set(k, v.join(","));
    else q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/La_Paz";

// BI ENDPOINTS
export async function biGetKpis({
  from, to, clienteId, productoId, categoriaId, estado, estadoPago, tz = TZ
} = {}) {
  const res = await apiFetch(`/bi/kpis${qs({ from, to, clienteId, productoId, categoriaId, estado, estadoPago, tz })}`);
  if (!res?.ok) throw new Error("Error al obtener KPIs");
  return res.json();
}

export async function biGetSeries({
  from, to, groupBy = "day", clienteId, productoId, categoriaId, estado, estadoPago, tz = TZ
} = {}) {
  const res = await apiFetch(`/bi/series${qs({ from, to, groupBy, clienteId, productoId, categoriaId, estado, estadoPago, tz })}`);
  if (!res?.ok) throw new Error("Error al obtener series");
  return res.json();
}

export async function biGetEstadoPedidos({
  from, to, clienteId, productoId, categoriaId, estado, estadoPago
} = {}) {
  const res = await apiFetch(`/bi/pedidos/estado${qs({ from, to, clienteId, productoId, categoriaId, estado, estadoPago })}`);
  if (!res?.ok) throw new Error("Error al obtener estado de pedidos");
  return res.json();
}

export async function biListClientes({
  from, to, q = "", page = 1, limit = 10
} = {}) {
  const res = await apiFetch(`/bi/clientes${qs({ from, to, q, page, limit })}`);
  if (!res?.ok) throw new Error("Error al listar clientes");
  return res.json();
}

export async function biGetClienteDetalle({ id, from, to }) {
  const res = await apiFetch(`/bi/clientes/${id}${qs({ from, to })}`);
  if (!res?.ok) throw new Error("Error al obtener detalle del cliente");
  return res.json();
}

export async function biGetInsumosStock({
  sort = "-valuacion", q = "", categoriaId, page = 1, limit = 50
} = {}) {
  const res = await apiFetch(`/bi/insumos/stock${qs({ sort, q, categoriaId, page, limit })}`);
  if (!res?.ok) throw new Error("Error al obtener stock de insumos");
  return res.json();
}

// (Opcional) Si tienes este endpoint en tu backend de dashboards
export async function dashTopClientes({ from, to, limit = 10 } = {}) {
  const res = await apiFetch(`/dashboard/ventas/top-clientes${qs({ from, to, limit })}`);
  if (!res?.ok) throw new Error("Error al obtener top clientes");
  return res.json();
}
