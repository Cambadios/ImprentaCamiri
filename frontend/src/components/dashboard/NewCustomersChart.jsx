import React, { useMemo, useRef, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

/**
 * Nuevos clientes por periodo (día/mes).
 * Props:
 * - qs: string (querystring de fechas, etc.)
 * - height?: number (alto del gráfico, default 520)
 */
export default function NewCustomersChart({ qs, height = 520 }) {
  const [gran, setGran] = useState('month');         // 'month' | 'day'
  const [mode, setMode] = useState('period');        // 'period' | 'cumulative'

  const { data, error, loading } = useApi(
    `/dashboard/clientes/nuevos${qs}&granularity=${gran}`,
    [qs, gran]
  );

  // Normaliza y ordena por fecha ascendente (r._id puede ser 'YYYY-MM' o 'YYYY-MM-DD')
  const rows = useMemo(() => {
    const arr = (data?.data || []).map(r => ({
      key: r._id,
      date: new Date(r._id),  // si viene 'YYYY-MM' JS lo interpreta como UTC; suficiente para ordenar
      nuevos: Number(r.nuevos || 0),
    }));
    return arr.sort((a, b) => a.date - b.date);
  }, [data]);

  // Series: periodo o acumulado
  const seriesValues = useMemo(() => {
    if (mode === 'period') return rows.map(r => r.nuevos);
    let acc = 0;
    return rows.map(r => (acc += r.nuevos));
  }, [rows, mode]);

  const total = useMemo(() => rows.reduce((s, r) => s + r.nuevos, 0), [rows]);

  const labels = useMemo(() => {
    // Etiquetas más cortas: si es 'day' → 'DD/MM'; si es 'month' → 'MMM YYYY'
    return rows.map(r => {
      const d = r.date;
      if (gran === 'day') {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}/${mm}`;
      }
      // mensual
      const y = d.getFullYear();
      const m = d.toLocaleString('es-BO', { month: 'short' });
      return `${m} ${y}`;
    });
  }, [rows, gran]);

  const chartRef = useRef(null);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: mode === 'period' ? 'Nuevos clientes' : 'Acumulado',
        data: seriesValues,
        backgroundColor: 'rgba(59,130,246,0.85)',   // azul
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 'flex',
        maxBarThickness: 40,
      }
    ]
  }), [labels, seriesValues, mode]);

  const options = useMemo(() => ({
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...baseOptions?.plugins,
      legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded' } },
      tooltip: {
        callbacks: {
          label(ctx) {
            const v = ctx.parsed.y ?? 0;
            return `${ctx.dataset.label}: ${v}`;
          },
          title(items) { return items?.[0]?.label || ''; }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 8
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.06)' },
        title: { display: true, text: mode === 'period' ? 'Nuevos (periodo)' : 'Acumulado' }
      }
    },
    animation: { duration: 500, easing: 'easeOutQuart' },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } },
    interaction: { intersect: false, mode: 'nearest' }
  }), [mode]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">Nuevos clientes</span>

        {/* Granularidad */}
        <Dropdown
          value={gran}
          options={[
            { label: 'Mensual', value: 'month' },
            { label: 'Diario', value: 'day' }
          ]}
          onChange={(e) => setGran(e.value)}
          className="w-40"
        />

        {/* Modo: periodo vs acumulado */}
        <div className="inline-flex rounded-xl overflow-hidden border border-gray-200">
          <button
            className={`px-3 py-1.5 text-sm transition ${mode === 'period' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setMode('period')}
          >
            Periodo
          </button>
          <button
            className={`px-3 py-1.5 text-sm transition ${mode === 'cumulative' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setMode('cumulative')}
          >
            Acumulado
          </button>
        </div>

        {/* Total en el rango */}
        <span className="text-xs text-gray-500">
          Total: <span className="font-medium text-gray-700">{total}</span>
        </span>
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
          a.download = `nuevos-clientes_${new Date().toISOString().slice(0,10)}.png`;
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
