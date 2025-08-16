import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

const ProductoList = ({ productos, onEdit, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);

  const openDeleteModal = (producto) => {
    setProductoToDelete(producto);
    setModalVisible(true);
  };

  const closeDeleteModal = () => {
    setModalVisible(false);
    setProductoToDelete(null);
  };

  const confirmDelete = () => {
    if (productoToDelete) {
      onDelete(productoToDelete._id);
    }
    closeDeleteModal();
  };

  return (
    <div className="card">
      <DataTable value={productos} paginator rows={10} header="Lista de Productos">
        <Column field="nombre" header="Nombre" />
        <Column field="descripcion" header="Descripción" />
        <Column field="precioUnitario" header="Precio" />
        
        <Column
          header="Materiales"
          body={(rowData) => {
            if (!rowData.materiales || rowData.materiales.length === 0) {
              return <span className="text-gray-400">Sin materiales</span>;
            }
            
            return (
              <div className="space-y-1">
                {rowData.materiales.map((mat, index) => {
                  if (!mat.material) {
                    return null;
                  }
                  const nombreMaterial = mat.material.nombre || 'Material sin nombre';
                  const cantidad = mat.cantidadPorUnidad || 0;
                  const unidad = mat.material.unidadDeMedida || 'unidad';
                  
                  return (
                    <div key={index} className="flex items-center gap-1 text-sm">
                      <span className="font-medium">{nombreMaterial}:</span>
                      <span className="text-blue-600">
                        {cantidad} {cantidad === 1 ? unidad : `${unidad}${unidad.endsWith('s') ? '' : 's'}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
        
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                onClick={() => onEdit(rowData)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => openDeleteModal(rowData)}
              />
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
