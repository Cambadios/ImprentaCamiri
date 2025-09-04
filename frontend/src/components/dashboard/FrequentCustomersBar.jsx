import React, { useMemo, useRef, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

const currency = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

export default function FrequentCustomersBar({ qs, limit = 10, height = 520 }) {
  const { data, error, loading } = useApi(`/dashboard/clientes/recurrentes${qs}&limit=${limit}`, [qs, limit]);
  const rows = data?.data || [];
  const chartRef = useRef(null);
  const [view, setView] = useState('both');

  const chartData = useMemo(() => {
    const labels = rows.map(r => r.nombre);
    const dsFreq = {
      label: 'Veces',
      data: rows.map(r => r.veces),
      backgroundColor: 'rgba(59,130,246,0.85)',
      borderColor: 'rgba(59,130,246,1)',
      borderWidth: 1,
      borderRadius: 8,
      yAxisID: 'y',
      order: 2,
    };
    const dsTotal = {
      label: 'Total',
      data: rows.map(r => r.total),
      backgroundColor: 'rgba(16,185,129,0.85)',
      borderColor: 'rgba(16,185,129,1)',
      borderWidth: 1,
      borderRadius: 8,
      yAxisID: 'y1',
      order: 1,
    };
    return { labels, datasets: view === 'both' ? [dsFreq, dsTotal] : view === 'veces' ? [dsFreq] : [dsTotal] };
  }, [rows, view]);

  const options = useMemo(() => ({
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false, // clave
    plugins: {
      ...baseOptions?.plugins,
      legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded' } },
      tooltip: {
        callbacks: {
          label(ctx) {
            const l = ctx.dataset.label?.toLowerCase() || '';
            const v = ctx.parsed.y || 0;
            return l.includes('total') ? `Total: ${currency.format(v)}` : `Veces: ${v}`;
          },
          title(items) { return items?.[0]?.label || ''; }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } },
      y: { beginAtZero: true, title: { display: true, text: 'Veces' }, grid: { color: 'rgba(0,0,0,0.06)' } },
      y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'Monto (BOB)' }, grid: { drawOnChartArea: false } }
    }
  }), []);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">Clientes recurrentes (Top {limit})</span>
        <div className="inline-flex rounded-xl overflow-hidden border border-gray-200">
          {['both','veces','total'].map(v => (
            <button key={v}
              className={`px-3 py-1.5 text-sm transition ${view===v ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setView(v)}
            >
              {v==='both' ? 'Ambos' : v==='veces' ? 'Veces' : 'Total'}
            </button>
          ))}
        </div>
      </div>
      <Button rounded text severity="secondary" icon="pi pi-download"
        onClick={() => {
          const c = chartRef.current?.chart?.canvas;
          if (!c) return;
          const a = document.createElement('a');
          a.href = c.toDataURL('image/png', 1.0);
          a.download = `clientes-recurrentes_${new Date().toISOString().slice(0,10)}.png`;
          a.click();
        }}
        tooltip="Descargar gráfica"
      />
    </div>
  );

  return (
    <Card header={header} className="rounded-2xl shadow-xl p-3">
      <LoadingError loading={loading} error={error}>
        {rows.length === 0 ? (
          <div className="min-h-[220px] flex items-center justify-center text-gray-500 text-sm">
            No hay datos para el rango seleccionado.
          </div>
        ) : (
          // El alto real lo manda esta prop:
          <div className="w-full" style={{ height }}>
            <Chart
              ref={chartRef}
              type="bar"
              data={chartData}
              options={options}
              height={height - 24} // <- fuerza el alto del canvas
              style={{ width: '100%' }}
            />
          </div>
        )}
      </LoadingError>
    </Card>
  );
}
