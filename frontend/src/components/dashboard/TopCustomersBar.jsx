import React, { useMemo, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

const currency = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 2 });

/**
 * Top clientes por facturación.
 * Props:
 * - qs: string (querystring con fechas/filtros)
 * - limit?: number (default 10) -> también llega al endpoint
 * - height?: number (default 520)
 */
export default function TopCustomersBar({ qs, limit = 10, height = 520 }) {
  const { data, error, loading } = useApi(`/dashboard/ventas/top-clientes${qs}&limit=${limit}`, [qs, limit]);
  const rowsRaw = data?.data || [];

  // Ordena desc por total
  const rows = useMemo(() => {
    return [...rowsRaw].sort((a, b) => (b?.total || 0) - (a?.total || 0));
  }, [rowsRaw]);

  // Si hay muchos, usa barras horizontales
  const indexAxis = rows.length > 10 ? 'y' : 'x';

  const labels = useMemo(() => rows.map(r => r?.nombre || '—'), [rows]);
  const values = useMemo(() => rows.map(r => Number(r?.total || 0)), [rows]);

  const chartRef = useRef(null);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Total facturado',
        data: values,
        backgroundColor: 'rgba(59,130,246,0.85)',   // azul
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 'flex',
        maxBarThickness: 48,
      }
    ]
  }), [labels, values]);

  const options = useMemo(() => ({
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    indexAxis,
    plugins: {
      ...baseOptions?.plugins,
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx) {
            const v = ctx.parsed[indexAxis === 'y' ? 'x' : 'y'] ?? 0;
            return `Total: ${currency.format(v)}`;
          },
          title(items) { return items?.[0]?.label || ''; }
        }
      }
    },
    scales: {
      x: indexAxis === 'x'
        ? { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } }
        : {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { callback: (v) => currency.format(v) }
          },
      y: indexAxis === 'x'
        ? {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { callback: (v) => currency.format(v) }
          }
        : { grid: { display: false }, ticks: { autoSkip: true, autoSkipPadding: 8 } }
    },
    animation: { duration: 500, easing: 'easeOutQuart' },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } },
    interaction: { intersect: false, mode: 'nearest' }
  }), [indexAxis]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <span className="text-lg font-semibold">Top {limit} clientes por facturación</span>
      <Button
        rounded
        text
        severity="secondary"
        icon="pi pi-download"
        tooltip="Descargar gráfica"
        onClick={() => {
          const c = chartRef.current?.chart?.canvas;
          if (!c) return;
          const a = document.createElement('a');
          a.href = c.toDataURL('image/png', 1.0);
          a.download = `top-clientes_${new Date().toISOString().slice(0,10)}.png`;
          a.click();
        }}
      />
    </div>
  );

  return (
    <Card header={header} className="rounded-2xl shadow-xl p-3">
      <LoadingError loading={loading} error={error} height={height}>
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No hay datos para el rango seleccionado.
          </div>
        ) : (
          <div className="w-full" style={{ height }}>
            <Chart
              ref={chartRef}
              type="bar"
              data={chartData}
              options={options}
              height={height - 24}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </LoadingError>
    </Card>
  );
}
