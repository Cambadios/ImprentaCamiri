import React, { useMemo } from 'react';
import { Chart  } from 'primereact/chart';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

export default function ProductMarginBar() {
  const { data, error, loading } = useApi(`/dashboard/productos/margen`, []);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    return {
      labels: rows.map(r => r.nombre),
      datasets: [
        { label: 'Precio', data: rows.map(r => r.precioUnitario) },
        { label: 'Costo BOM', data: rows.map(r => r.costoBOM) },
        { label: 'Margen', data: rows.map(r => r.margenEstimado) }
      ]
    };
  }, [data]);

  return (
    <Card title="Margen estimado por producto" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type='bar' data={chartData} options={baseOptions} />
        </div>
      </LoadingError>
    </Card>
  );
}
