import React, { useMemo } from 'react';
import { Chart  } from 'primereact/chart';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

export default function InventoryValueByCategoryBar() {
  const { data, error, loading } = useApi(`/dashboard/inventario/valor-por-categoria`, []);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    return {
      labels: rows.map(r => r.categoria),
      datasets: [{ label: 'Valor (Bs.)', data: rows.map(r => r.valor) }]
    };
  }, [data]);

  return (
    <Card title="Valor del inventario por categoría" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type='bar' data={chartData} options={baseOptions} />
        </div>
      </LoadingError>
    </Card>
  );
}
