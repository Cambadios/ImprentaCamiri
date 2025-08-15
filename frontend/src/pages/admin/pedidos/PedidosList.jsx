import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const PedidoList = ({ pedidos, onEdit, onDelete }) => {
  // Función para formatear la fecha de entrega
  const formatDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-datatable p-datatable-striped">
      <DataTable value={pedidos} paginator rows={10}>
        {/* Accede solo a las propiedades necesarias de cliente */}
        <Column field="cliente.nombre" header="Cliente Nombre" />
        <Column field="cliente.apellido" header="Cliente Apellido" />
        <Column field="producto.nombre" header="Producto" />
        <Column field="cantidad" header="Cantidad" />
        <Column field="estado" header="Estado" />
        <Column field="precioTotal" header="Precio Total" />
        <Column field="pagoCliente" header="Pago Cliente" />
        <Column 
          field="fechaEntrega" 
          header="Fecha Entrega" 
          body={(rowData) => formatDate(rowData.fechaEntrega)} 
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div>
              <Button
                icon="pi pi-pencil"
                className="p-button-info"
                onClick={() => onEdit(rowData)}
                style={{ marginRight: "10px" }}
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

export default PedidoList;
