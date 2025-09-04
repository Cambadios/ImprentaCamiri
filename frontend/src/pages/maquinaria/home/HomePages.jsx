// src/pages/maquinaria/home/HomePages.jsx
import React, { useEffect, useState } from "react";
import {
  getMaquinariaMetrics,
  getPedidosTrend,
  getTopVentas,
  getInsumosNeeds,
  getMaintAlerts,
  getStatusBreakdown
} from "../../../api/maquinaria";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from "recharts";

const fmtNum = (v) => new Intl.NumberFormat().format(Number(v || 0));
const fmtMoney = (v) => `Bs ${Number(v || 0).toFixed(2)}`;

function PriorityPill({ p }) {
  const map = {
    alta: "bg-red-100 text-red-700 border-red-200",
    media: "bg-amber-100 text-amber-700 border-amber-200",
    baja: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${map[p] || ''}`}>{String(p || '').toUpperCase()}</span>;
}

export default function HomePages() {
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [top, setTop] = useState([]);
  const [purchase, setPurchase] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState([]);

  console.log(alerts)
  // controles simples
  const [range, setRange] = useState('30d');   // afecta metrics y status breakdown
  const [lowStock, setLowStock] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const [a, b, c, d, e, f] = await Promise.all([
          getMaquinariaMetrics(range, lowStock),
          getPedidosTrend("12m"),
          getTopVentas("30d", 7),
          getInsumosNeeds(),
          getMaintAlerts(),
          getStatusBreakdown(range),
        ]);
        setKpis(a); setTrend(b); setTop(c); setPurchase(d); setAlerts(e); setStatus(f);
      } catch (err) {
        console.error("Dashboard maquinaria error:", err);
      }
    })();
  }, [range, lowStock]);

  return (
    <div className="w-full h-full p-4 md:p-6 bg-slate-50">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Panel de Maquinaria</h1>
          <p className="text-slate-500 text-sm">Resumen de pedidos, ingresos e insumos</p>
        </div>
        {/* Filtros rápidos */}
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            className="border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white"
          >
            <option value="7d">7 días</option>
            <option value="30d">30 días</option>
            <option value="90d">90 días</option>
            <option value="6m">6 meses</option>
          </select>
          <div className="flex items-center gap-1 text-sm">
            <label className="text-slate-600">Low stock ≤</label>
            <input
              type="number"
              min={0}
              value={lowStock}
              onChange={e => setLowStock(parseInt(e.target.value || '0', 10))}
              className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* KPIs NUEVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
        <KPI label="Pendientes" value={kpis ? fmtNum(kpis.pendingOrders) : "—"} sub="por iniciar" />
        <KPI label="En proceso" value={kpis ? fmtNum(kpis.inProgress) : "—"} sub="en producción" />
        <KPI label="Entregados (hoy)" value={kpis ? fmtNum(kpis.deliveredToday) : "—"} sub="entregas registradas" />
        <KPI label="Ingresos (rango)" value={kpis ? fmtMoney(kpis.ingresosPeriodo) : "—"} sub={`rango ${kpis?.range || ''}`} />
        <KPI label="Saldo pendiente" value={kpis ? fmtMoney(kpis.saldoPendiente) : "—"} sub="activos" />
        <KPI label="Clientes (rango)" value={kpis ? fmtNum(kpis.clientesUnicosPeriodo) : "—"} sub="con pedidos" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Tendencia pedidos */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">Tendencia de pedidos</div>
            <div className="text-xs text-slate-500">últimos 12 periodos</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="pedidos" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPedidos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estado de pedidos (rango) como barras horizontales simple */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">Estados de pedido (rango)</div>
            <div className="text-xs text-slate-500">actualizado por filtro</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="estado" width={140} />
                <Tooltip />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compras y Top */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Compras */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">Lista de compras (insumos críticos)</div>
            <div className="text-xs text-slate-500">según requerimientos de producción</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-600">
                  <th className="py-2">Insumo</th>
                  <th className="py-2">Requerido</th>
                  <th className="py-2">Disponible</th>
                  <th className="py-2">Unidad</th>
                  <th className="py-2">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {purchase.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{row.insumo}</td>
                    <td className="py-2">{fmtNum(row.requerido)}</td>
                    <td className="py-2">{fmtNum(row.disponible)}</td>
                    <td className="py-2">{row.unidad}</td>
                    <td className="py-2"><PriorityPill p={row.prioridad} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top ventas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">Top productos / servicios</div>
            <div className="text-xs text-slate-500">últimos 30 días</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={140} />
                <Tooltip />
                <Bar dataKey="ventas" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
