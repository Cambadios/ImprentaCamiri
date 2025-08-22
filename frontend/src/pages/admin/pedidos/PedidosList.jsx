// src/components/PedidoList.jsx
import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const fmtMoney = (v) =>
  typeof v === "number"
    ? v.toLocaleString("es-BO", { style: "currency", currency: "BOB" })
    : v;

const fmtDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const PedidoList = ({ pedidos = [], onEdit, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [pedidoToDelete, setPedidoToDelete] = useState(null);

  const openDeleteModal = (pedido) => {
    setPedidoToDelete(pedido);
    setModalVisible(true);
  };

  const closeDeleteModal = () => {
    setModalVisible(false);
    setPedidoToDelete(null);
  };

  const confirmDelete = () => {
    if (pedidoToDelete?._id) onDelete(pedidoToDelete._id);
    closeDeleteModal();
  };

  // 🔹 Render de nombre completo
  const fullNameBody = (row) => {
    const n = row?.cliente?.nombre ?? "";
    const a = row?.cliente?.apellido ?? "";
    return `${n} ${a}`.trim();
  };

  // 🔹 Render de teléfono seguro
  const phoneBody = (row) => row?.cliente?.telefono ?? "";

  return (
    <div className="card rounded-xl shadow p-4 bg-white">
      <DataTable
        value={Array.isArray(pedidos) ? pedidos : []}
        paginator
        rows={10}
        dataKey="_id"
        responsiveLayout="scroll"
        header="Lista de Pedidos"
        className="w-full"
      >
        {/* 👇 Reemplazo de Nombre/Apellido por Nombre Completo + Teléfono */}
        <Column header="Nombre Completo" body={fullNameBody} />
        <Column header="Teléfono" body={phoneBody} />

        <Column field="producto.nombre" header="Producto" />
        <Column field="cantidad" header="Cantidad" />
        <Column field="estado" header="Estado" />
        <Column header="Total" body={(row) => fmtMoney(row.total)} />
        <Column header="Pagado" body={(row) => fmtMoney(row.pagado)} />
        <Column header="Saldo" body={(row) => fmtMoney(row.saldo)} />
        <Column
          field="fechaEntrega"
          header="Fecha Entrega"
          body={(row) => fmtDate(row.fechaEntrega)}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" onClick={() => onEdit(rowData)} />
              <Button
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => openDeleteModal(rowData)}
              />
            </div>
          )}
          exportable={false}
        />
      </DataTable>

      <Dialog
        visible={isModalVisible}
        style={{ width: "400px" }}
        header="Confirmar Eliminación"
        modal
        onHide={closeDeleteModal}
      >
        <div className="text-center">
          <p className="text-lg">¿Estás seguro de que deseas eliminar este pedido?</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-outlined p-button-secondary"
              onClick={closeDeleteModal}
            />
            <Button
              label="Eliminar"
              icon="pi pi-check"
              className="p-button-danger"
              onClick={confirmDelete}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PedidoList;
