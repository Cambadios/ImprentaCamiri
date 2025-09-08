import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";

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

const PedidosList = ({ pedidos = [], onEdit, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [pedidoToDelete, setPedidoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = (pedido) => {
    setPedidoToDelete(pedido);
    setModalVisible(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setModalVisible(false);
    setPedidoToDelete(null);
  };

  const confirmDelete = async () => {
    if (!pedidoToDelete?._id) return;
    try {
      setDeleting(true);
      await onDelete(pedidoToDelete._id);
      setModalVisible(false);
      setPedidoToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const fullNameBody = (row) => {
    const n = row?.cliente?.nombre ?? "";
    const a = row?.cliente?.apellido ?? "";
    return `${n} ${a}`.trim();
  };

  const phoneBody = (row) => row?.cliente?.telefono ?? "";

  const getEstadoSeverity = (estadoRaw) => {
    const e = String(estadoRaw || "").toLowerCase();
    if (e === "pendiente") return "warning";
    if (e === "en proceso") return "info";
    if (e === "entregado") return "success";
    if (e === "cancelado") return "danger";
    return "secondary";
  };

  const estadoBody = (row) => {
    const estado = row?.estado ?? "—";
    return (
      <Tag
        value={estado}
        severity={getEstadoSeverity(estado)}
        rounded
        className="px-3 py-1 text-xs font-semibold"
      />
    );
  };

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
        <Column header="Nombre Completo" body={fullNameBody} />
        <Column header="Teléfono" body={phoneBody} />
        <Column field="producto.nombre" header="Producto" />
        <Column field="cantidad" header="Cantidad" />
        <Column header="Estado" body={estadoBody} />
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
        header="Confirmar eliminación"
        modal
        onHide={closeDeleteModal}
      >
        <div className="text-center">
          <p className="text-lg">
            ¿Estás seguro de que deseas eliminar este pedido?
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-outlined p-button-secondary"
              onClick={closeDeleteModal}
              disabled={deleting}
            />
            <Button
              label={deleting ? "Eliminando..." : "Eliminar"}
              icon="pi pi-check"
              className="p-button-danger"
              onClick={confirmDelete}
              disabled={deleting}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PedidosList;
