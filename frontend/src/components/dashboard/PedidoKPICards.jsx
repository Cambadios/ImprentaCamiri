// src/components/PedidoKPICards.jsx
import React, { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import { apiFetch } from "../../api/http";

const fmtNumber = (n) =>
  new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(Number(n || 0));

export default function PedidoKPICards({ from, to }) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    realizados: 0,
    porHacer: 0,
    totalPedidos: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        if (from) qs.set("from", from);
        if (to) qs.set("to", to);
        const url = `/pedidos/kpis${qs.toString() ? `?${qs.toString()}` : ""}`;
        const resp = await apiFetch(url);
        if (!resp?.ok) {
          const data = await (async () => { try { return await resp.json(); } catch { return {}; }})();
          throw new Error(data?.message || "No se pudieron cargar los KPIs de pedidos.");
        }
        const data = await resp.json();
        // Solo nos quedamos con los 3 necesarios
        setKpi({
          realizados: Number(data.hechos || 0),
          porHacer: Number(data.pendientes || 0),
          totalPedidos: Number(data.totalPedidos || 0),
        });
      } catch (e) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: e.message || "Fallo al obtener KPIs",
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [from, to]);

  const CardBox = ({ title, value, icon, color, tooltip }) => (
    <Card className="shadow-sm !border !border-gray-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color} text-white`} data-pr-tooltip={tooltip}>
          <i className={`pi ${icon} text-xl`} />
        </div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          {loading ? (
            <Skeleton width="6rem" height="1.5rem" className="mt-1" />
          ) : (
            <div className="text-2xl font-semibold text-gray-800">{fmtNumber(value)}</div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="mb-6">
      <Toast ref={toast} position="top-right" className="!drop-shadow-lg !rounded-lg" />
      <Tooltip target="[data-pr-tooltip]" position="top" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <CardBox
          title="Pedidos realizados"
          value={kpi.realizados}
          icon="pi-check-circle"
          color="bg-green-500"
          tooltip="Pedidos con estado Entregado"
        />
        <CardBox
          title="Pedidos por hacer"
          value={kpi.porHacer}
          icon="pi-list-check"
          color="bg-blue-500"
          tooltip="Pedidos con estado Pendiente"
        />
        <CardBox
          title="Total de pedidos"
          value={kpi.totalPedidos}
          icon="pi-database"
          color="bg-slate-600"
          tooltip="Cantidad total de pedidos en el rango"
        />
      </div>
    </div>
  );
}
