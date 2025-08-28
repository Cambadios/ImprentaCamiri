import React, { useMemo } from 'react';
import { Chart  } from 'primereact/chart';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

export default function TopProductsBar({ qs, limit = 10 }) {
  const { data, error, loading } = useApi(`/dashboard/productos/top${qs}&limit=${limit}`, [qs, limit]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    return {
      labels: rows.map(r => r.nombre),
      datasets: [
        { label: 'Ingresos', data: rows.map(r => r.ingresos) },
        { label: 'Unidades', data: rows.map(r => r.unidades) }
      ]
    };
  }, [data]);

  return (
    <Card title={`Top ${limit} productos por ingresos`} className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type='bar' data={chartData} options={baseOptions} />
        </div>
      </LoadingError>
    </Card>
  );
}
