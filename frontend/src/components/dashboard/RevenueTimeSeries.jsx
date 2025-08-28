import React, { useMemo } from 'react';
import { Chart  } from 'primereact/chart';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

export default function RevenueTimeSeries({ qs, granularity = 'day' }) {
  const { data, error, loading } = useApi(`/dashboard/ventas/ingresos${qs}&granularity=${granularity}`, [qs, granularity]);

  const chartData = useMemo(() => {
    const labels = (data?.data || []).map(d => d._id);
    const ingresos = (data?.data || []).map(d => d.ingresos);
    const pedidos  = (data?.data || []).map(d => d.pedidos);
    return {
      labels,
      datasets: [
        { label: 'Ingresos', data: ingresos, borderWidth: 2, fill: false, tension: 0.25 },
        { label: 'Pedidos', data: pedidos, borderWidth: 1, fill: false, tension: 0.25 }
      ]
    };
  }, [data]);

  return (
    <Card title="Ingresos por período" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type="line" data={chartData} options={baseOptions} />
        </div>
      </LoadingError>
    </Card>
  );
}
