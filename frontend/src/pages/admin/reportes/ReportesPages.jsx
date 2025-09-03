import React, { useMemo, useState } from 'react';
import ReportesFilters from './ReportesFilters';
import IngresosTimeSeries from '../../../components/reportes/IngresosTimeSeries';
import EstadoPagoDonut from '../../../components/reportes/EstadoPagoDonut';
import TopProductosIngresoBar from '../../../components/reportes/TopProductosIngresoBar';
import PagosPorMetodoBar from '../../../components/reportes/PagosPorMetodoBar';
import ValorInventarioDonut from '../../../components/reportes/ValorInventarioDonut';
import BajoStockTable from '../../../components/reportes/BajoStockTable';
import ConsumoMaterialesBar from '../../../components/reportes/ConsumoMaterialesBar';
import ClientesNuevosLine from '../../../components/reportes/ClientesNuevosLine';
import RecurrentesVsUnicosDonut from '../../../components/reportes/RecurrentesVsUnicosDonut';
import OTIFCard from '../../../components/reportes/OTIFCard';
import LeadTimeStatsCard from '../../../components/reportes/LeadTimeStatsCard';
import FunnelEstadosBar from '../../../components/reportes/FunnelEstadosBar';

export default function ReportesPage() {
  const [filtros, setFiltros] = useState({
    from: null,
    to: null,
    gran: 'month',
    limit: 10
  });

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (filtros.from) p.set('from', filtros.from.toISOString());
    if (filtros.to)   p.set('to', filtros.to.toISOString());
    if (filtros.gran) p.set('gran', filtros.gran);
    if (filtros.limit) p.set('limit', String(filtros.limit));
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [filtros]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold">Reportes</h2>
      <ReportesFilters value={filtros} onChange={setFiltros} />

      <div className="grid grid-cols-12 gap-4">
        {/* Serie de ingresos y estado de pago */}
        <div className="col-span-12 lg:col-span-8">
          <IngresosTimeSeries qs={qs} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <EstadoPagoDonut qs={qs} />
        </div>

        {/* Top productos e ingresos por método */}
        <div className="col-span-12 lg:col-span-6">
          <TopProductosIngresoBar qs={qs} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <PagosPorMetodoBar qs={qs} />
        </div>

        {/* Clientes */}
        <div className="col-span-12 lg:col-span-8">
          <ClientesNuevosLine qs={qs} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <RecurrentesVsUnicosDonut qs={qs} />
        </div>

        {/* Inventario */}
        <div className="col-span-12 lg:col-span-6">
          <ValorInventarioDonut qs={qs} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <BajoStockTable qs={qs} />
        </div>

        {/* Consumo materiales */}
        <div className="col-span-12">
          <ConsumoMaterialesBar qs={qs} />
        </div>

        {/* Operaciones */}
        <div className="col-span-12 lg:col-span-4">
          <OTIFCard qs={qs} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <LeadTimeStatsCard qs={qs} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <FunnelEstadosBar qs={qs} />
        </div>

      </div>
    </div>
  );
}
