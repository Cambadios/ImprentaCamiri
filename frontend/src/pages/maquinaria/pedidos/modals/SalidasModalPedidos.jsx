// src/pages/maquinaria/pedidos/modals/SalidasModalPedidos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { apiFetch } from "../../../../api/http";

/**
 * Modal para listar movimientos de tipo SALIDA, filtrados desde pedidos.
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 */
export default function SalidasModalPedidos({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // 1-indexed
  const [limit, setLimit] = useState(20);

  const [q, setQ] = useState("");
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);

  const pageSizeOptions = useMemo(
    () => [
      { label: "10", value: 10 },
      { label: "20", value: 20 },
      { label: "50", value: 50 },
      { label: "100", value: 100 },
    ],
    []
  );

  const fetchSalidas = async (opts = {}) => {
    const params = new URLSearchParams();
    params.set("tipo", "SALIDA");
    params.set("page", String(opts.page ?? page));
    params.set("limit", String(opts.limit ?? limit));
    if (q?.trim()) params.set("q", q.trim());
    if (desde) params.set("desde", desde.toISOString());
    if (hasta) params.set("hasta", hasta.toISOString());

    setLoading(true);
    try {
      const res = await apiFetch(`/inventario/movimientos?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(Number(data.total || 0));
      setPage(Number(data.page || 1));
      setLimit(Number(data.limit || limit));
    } catch (err) {
      console.error("Error cargando salidas:", err);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      fetchSalidas({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onPageChange = (e) => {
    const nextPage = (e.page ?? 0) + 1; // PrimeReact usa 0-indexed
    setPage(nextPage);
    fetchSalidas({ page: nextPage, limit });
  };

  const onChangeLimit = (val) => {
    setLimit(val);
    setPage(1);
    fetchSalidas({ page: 1, limit: val });
  };

  const onBuscar = () => {
    setPage(1);
    fetchSalidas({ page: 1 });
  };

  // === Helpers para render ===
  const fechaBody = (row) =>
    row?.fecha ? new Date(row.fecha).toLocaleString("es-BO") : "—";

  const cantidadBody = (row) =>
    `${row.cantidad} ${row.unidadDeMedida || ""}`.trim();

  const insumoBody = (row) => {
    const i = row.insumo || {};
    if (typeof i === "object") {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{i.nombre || "—"}</span>
          <small className="text-gray-500">{i.codigo || i._id || ""}</small>
        </div>
      );
    }
    return String(i || "—");
  };

  return (
    <Dialog
      header="Salidas de Pedidos"
      visible={open}
      style={{ width: 1000, maxWidth: "96vw" }}
      modal
      onHide={onClose}
    >
      <div className="space-y-3">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-1">Desde</label>
            <Calendar
              value={desde}
              onChange={(e) => setDesde(e.value)}
              showIcon
              placeholder="Fecha inicio"
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-1">Hasta</label>
            <Calendar
              value={hasta}
              onChange={(e) => setHasta(e.value)}
              showIcon
              placeholder="Fecha fin"
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-1">Buscar</label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search" />
              <InputText
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Motivo (ej. consumo, ajuste...)"
                className="w-full"
              />
            </span>
          </div>
          <div className="col-span-1 flex items-end gap-2">
            <Button label="Buscar" icon="pi pi-search" onClick={onBuscar} />
            <Dropdown
              value={limit}
              options={pageSizeOptions}
              onChange={(e) => onChangeLimit(e.value)}
              placeholder="Filas"
              className="ml-auto"
            />
          </div>
        </div>

        {/* Tabla */}
        <DataTable
          value={items}
          loading={loading}
          paginator
          rows={limit}
          totalRecords={total}
          first={(page - 1) * limit}
          onPage={onPageChange}
          className="p-datatable-sm"
          responsiveLayout="scroll"
          emptyMessage="Sin salidas"
        >
          <Column header="Fecha" body={fechaBody} style={{ minWidth: 160 }} />
          <Column header="Insumo" body={insumoBody} style={{ minWidth: 240 }} />
          <Column header="Cantidad" body={cantidadBody} style={{ minWidth: 120 }} />
          <Column field="motivo" header="Motivo" style={{ minWidth: 220 }} />
        </DataTable>
      </div>
    </Dialog>
  );
}
