import React, { useMemo, useState } from 'react';
import { Chart  } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

export default function NewCustomersChart({ qs }) {
  const [gran, setGran] = useState('month');
  const { data, error, loading } = useApi(`/dashboard/clientes/nuevos${qs}&granularity=${gran}`, [qs, gran]);

  const chartData = useMemo(() => {
    const rows = data?.data || [];
    return {
      labels: rows.map(r => r._id),
      datasets: [{ label: 'Nuevos clientes', data: rows.map(r => r.nuevos) }]
    };
  }, [data]);

  return (
    <Card title="Nuevos clientes">
      <div className="mb-2">
        <Dropdown
          value={gran}
          options={[{label:'Mensual', value:'month'},{label:'Diario', value:'day'}]}
          onChange={(e)=>setGran(e.value)}
          className="w-40"
        />
      </div>
      <LoadingError loading={loading} error={error}>
        <div className="h-64">
          <Chart type='bar' data={chartData} options={baseOptions} />
        </div>
      </LoadingError>
    </Card>
  );
}
