import React, { useMemo, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

/**
 * Consumo de materiales (estimado por BOM) en el rango seleccionado.
 * Props:
 * - qs: string
 * - height?: number (default 520)
 * - topN?: number  // opcional: mostrar solo los N más consumidos
 * - unitLabel?: string (default 'unid.')
 */
export default function MaterialsConsumptionBar({ qs, height = 520, topN, unitLabel = 'unid.' }) {
  const { data, error, loading } = useApi(`/dashboard/productos/consumo-materiales${qs}`, [qs]);
  const rowsRaw = data?.data || [];

  // Orden descendente y recorte (topN) si se pide
  const rows = useMemo(() => {
    const sorted = [...rowsRaw].sort((a, b) => (b?.totalConsumido || 0) - (a?.totalConsumido || 0));
    return topN ? sorted.slice(0, topN) : sorted;
  }, [rowsRaw, topN]);

  // Si hay muchas categorías, usar barras horizontales
  const indexAxis = rows.length > 10 ? 'y' : 'x';

  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    const labels = rows.map(r => r?.nombre || '—');
    const values = rows.map(r => r?.totalConsumido ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Consumo (estimado)',
          data: values,
          backgroundColor: 'rgba(59,130,246,0.85)',   // azul
          borderColor: 'rgba(59,130,246,1)',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 'flex',
          maxBarThickness: 48,
        }
      ]
    };
  }, [rows]);

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
            return `Consumo: ${v} ${unitLabel}`;
          },
          title(items) { return items?.[0]?.label || ''; }
        }
      }
    },
    scales: {
      x: indexAxis === 'x'
        ? { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } }
        : { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' } },
      y: indexAxis === 'x'
        ? { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' } }
        : { grid: { display: false }, ticks: { autoSkip: true, autoSkipPadding: 8 } }
    },
    animation: { duration: 500, easing: 'easeOutQuart' },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } },
    interaction: { intersect: false, mode: 'nearest' }
  }), [indexAxis, unitLabel]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <span className="text-lg font-semibold">Consumo de materiales (estimado por BOM)</span>
      <Button
        rounded
        text
        severity="secondary"
        icon="pi pi-download"
        onClick={() => {
          const c = chartRef.current?.chart?.canvas;
          if (!c) return;
          const a = document.createElement('a');
          a.href = c.toDataURL('image/png', 1.0);
          a.download = `consumo-materiales_${new Date().toISOString().slice(0,10)}.png`;
          a.click();
        }}
        tooltip="Descargar gráfica"
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
