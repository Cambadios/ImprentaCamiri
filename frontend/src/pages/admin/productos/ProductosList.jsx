import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const ProductoList = ({ productos, onEdit, onDelete }) => {
  return (
    <div className="card">
      <DataTable value={productos} paginator rows={10}>
        <Column field="nombre" header="Nombre" />
        <Column field="descripcion" header="Descripción" />
        <Column field="precioUnitario" header="Precio" />
        
        {/* Verificar si existen los materiales antes de intentar acceder a ellos */}
        <Column
          header="Materiales"
          body={(rowData) => {
            return rowData.materiales && rowData.materiales.length > 0
              ? rowData.materiales.map((material, index) => (
                  <div key={index}>
                    {material.material && material.material.nombre} - {material.cantidadPorUnidad} unidades
                  </div>
                ))
              : 'No materiales disponibles';  // Mostrar mensaje si no hay materiales
          }}
        />
        
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-info"
                onClick={() => onEdit(rowData)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => onDelete(rowData._id)}
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
};

export default ProductoList;
