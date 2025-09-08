import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { toCanonEstado } from "../../../utils/estados"; // ⬅️ util de estados

/**
 * Lista de pedidos (Maquinaria): solo lectura + acción de cambiar estado.
 * Props:
 *  - pedidos: []
 *  - loading: boolean
 *  - onCambiarEstado: (row) => void
 */
export default function PedidosListMaquinaria({ pedidos = [], loading = false, onCambiarEstado = () => {} }) {
  const fullNameBody = (row) => {
    const n = row?.cliente?.nombre ?? "";
    const a = row?.cliente?.apellido ?? "";
    return `${n} ${a}`.trim() || "-";
  };
  const phoneBody = (row) => row?.cliente?.telefono ?? "-";
  const productoBody = (row) => row?.producto?.nombre ?? row?.productoNombre ?? "-";
  const cantidadBody = (row) => row?.cantidad ?? "-";

  // ⬇️ mostrar estado ya canónico
  const estadoBody = (row) => toCanonEstado(row?.estado) || "-";

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
        <Column header="Estado" body={estadoBody} style={{ width: "10rem" }} sortable />
        <Column header="Fecha Entrega" body={fechaBody} style={{ width: "12rem" }} />
        <Column
          header="Acciones"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                label="Estado"
                icon="pi pi-pencil"
                onClick={() => onCambiarEstado(row)}
                outlined
              />
            </div>
          )}
          exportable={false}
          style={{ width: "10rem" }}
        />
      </DataTable>
    </div>
  );
}
