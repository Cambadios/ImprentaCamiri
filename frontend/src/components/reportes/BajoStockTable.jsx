import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function BajoStockTable({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/inventario/bajo-stock${qs}`, [qs]);
  const rows = data?.data || [];

  return (
    <Card title="Materiales con bajo stock">
      <LoadingError loading={loading} error={error}>
        <DataTable value={rows} size="small" paginator rows={10} className="text-sm">
          <Column field="nombre" header="Material" />
          <Column field="categoria" header="Categoría" />
          <Column field="cantidadDisponible" header="Disponible" />
          <Column field="unidadDeMedida" header="Unidad" />
          <Column field="precioUnitario" header="Precio U." />
        </DataTable>
      </LoadingError>
    </Card>
  );
}
