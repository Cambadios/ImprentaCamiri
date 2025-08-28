import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { useApi } from '../../hooks/useApi';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
// Asegúrate de tener chart.js instalado: npm i chart.js

export default function PaymentStatusDonut({ qs = '' }) {
  const { data, error, loading } = useApi(`/dashboard/ventas/estado-pago${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    const labels = rows.map(r => String(r._id ?? 'N/D'));
    const values = rows.map(r => Number(r.count ?? 0));

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'
          ],
          borderWidth: 0
        }
      ]
    };
  }, [data]);

  const options = {
    plugins: { legend: { position: 'bottom' } },
    cutout: '60%',               // estilo “donut”
    responsive: true,
    maintainAspectRatio: false   // permite usar la altura del contenedor
  };

  return (
    <Card title="Estado de pago (distribución)" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-60">
          <Chart type="doughnut" data={chartData} options={options} />
        </div>
      </LoadingError>
    </Card>
  );
}
