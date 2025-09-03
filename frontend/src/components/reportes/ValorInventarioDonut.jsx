import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function ValorInventarioDonut({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/inventario/valor-por-categoria${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    const labels = rows.map(r => r._id || 'Sin categoría');
    const values = rows.map(r => Number(r.valor || 0));
    return { labels, datasets: [{ data: values }] };
  }, [data]);

  const options = { maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

  return (
    <Card title="Valor de inventario por categoría" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="doughnut" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
