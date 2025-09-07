// src/pages/Inventario/InventarioList.jsx
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';

const InventarioList = ({ inventarios, onEdit, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const nombreBody = (row) => {
    const desc = row.descripcion || '';
    return (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{row.nombre}</span>
        {desc ? (
          <span
            title={desc}
            className="text-gray-600 text-sm"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {desc}
          </span>
        ) : null}
      </div>
    );
  };

  const categoriaBody = (row) => row?.categoria?.nombre || '-';
  const marcaBody = (row) => row?.marca || '—';

  const openDeleteModal = (producto) => { setProductoToDelete(producto); setModalVisible(true); };
  const closeDeleteModal = () => { setModalVisible(false); setProductoToDelete(null); };
  const confirmDelete = () => { if (productoToDelete) onDelete(productoToDelete._id); closeDeleteModal(); };

  const precioBody = (row) =>
    typeof row.precioUnitario === 'number'
      ? row.precioUnitario.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
      : row.precioUnitario;

  return (
    <div className="card">
      <DataTable value={inventarios} paginator rows={10} className="p-datatable-sm" responsiveLayout="scroll">
        <Column field="codigo" header="Código" style={{ minWidth: 110 }} />
        <Column header="Nombre / Descripción" body={nombreBody} style={{ minWidth: 260 }} />
        <Column header="Categoría" body={categoriaBody} style={{ minWidth: 150 }} />
        <Column header="Marca" body={marcaBody} style={{ minWidth: 130 }} />
        <Column field="cantidadDisponible" header="Cantidad" style={{ minWidth: 110 }} />
        <Column field="unidadDeMedida" header="Unidad" style={{ minWidth: 110 }} />
        <Column header="Precio Unitario" body={precioBody} style={{ minWidth: 150 }} />
        <Column header="Ingreso" body={(r) => formatDate(r.fechaIngreso)} style={{ minWidth: 140 }} />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" onClick={() => onEdit(rowData)} />
              <Button icon="pi pi-trash" className="p-button-danger" onClick={() => openDeleteModal(rowData)} />
            </div>
          )}
          style={{ minWidth: 130 }}
        />
      </DataTable>

      <Dialog
        visible={isModalVisible}
        style={{ width: '400px' }}
        header="Confirmar Eliminación"
        modal
        onHide={closeDeleteModal}
        className="shadow-lg rounded-xl bg-white"
      >
        <div className="text-center">
          <p className="text-lg">¿Estás seguro de que deseas eliminar este insumo?</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-outlined text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              onClick={closeDeleteModal}
            />
            <Button label="Eliminar" icon="pi pi-check" className="p-button-danger" onClick={confirmDelete} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InventarioList;
