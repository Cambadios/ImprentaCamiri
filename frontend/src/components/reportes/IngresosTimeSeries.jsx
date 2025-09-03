import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function IngresosTimeSeries({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/ventas/ingresos${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    const labels = rows.map(r => new Date(r._id).toLocaleDateString());
    const values = rows.map(r => Number(r.ingreso || 0));
    return {
      labels,
      datasets: [
        { label: 'Ingresos', data: values, fill: true, tension: 0.2 }
      ]
    };
  }, [data]);

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <Card title="Ingresos por período" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="line" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
