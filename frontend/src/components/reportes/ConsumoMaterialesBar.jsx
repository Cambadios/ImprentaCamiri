import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function ConsumoMaterialesBar({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/productos/consumo-materiales${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    const labels = rows.map(r => r.nombre);
    const values = rows.map(r => Number(r.totalConsumo || 0));
    return { labels, datasets: [{ label: 'Consumo', data: values }] };
  }, [data]);

  const options = { maintainAspectRatio: false, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

  return (
    <Card title="Consumo de materiales (estimado)" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="bar" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
