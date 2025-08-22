// src/components/ClientesList.jsx
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';

const ClientesList = ({ clientes = [], onEdit, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const openDeleteModal = (cliente) => {
    setClienteToDelete(cliente);
    setModalVisible(true);
  };

  const closeDeleteModal = () => {
    setModalVisible(false);
    setClienteToDelete(null);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      onDelete(clienteToDelete._id);
    }
    closeDeleteModal();
  };

  return (
    <div className="card">
      <DataTable value={Array.isArray(clientes) ? clientes : []} paginator rows={5} header="Lista de Clientes" dataKey="_id">
        <Column field="nombre" header="Nombre" />
        <Column field="apellido" header="Apellido" />
        <Column field="telefono" header="Teléfono" />
        <Column field="correo" header="Correo" />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" onClick={() => onEdit(rowData)} />
              <Button icon="pi pi-trash" className="p-button-danger" onClick={() => openDeleteModal(rowData)} />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        visible={isModalVisible}
        style={{ width: '400px' }}
        header="Confirmar Eliminación"
        modal
        onHide={closeDeleteModal}
      >
        <div className="text-center">
          <p className="text-lg">¿Estás seguro de que deseas eliminar a este cliente?</p>
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

export default ClientesList;
