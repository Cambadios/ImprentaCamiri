import React, { useMemo } from 'react';
import { Chart  } from 'primereact/chart';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

export default function MaterialRotationBar({ qs }) {
  const { data, error, loading } = useApi(`/dashboard/inventario/rotacion-materiales${qs}`, [qs]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    return {
      labels: rows.map(r => r.nombre),
      datasets: [{ label: 'Consumo (estimado)', data: rows.map(r => r.totalConsumido) }]
    };
  }, [data]);

  return (
    <Card title="Rotación de materiales (estimado)" className="h-80">
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type='bar' data={chartData} options={baseOptions} />
        </div>
      </LoadingError>
    </Card>
  );
}
