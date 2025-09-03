import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function EstadoPagoDonut({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/ventas/estado-pago${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    const labels = rows.map(r => String(r._id ?? 'N/D'));
    const values = rows.map(r => Number(r.count ?? 0));
    return { labels, datasets: [{ data: values }] };
  }, [data]);

  const options = { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  return (
    <Card title="Estado de pago (distribución)" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="doughnut" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
