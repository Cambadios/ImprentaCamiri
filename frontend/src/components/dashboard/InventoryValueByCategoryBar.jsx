import React, { useMemo, useRef, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

const currency = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

/**
 * Muestra el valor del inventario agrupado por categoría.
 * - Ordena de mayor a menor.
 * - Cambia a barra horizontal si hay muchas categorías.
 * - Tooltips en moneda.
 * - Botón para descargar PNG.
 * - Altura configurable (guiado por tu ejemplo de FrequentCustomersBar).
 */
export default function InventoryValueByCategoryBar({ height = 520, topN }) {
  const { data, error, loading } = useApi(`/dashboard/inventario/valor-por-categoria`, []);
  const rowsRaw = data?.data || [];

  // Orden descendente por valor y recorte opcional (topN)
  const rows = useMemo(() => {
    const sorted = [...rowsRaw].sort((a, b) => (b?.valor || 0) - (a?.valor || 0));
    return topN ? sorted.slice(0, topN) : sorted;
  }, [rowsRaw, topN]);

  const total = useMemo(() => rows.reduce((acc, r) => acc + (r?.valor || 0), 0), [rows]);

  // Si hay muchas categorías, usamos barras horizontales para mayor legibilidad
  const indexAxis = rows.length > 8 ? 'y' : 'x';

  const chartRef = useRef(null);
  const [mode, setMode] = useState('absolute'); // 'absolute' | 'share' (porcentaje del total)

  const chartData = useMemo(() => {
    const labels = rows.map(r => r.categoria || '—');
    const values = rows.map(r => r.valor || 0);

    // Modo porcentaje (share)
    const series = mode === 'share' && total > 0
      ? values.map(v => (v / total) * 100)
      : values;

    return {
      labels,
      datasets: [
        {
          label: mode === 'share' ? 'Participación (%)' : 'Valor (BOB)',
          data: series,
          backgroundColor: 'rgba(59,130,246,0.85)',   // azul
          borderColor: 'rgba(59,130,246,1)',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 'flex', // mejor ajuste visual
          maxBarThickness: 48,
        }
      ]
    };
  }, [rows, mode, total]);

  const options = useMemo(() => ({
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    indexAxis, // 'x' vertical, 'y' horizontal
    plugins: {
      ...baseOptions?.plugins,
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx) {
            const v = ctx.parsed[indexAxis === 'y' ? 'x' : 'y'] ?? 0;
            if (mode === 'share') return `Participación: ${v.toFixed(1)}%`;
            return `Valor: ${currency.format(v)}`;
          },
          title(items) { return items?.[0]?.label || ''; }
        }
      }
    },
    scales: {
      x: indexAxis === 'x'
        ? {
            grid: { display: false },
            ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 }
          }
        : {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: mode === 'share'
              ? { callback: (v) => `${v}%` }
              : { callback: (v) => currency.format(v) }
          },
      y: indexAxis === 'x'
        ? {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: mode === 'share'
              ? { callback: (v) => `${v}%` }
              : { callback: (v) => currency.format(v) }
          }
        : {
            grid: { display: false },
            ticks: { autoSkip: true, autoSkipPadding: 8 }
          }
    },
    animation: { duration: 500, easing: 'easeOutQuart' },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } },
    interaction: { intersect: false, mode: 'nearest' }
  }), [indexAxis, mode]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col">
        <span className="text-lg font-semibold">Valor del inventario por categoría</span>
        <span className="text-xs text-gray-500">
          {mode === 'share'
            ? `Total inventario: ${currency.format(total)} · Vista: %`
            : `Total inventario: ${currency.format(total)} · Vista: BOB`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle de vista BOB/% */}
        <div className="inline-flex rounded-xl overflow-hidden border border-gray-200">
          {['absolute','share'].map(v => (
            <button
              key={v}
              className={`px-3 py-1.5 text-sm transition ${
                mode === v ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => setMode(v)}
            >
              {v === 'absolute' ? 'BOB' : '%'}
            </button>
          ))}
        </div>

        {/* Descargar PNG */}
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
            a.download = `inventario-por-categoria_${new Date().toISOString().slice(0,10)}.png`;
            a.click();
          }}
          tooltip="Descargar gráfica"
        />
      </div>
    </div>
  );

  return (
    <Card header={header} className="rounded-2xl shadow-xl p-3">
      <LoadingError loading={loading} error={error}>
        {rows.length === 0 ? (
          <div className="min-h-[220px] flex items-center justify-center text-gray-500 text-sm">
            No hay datos para mostrar.
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
