// src/pages/admin/usuarios/UsuariosList.jsx
import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";

const roleSeverity = (rol) => {
  switch (rol) {
    case "admin":
    case "administrador":
      return "danger";
    case "usuario":
    case "usuario_normal":
    default:
      return "success";
  }
};

const roleDisplay = (rol) => {
  if (rol === "usuario" || rol === "usuario_normal") return "MAQUINARIA";
  if (rol === "admin" || rol === "administrador") return "ADMIN";
  return (rol || "").toUpperCase();
};

const UsuariosList = ({ rows = [], loading, onEdit, onDelete, onSendRecovery }) => {
  // Modal de confirmación (mismo patrón que ClientesList)
  const [isModalVisible, setModalVisible] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  const openDeleteModal = (usuario) => {
    setUsuarioToDelete(usuario);
    setModalVisible(true);
  };

  const closeDeleteModal = () => {
    setModalVisible(false);
    setUsuarioToDelete(null);
  };

  const confirmDelete = () => {
    if (usuarioToDelete) onDelete(usuarioToDelete);
    closeDeleteModal();
  };

  const rolBody = (row) => (
    <Tag value={roleDisplay(row.rol)} severity={roleSeverity(row.rol)} />
  );

  const accionesBody = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        onClick={() => onEdit(row)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-envelope"
        rounded
        text
        onClick={() => onSendRecovery(row)}
        tooltip="Enviar recuperación"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => openDeleteModal(row)}
        tooltip="Eliminar"
      />
    </div>
  );

  return (
    <div className="card rounded-xl shadow p-4 bg-white">
      <DataTable
        value={Array.isArray(rows) ? rows : []}
        loading={loading}
        paginator
        rows={10}
        stripedRows
        size="small"
        emptyMessage="No hay usuarios"
        responsiveLayout="scroll"
        header="Lista de Usuarios"
        dataKey="_id"
        className="w-full"
      >
        <Column field="nombreCompleto" header="Nombre" sortable />
        <Column field="correo" header="Correo" sortable />
        <Column field="telefono" header="Teléfono" />
        <Column field="carnetIdentidad" header="CI" />
        <Column field="rol" header="Rol" body={rolBody} sortable />
        <Column
          header="Acciones"
          body={accionesBody}
          exportable={false}
          style={{ width: 220, textAlign: "center" }}
        />
      </DataTable>

      {/* Modal de confirmación */}
      <Dialog
        visible={isModalVisible}
        style={{ width: "400px" }}
        header="Confirmar Eliminación"
        modal
        onHide={closeDeleteModal}
      >
        <div className="text-center">
          <p className="text-lg">
            ¿Estás seguro de que deseas eliminar este usuario?
          </p>
        </div>

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
      </Dialog>
    </div>
  );
};

export default UsuariosList;
