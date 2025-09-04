import React, { useMemo, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';

// Paleta consistente
const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

/**
 * Donut de estado de pago.
 * Props:
 * - qs?: string (querystring con fechas/filtros)
 * - height?: number (alto del contenedor, default 420)
 * - cutout?: string|number (grosor del aro, default '60%')
 */
export default function PaymentStatusDonut({ qs = '', height = 420, cutout = '60%' }) {
  const { data, error, loading } = useApi(`/dashboard/ventas/estado-pago${qs}`, [qs]);
  const rowsRaw = data?.data || [];

  // Normaliza, ordena desc por cantidad
  const rows = useMemo(() => {
    const norm = rowsRaw.map((r, i) => ({
      label: String(r?._id ?? 'N/D'),
      value: Number(r?.count ?? 0),
      color: COLORS[i % COLORS.length],
    }));
    return norm.sort((a, b) => b.value - a.value);
  }, [rowsRaw]);

  const total = useMemo(() => rows.reduce((s, r) => s + r.value, 0), [rows]);

  const chartData = useMemo(() => ({
    labels: rows.map(r => r.label),
    datasets: [
      {
        data: rows.map(r => r.value),
        backgroundColor: rows.map(r => r.color),
        borderWidth: 0
      }
    ]
  }), [rows]);

  // Plugin simple para mostrar el total en el centro
  const centerTotalPlugin = useMemo(() => ({
    id: 'centerTotal',
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!ctx || !chartArea) return;
      const txt = String(total);
      ctx.save();
      ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const { x, y } = chart.getDatasetMeta(0).data?.[0]?.getProps(['x','y'], true) || { x: (chartArea.left+chartArea.right)/2, y: (chartArea.top+chartArea.bottom)/2 };
      ctx.fillText(txt, x, y);
      ctx.restore();
    }
  }), [total]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, pointStyle: 'circle' }
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            const val = ctx.parsed || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            const name = ctx.label || '';
            return `${name}: ${val} (${pct}%)`;
          }
        }
      }
    },
    animation: { duration: 500, easing: 'easeOutQuart' }
  }), [total, cutout]);

  const chartRef = useRef(null);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col">
        <span className="text-lg font-semibold">Estado de pago (distribución)</span>
        <span className="text-xs text-gray-500">Total: <span className="font-medium text-gray-700">{total}</span></span>
      </div>
      <Button
        rounded text severity="secondary" icon="pi pi-download" tooltip="Descargar gráfica"
        onClick={() => {
          const c = chartRef.current?.chart?.canvas;
          if (!c) return;
          const a = document.createElement('a');
          a.href = c.toDataURL('image/png', 1.0);
          a.download = `estado-pago_${new Date().toISOString().slice(0,10)}.png`;
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
              type="doughnut"
              data={chartData}
              options={options}
              plugins={[centerTotalPlugin]}
              height={height - 24}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </LoadingError>
    </Card>
  );
}
