import React, { useState } from 'react';
import '../../../chartSetup'; // asegura el registro
import { Button } from 'primereact/button';

import DashboardFilters from '../../../components/dashboard/DashboardFilters';
import CollectionsKPIs from '../../../components/dashboard/CollectionsKPIs';
import RevenueTimeSeries from '../../../components/dashboard/RevenueTimeSeries';
import PaymentStatusDonut from '../../../components/dashboard/PaymentStatusDonut';
import TopCustomersBar from '../../../components/dashboard/TopCustomersBar';
import TopProductsBar from '../../../components/dashboard/TopProductsBar';
import MaterialsConsumptionBar from '../../../components/dashboard/MaterialsConsumptionBar';
import ProductMarginBar from '../../../components/dashboard/ProductMarginBar';
import LowStockTable from '../../../components/dashboard/LowStockTable';
import InventoryValueByCategoryBar from '../../../components/dashboard/InventoryValueByCategoryBar';
import MaterialRotationBar from '../../../components/dashboard/MaterialRotationBar';
import NewCustomersChart from '../../../components/dashboard/NewCustomersChart';
import FrequentCustomersBar from '../../../components/dashboard/FrequentCustomersBar';

import { useDashboardRange } from '../../../hooks/useDashboardRange';

export default function AdminDashboardPage() {
  const { from, to, setFrom, setTo, qs } = useDashboardRange();
  // para forzar refresh manual si lo deseas:
  const [nonce, setNonce] = useState(0);
  const qsN = `${qs}${qs.includes('?') ? '&' : '?'}nonce=${nonce}`;

  const handleRefresh = () => setNonce(n => n + 1);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button label="Refrescar" icon="pi pi-refresh" onClick={handleRefresh} />
      </div>

      <DashboardFilters from={from} to={to} setFrom={setFrom} setTo={setTo} onRefresh={handleRefresh} />

      {/* KPIs de cobranza */}
      <CollectionsKPIs qs={qsN} />

      {/* Ventas & pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueTimeSeries qs={qsN} granularity="day" />
        <PaymentStatusDonut qs={qsN} />
        
      </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCustomersBar qs={qsN} limit={10} />
        <TopProductsBar qs={qsN} limit={10} />
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MaterialsConsumptionBar qs={qsN} />
        <ProductMarginBar />
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InventoryValueByCategoryBar />
        <MaterialRotationBar qs={qsN} />
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NewCustomersChart qs={qsN} />
        <FrequentCustomersBar qs={qsN} limit={10} />
      </div>
            <LowStockTable umbral={10} />

{/*







 */}
    </div>
  );
}
