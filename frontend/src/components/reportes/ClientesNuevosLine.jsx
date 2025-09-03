import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function ClientesNuevosLine({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/clientes/nuevos${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    const labels = rows.map(r => new Date(r._id).toLocaleDateString());
    const values = rows.map(r => Number(r.nuevos || 0));
    return { labels, datasets: [{ label: 'Nuevos clientes', data: values, tension: 0.2 }] };
  }, [data]);

  const options = { maintainAspectRatio: false, scales: { y: { beginAtZero: true } } };

  return (
    <Card title="Nuevos clientes" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="line" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
