import React, { useMemo } from 'react';
import { Chart  } from 'primereact/chart';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

export default function FrequentCustomersBar({ qs, limit = 10 }) {
  const { data, error, loading } = useApi(`/dashboard/clientes/recurrentes${qs}&limit=${limit}`, [qs, limit]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    return {
      labels: rows.map(r => r.nombre),
      datasets: [
        { label: 'Veces', data: rows.map(r => r.veces) },
        { label: 'Total', data: rows.map(r => r.total) }
      ]
    };
  }, [data]);

  return (
    <Card title={`Clientes recurrentes (Top ${limit})`} className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type='bar' data={chartData} options={baseOptions} />
        </div>
      </LoadingError>
    </Card>
  );
}
