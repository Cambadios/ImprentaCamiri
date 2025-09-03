import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function RecurrentesVsUnicosDonut({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/clientes/recurrentes-vs-unicos${qs}`, [qs]);

  const chartData = useMemo(() => {
    const d = data || { unicos: 0, recurrentes: 0 };
    const labels = ['Únicos', 'Recurrentes'];
    const values = [Number(d.unicos || 0), Number(d.recurrentes || 0)];
    return { labels, datasets: [{ data: values }] };
  }, [data]);

  const options = { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  return (
    <Card title="Clientes: únicos vs recurrentes" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="doughnut" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
