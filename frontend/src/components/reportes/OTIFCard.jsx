import React from 'react';
import { Card } from 'primereact/card';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function OTIFCard({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/operaciones/otif${qs}`, [qs]);
  const pct = Math.round((data?.pct || 0) * 100);

  return (
    <Card title="OTIF (a tiempo)">
      <LoadingError loading={loading} error={error}>
        <div className="text-center py-6">
          <div className="text-5xl font-semibold">{pct}%</div>
          <div className="text-sm text-gray-500 mt-2">Pedidos entregados a tiempo</div>
        </div>
      </LoadingError>
    </Card>
  );
}
