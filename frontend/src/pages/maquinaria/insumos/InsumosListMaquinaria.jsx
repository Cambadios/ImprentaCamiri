import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const fmtDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return String(date);
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const fmtMoneyBOB = (v) =>
  typeof v === "number"
    ? v.toLocaleString("es-BO", { style: "currency", currency: "BOB" })
    : v ?? "-";

/**
 * Listado de insumos (solo lectura) para Maquinaria.
 */
export default function InsumosListMaquinaria({ insumos = [], loading = false }) {
  const nombreBody = (row) => {
    const desc = row?.descripcion || "";
    return (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{row?.nombre ?? "-"}</span>
        {desc ? (
          <span
            title={desc}
            className="text-gray-600 text-xs"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {desc}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <DataTable
        value={Array.isArray(insumos) ? insumos : []}
        loading={loading}
        header="Lista de Insumos"
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
        <Column field="codigo" header="Código" sortable />
        <Column header="Nombre / Descripción" body={nombreBody} />
        <Column field="categoria" header="Categoría" sortable />
        <Column field="cantidadDisponible" header="Cantidad" style={{ width: "8rem" }} sortable />
        <Column field="unidadDeMedida" header="Unidad" style={{ width: "8rem" }} />
        <Column header="Precio Unitario" body={(r) => fmtMoneyBOB(r?.precioUnitario)} style={{ width: "10rem" }} />
        <Column field="fechaIngreso" header="Ingreso" body={(r) => fmtDate(r?.fechaIngreso)} style={{ width: "12rem" }} />
      </DataTable>
    </div>
  );
}
