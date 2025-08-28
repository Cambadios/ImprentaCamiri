import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';

export default function LowStockTable({ umbral = 10 }) {
  const { data, error, loading } = useApi(`/dashboard/inventario/bajo-stock?umbral=${umbral}`, [umbral]);

  return (
    <Card title={`Stock bajo (≤ ${umbral})`}>
      <LoadingError loading={loading} error={error}>
        <DataTable value={data?.data || []} paginator rows={10} size="small" className="text-sm">
          <Column field="nombre" header="Material" sortable />
          <Column field="categoria" header="Categoría" sortable />
          <Column field="cantidadDisponible" header="Cantidad" sortable />
          <Column field="unidadDeMedida" header="Unidad" />
        </DataTable>
      </LoadingError>
    </Card>
  );
}
