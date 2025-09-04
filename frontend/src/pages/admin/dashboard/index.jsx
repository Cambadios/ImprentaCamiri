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
import NewCustomersChart from '../../../components/dashboard/NewCustomersChart';
import FrequentCustomersBar from '../../../components/dashboard/FrequentCustomersBar';

import { useDashboardRange } from '../../../hooks/useDashboardRange';

export default function AdminDashboardPage() {
  const { from, to, setFrom, setTo, qs } = useDashboardRange();
  const [nonce, setNonce] = useState(0);
  const [visibleDashboards, setVisibleDashboards] = useState('all');

  const qsN = `${qs}${qs.includes('?') ? '&' : '?'}nonce=${nonce}`;
  const handleRefresh = () => setNonce(n => n + 1);

  const btnClass = key =>
    `border-none text-white ${visibleDashboards === key ? 'bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600'}`;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button label="Refrescar" icon="pi pi-refresh" onClick={handleRefresh} />
      </div>

      <DashboardFilters from={from} to={to} setFrom={setFrom} setTo={setTo} onRefresh={handleRefresh} />

      {/* Botones de filtro */}
      <div className="flex flex-wrap gap-2 mb-2">
        <Button
          label="Ver Todo"
          icon="pi pi-list"
          onClick={() => setVisibleDashboards('all')}
          className={btnClass('all')}
        />
        <Button
          label="Ventas & Cobranza"
          icon="pi pi-chart-line"
          onClick={() => setVisibleDashboards('ventas_cobranza')}
          className={btnClass('ventas_cobranza')}
        />
        <Button
          label="Clientes"
          icon="pi pi-users"
          onClick={() => setVisibleDashboards('clientes')}
          className={btnClass('clientes')}
        />
        <Button
          label="Productos"
          icon="pi pi-box"
          onClick={() => setVisibleDashboards('productos')}
          className={btnClass('productos')}
        />
        <Button
          label="insumos"
          icon="pi pi-database"
          onClick={() => setVisibleDashboards('inventario')}
          className={btnClass('inventario')}
        />

        {/* Mantengo tu agrupación original si quieres seguir usándola */}
        <Button
          label="Productos & Materiales"
          icon="pi pi-box"
          onClick={() => setVisibleDashboards('productos_materiales')}
          className={btnClass('productos_materiales')}
        />
      </div>

      {/* === Ver Todo / Ventas & Cobranza (como ya lo tenías) === */}
      {visibleDashboards === 'all' || visibleDashboards === 'ventas_cobranza' ? (
        <>
          <CollectionsKPIs qs={qsN} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueTimeSeries qs={qsN} granularity="day" />
            <PaymentStatusDonut qs={qsN} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopCustomersBar qs={qsN} limit={10} />
            <TopProductsBar qs={qsN} limit={10} />
          </div>
        </>
      ) : null}

      {/* === Productos & Materiales (tu agrupación original) === */}
      {visibleDashboards === 'productos_materiales' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MaterialsConsumptionBar qs={qsN} />
            <ProductMarginBar />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InventoryValueByCategoryBar />
            <NewCustomersChart qs={qsN} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-[minmax(420px,auto)]">
            <LowStockTable umbral={10} />
            <FrequentCustomersBar qs={qsN} limit={10} />
          </div>
        </>
      ) : null}

      {/* === Clientes === */}
      {visibleDashboards === 'clientes' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <NewCustomersChart qs={qsN} />
            <FrequentCustomersBar qs={qsN} limit={10} />
          </div>
          {/* Si quieres incluir TopCustomers aquí, descomenta: */}
          {/* <TopCustomersBar qs={qsN} limit={10} /> */}
        </>
      ) : null}

      {/* === Productos === */}
      {visibleDashboards === 'productos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsBar qs={qsN} limit={10} />
          <ProductMarginBar />
        </div>
      ) : null}

      {/* === Inventario (insumos) === */}
      {visibleDashboards === 'inventario' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InventoryValueByCategoryBar />
            <LowStockTable umbral={10} />
          </div>
          <MaterialsConsumptionBar qs={qsN} />
        </>
      ) : null}
    </div>
  );
}
