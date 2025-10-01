import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { toCanonEstado, ORDER_STATES, nextStatesOfForMaquinaria } from "../../../utils/estados";

export default function PedidosListMaquinaria({
  pedidos = [],
  loading = false,
  onCambiarEstado = () => {},
}) {
  const fullNameBody = (row) => {
    const n = row?.cliente?.nombre ?? "";
    const a = row?.cliente?.apellido ?? "";
    return `${n} ${a}`.trim() || "-";
  };
  const phoneBody = (row) => row?.cliente?.telefono ?? "-";
  const productoBody = (row) => row?.producto?.nombre ?? row?.productoNombre ?? "-";
  const cantidadBody = (row) => row?.cantidad ?? "-";

  const fechaBody = (row) => {
    const v = row?.fechaEntrega;
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d)) return v;
    return d.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const estadoChecksBody = (row) => {
    const current = toCanonEstado(row?.estado) || "Pendiente";
    const allowedNext = nextStatesOfForMaquinaria(current);

    return (
      <div className="flex flex-wrap gap-3">
        {ORDER_STATES.map((st) => {
          const isCurrent = st === current;
          const isAllowedNext = allowedNext.includes(st);
          const disabled = !isCurrent && !isAllowedNext;

          return (
            <label key={st} className={`inline-flex items-center gap-2 ${disabled ? "opacity-50" : ""}`}>
              <Checkbox
                inputId={`${row._id}-${st}`}
                checked={isCurrent}
                disabled={disabled}
                onChange={() => {
                  if (isAllowedNext) onCambiarEstado(row, st);
                }}
              />
              <span>{st}</span>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <DataTable
        value={Array.isArray(pedidos) ? pedidos : []}
        loading={loading}
        header="Lista de Pedidos"
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
        stripedRows
        size="small"
        responsiveLayout="scroll"
        className="text-sm"
        emptyMessage="Sin resultados"
        showGridlines
        resizableColumns
        columnResizeMode="fit"
        dataKey="_id"
      >
        <Column header="#" body={(_, { rowIndex }) => rowIndex + 1} style={{ width: "4rem" }} />
        <Column header="Nombre Completo" body={fullNameBody} sortable />
        <Column header="Teléfono" body={phoneBody} />
        <Column header="Producto" body={productoBody} />
        <Column header="Cantidad" body={cantidadBody} style={{ width: "8rem" }} />
        <Column header="Estado" body={estadoChecksBody} style={{ minWidth: "22rem" }} />
        <Column header="Fecha Entrega" body={fechaBody} style={{ width: "12rem" }} />
      </DataTable>
    </div>
  );
}
