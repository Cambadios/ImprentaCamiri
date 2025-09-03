import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function FunnelEstadosBar({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/operaciones/funnel-estados${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    const labels = rows.map(r => r._id || 'N/D');
    const values = rows.map(r => Number(r.count || 0));
    return { labels, datasets: [{ label: 'Pedidos', data: values }] };
  }, [data]);

  const options = { maintainAspectRatio: false, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

  return (
    <Card title="Funnel de estados de pedido" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="bar" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
