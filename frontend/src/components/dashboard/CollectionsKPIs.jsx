import React, { useMemo } from 'react';
import LoadingError from './LoadingError';
import KPICard from './KPICard';
import { useApi } from '../../hooks/useApi';

/**
 * KPIs de cobranza: total, cobrado, saldo pendiente, porcentaje cobrado.
 * Props:
 * - qs: string (querystring con filtros)
 */
export default function CollectionsKPIs({ qs }) {
  const { data, error, loading } = useApi(`/dashboard/ventas/cobranza${qs}`, [qs]);

  const kpis = useMemo(() => ({
    total: data?.resumen?.total ?? 0,
    pagado: data?.resumen?.pagado ?? 0,
    saldo: data?.resumen?.saldo ?? 0,
    porcentaje: data?.resumen?.porcentajeCobrado ?? 0
  }), [data]);

  return (
    <LoadingError loading={loading} error={error}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Ingresos (rango)"
          value={`Bs. ${kpis.total.toFixed(2)}`}
        />
        <KPICard
          title="Cobrado"
          value={`Bs. ${kpis.pagado.toFixed(2)}`}
          subtitle={`${kpis.porcentaje.toFixed(1)}%`}
        />
        <KPICard
          title="Saldo pendiente"
          value={`Bs. ${kpis.saldo.toFixed(2)}`}
        />
        <KPICard
          title="Cobranza %"
          value={`${kpis.porcentaje.toFixed(1)}%`}
        />
      </div>
    </LoadingError>
  );
}
