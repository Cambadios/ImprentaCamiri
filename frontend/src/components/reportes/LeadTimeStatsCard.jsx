import React from 'react';
import { Card } from 'primereact/card';
import LoadingError from '../dashboard/LoadingError';
import { useApi } from '../../hooks/useApi';

export default function LeadTimeStatsCard({ qs = '' }) {
  const { data, error, loading } = useApi(`/reportes/operaciones/lead-time${qs}`, [qs]);
  const avg = data?.avg ?? null;
  const min = data?.min ?? null;
  const max = data?.max ?? null;

  return (
    <Card title="Lead time (días)">
      <LoadingError loading={loading} error={error}>
        <div className="grid grid-cols-3 text-center py-4">
          <div>
            <div className="text-3xl font-semibold">{avg?.toFixed ? avg.toFixed(1) : '-'}</div>
            <div className="text-xs text-gray-500 mt-1">Promedio</div>
          </div>
          <div>
            <div className="text-3xl font-semibold">{min ?? '-'}</div>
            <div className="text-xs text-gray-500 mt-1">Mínimo</div>
          </div>
          <div>
            <div className="text-3xl font-semibold">{max ?? '-'}</div>
            <div className="text-xs text-gray-500 mt-1">Máximo</div>
          </div>
        </div>
      </LoadingError>
    </Card>
  );
}
