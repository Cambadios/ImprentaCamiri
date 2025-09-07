import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

const ProductoList = ({ productos, onEdit, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);

  const openDeleteModal = (producto) => { setProductoToDelete(producto); setModalVisible(true); };
  const closeDeleteModal = () => { setModalVisible(false); setProductoToDelete(null); };
  const confirmDelete = () => { if (productoToDelete) onDelete(productoToDelete._id); closeDeleteModal(); };

  const precioBody = (row) =>
    typeof row.precioUnitario === 'number'
      ? row.precioUnitario.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
      : row.precioUnitario;

  const categoriaBody = (row) => row?.categoria?.nombre || '—';

  const materialesBody = (row) => {
    if (!row.materiales || row.materiales.length === 0) {
      return <span className="text-gray-400">Sin materiales</span>;
    }
    return (
      <div className="space-y-1">
        {row.materiales.map((mat, idx) => {
          if (!mat.material) return null;
          const nombre = mat.material.nombre || 'Material';
          const unidad = mat.material.unidadDeMedida || 'unidad'; // **ojo**: unidadDeMedida (Inventario)
          const cant = mat.cantidadPorUnidad || 0;
          return (
            <div key={idx} className="flex items-center gap-1 text-sm">
              <span className="font-medium">{nombre}:</span>
              <span className="text-blue-700">
                {cant} {cant === 1 ? unidad : `${unidad}${unidad.endsWith('s') ? '' : 's'}`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="card">
      <DataTable value={productos} paginator rows={10} header="Lista de Productos" className="p-datatable-sm" responsiveLayout="scroll">
        <Column field="codigo" header="Código" style={{ minWidth: 120 }} />
        <Column field="nombre" header="Nombre" style={{ minWidth: 200 }} />
        <Column field="descripcion" header="Descripción" style={{ minWidth: 260 }} />
        <Column header="Categoría" body={categoriaBody} style={{ minWidth: 160 }} />
        <Column header="Precio" body={precioBody} style={{ minWidth: 140 }} />
        <Column header="Materiales" body={materialesBody} style={{ minWidth: 280 }} />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" onClick={() => onEdit(rowData)} />
              <Button icon="pi pi-trash" className="p-button-danger" onClick={() => openDeleteModal(rowData)} />
            </div>
          )}
          style={{ minWidth: 140 }}
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
          <p className="text-lg">¿Estás seguro de que deseas eliminar este producto?</p>
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

export default ProductoList;
