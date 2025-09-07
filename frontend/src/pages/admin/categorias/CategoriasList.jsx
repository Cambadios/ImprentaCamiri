// src/components/CategoriasList.jsx
import React from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";

export default function CategoriasList({ categorias = [], onEdit, onDelete }) {
  const actionsBody = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-warning"
        onClick={() => onEdit(row)}
        aria-label="Editar"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-sm p-button-danger"
        onClick={() => onDelete(row._id ?? row.id)}
        aria-label="Eliminar"
      />
    </div>
  );

  const tipoBody = (row) => (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        row?.tipo === "insumo"
          ? "bg-blue-100 text-blue-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      {row?.tipo ?? "-"}
    </span>
  );

  const prefijoBody = (row) => (
    <span className="font-mono tracking-wide uppercase">
      {row?.prefijo ?? "-"}
    </span>
  );

  return (
    <>
      <Tooltip target=".p-button-warning" position="top" />
      <Tooltip target=".p-button-danger" position="top" />

      <DataTable
        value={categorias}
        paginator
        rows={10}
        emptyMessage="No hay categorías para mostrar."
        className="shadow-sm"
        responsiveLayout="scroll"
        dataKey="_id"
      >
        <Column field="nombre" header="Nombre" sortable />
        <Column field="prefijo" header="Prefijo" body={prefijoBody} sortable />
        <Column field="tipo" header="Tipo" body={tipoBody} sortable />
        <Column field="descripcion" header="Descripción" />
        <Column header="Acciones" body={actionsBody} style={{ width: "140px" }} />
      </DataTable>
    </>
  );
}
