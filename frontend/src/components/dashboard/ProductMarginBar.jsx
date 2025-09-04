import React, { useMemo, useRef, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

const currency = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 2 });

/**
 * Margen estimado por producto.
 * - Vista 'bob': barras de Precio, Costo BOM y Margen (BOB)
 * - Vista '%': barras de Precio y Costo BOM (BOB) + línea de Margen %
 */
export default function ProductMarginBar({ height = 520, topN }) {
  const { data, error, loading } = useApi(`/dashboard/productos/margen`, []);
  const rowsRaw = data?.data || [];
  const [mode, setMode] = useState('bob'); // 'bob' | 'pct'
  const chartRef = useRef(null);

  // Normaliza, calcula margen% y ordena por margen desc; recorta topN si se pide
  const rows = useMemo(() => {
    const mapped = rowsRaw.map(r => {
      const precio = Number(r?.precioUnitario ?? 0);
      const costo = Number(r?.costoBOM ?? 0);
      const margenBOB = Number(r?.margenEstimado ?? (precio - costo));
      const margenPct = precio > 0 ? (margenBOB / precio) * 100 : 0;
      return {
        nombre: r?.nombre || '—',
        precio,
        costo,
        margenBOB,
        margenPct
      };
    });
    const sorted = mapped.sort((a, b) => b.margenBOB - a.margenBOB);
    return topN ? sorted.slice(0, topN) : sorted;
  }, [rowsRaw, topN]);

  const indexAxis = rows.length > 10 ? 'y' : 'x';

  const labels = useMemo(() => rows.map(r => r.nombre), [rows]);

  // Datasets según modo
  const chartData = useMemo(() => {
    if (mode === 'bob') {
      return {
        labels,
        datasets: [
          {
            label: 'Precio',
            data: rows.map(r => r.precio),
            backgroundColor: 'rgba(59,130,246,0.85)',
            borderColor: 'rgba(59,130,246,1)',
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 'flex',
            maxBarThickness: 48,
            order: 3,
          },
          {
            label: 'Costo BOM',
            data: rows.map(r => r.costo),
            backgroundColor: 'rgba(244,114,182,0.85)', // rosa
            borderColor: 'rgba(244,114,182,1)',
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 'flex',
            maxBarThickness: 48,
            order: 2,
          },
          {
            label: 'Margen',
            data: rows.map(r => r.margenBOB),
            backgroundColor: 'rgba(16,185,129,0.85)', // verde
            borderColor: 'rgba(16,185,129,1)',
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 'flex',
            maxBarThickness: 48,
            order: 1,
          },
        ]
      };
    }

    // mode === 'pct'
    return {
      labels,
      datasets: [
        {
          label: 'Precio',
          data: rows.map(r => r.precio),
          backgroundColor: 'rgba(59,130,246,0.2)',
          borderColor: 'rgba(59,130,246,0.5)',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 'flex',
          maxBarThickness: 48,
          order: 3,
        },
        {
          label: 'Costo BOM',
          data: rows.map(r => r.costo),
          backgroundColor: 'rgba(244,114,182,0.2)',
          borderColor: 'rgba(244,114,182,0.5)',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 'flex',
          maxBarThickness: 48,
          order: 2,
        },
        {
          type: 'line',
          label: 'Margen %',
          data: rows.map(r => r.margenPct),
          borderColor: 'rgba(16,185,129,1)',
          pointBackgroundColor: 'rgba(16,185,129,1)',
          pointRadius: 3,
          tension: 0.3,
          yAxisID: 'y1',
          order: 1,
        }
      ]
    };
  }, [rows, labels, mode]);

  const options = useMemo(() => ({
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    indexAxis,
    plugins: {
      ...baseOptions?.plugins,
      legend: {
        position: 'top',
        labels: { usePointStyle: true, pointStyle: 'rectRounded' }
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            const lbl = ctx.dataset.label || '';
            const val = (indexAxis === 'y' && ctx.parsed?.x != null) ? ctx.parsed.x : ctx.parsed?.y;
            if (lbl.toLowerCase().includes('%')) {
              return `${lbl}: ${Number(val ?? 0).toFixed(1)}%`;
            }
            return `${lbl}: ${currency.format(Number(val ?? 0))}`;
          },
          title(items) { return items?.[0]?.label || ''; }
        }
      }
    },
    scales: {
      x: indexAxis === 'x'
        ? { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } }
        : { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { callback: v => currency.format(v) } },
      y: indexAxis === 'x'
        ? {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { callback: v => currency.format(v) },
            title: { display: true, text: mode === 'bob' ? 'BOB' : 'BOB / %' }
          }
        : { grid: { display: false }, ticks: { autoSkip: true, autoSkipPadding: 8 } },
      // Eje secundario solo en modo porcentaje
      y1: mode === 'pct'
        ? {
            beginAtZero: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { callback: (v) => `${v}%` },
            title: { display: true, text: 'Margen %' }
          }
        : undefined
    },
    animation: { duration: 500, easing: 'easeOutQuart' },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } },
    interaction: { intersect: false, mode: 'index' }
  }), [indexAxis, mode]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">Margen estimado por producto</span>
        <div className="inline-flex rounded-xl overflow-hidden border border-gray-200">
          <button
            className={`px-3 py-1.5 text-sm transition ${mode === 'bob' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setMode('bob')}
          >
            BOB
          </button>
          <button
            className={`px-3 py-1.5 text-sm transition ${mode === 'pct' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setMode('pct')}
          >
            %
          </button>
        </div>
      </div>
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
          a.download = `margen-producto_${new Date().toISOString().slice(0,10)}.png`;
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
