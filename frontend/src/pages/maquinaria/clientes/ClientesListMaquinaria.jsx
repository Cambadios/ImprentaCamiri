import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

/**
 * Listado de clientes (solo lectura) para rol Maquinaria.
 */
export default function ClientesListMaquinaria({ clientes = [], loading = false }) {
  const txt = (field) => (row) => row?.[field] ?? "-";
  const safeEmail = (row) => row?.correo || row?.email || "-";

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <DataTable
        value={Array.isArray(clientes) ? clientes : []}
        loading={loading}
        header="Lista de Clientes"
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
        <Column field="nombre"    header="Nombre"    body={txt("nombre")}    sortable />
        <Column field="apellido"  header="Apellido"  body={txt("apellido")}  sortable />
        <Column field="telefono"  header="Teléfono"  body={txt("telefono")}  sortable />
        <Column header="Correo"   body={safeEmail}   sortable />
      </DataTable>
    </div>
  );
}
