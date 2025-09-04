import React, { useMemo, useRef, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';
import { baseOptions } from '../../chartSetup';

const currency = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

/**
 * Serie de ingresos y pedidos por periodo.
 * Props:
 * - qs: string (querystring con fechas/filtros)
 * - granularity: 'day' | 'month' (default 'day')
 * - height?: number (default 520)
 */
export default function RevenueTimeSeries({ qs, granularity = 'day', height = 520 }) {
  const { data, error, loading } = useApi(
    `/dashboard/ventas/ingresos${qs}&granularity=${granularity}`,
    [qs, granularity]
  );

  const [mode, setMode] = useState('period'); // 'period' | 'cumulative'
  const [showMA, setShowMA] = useState(true); // media móvil de ingresos

  // util: media móvil simple
  const sma = (arr, win) => {
    if (!win || win <= 1) return arr;
    const out = [];
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
      if (i >= win) sum -= arr[i - win];
      out.push(i >= win - 1 ? sum / win : null); // null para no dibujar antes de completar ventana
    }
    return out;
    // Chart.js ignora nulls y une luego según tension
  };

  // Normaliza y ordena por fecha
  const rows = useMemo(() => {
    const raw = data?.data || [];
    const parsed = raw.map(d => {
      // _id esperado 'YYYY-MM-DD' o 'YYYY-MM'
      const dt = new Date(d._id);
      return {
        key: d._id,
        date: dt,
        ingresos: Number(d.ingresos || 0),
        pedidos: Number(d.pedidos || 0),
      };
    });
    return parsed.sort((a, b) => a.date - b.date);
  }, [data]);

  // Etiquetas compactas según granularidad
  const labels = useMemo(() => rows.map(r => {
    const d = r.date;
    if (granularity === 'day') {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}`;
    }
    // month
    const y = d.getFullYear();
    const m = d.toLocaleString('es-BO', { month: 'short' });
    return `${m} ${y}`;
  }), [rows, granularity]);

  // Series periodo vs acumulado
  const ingresosPeriod = rows.map(r => r.ingresos);
  const pedidosPeriod  = rows.map(r => r.pedidos);

  const ingresos = useMemo(() => {
    if (mode === 'period') return ingresosPeriod;
    let acc = 0; return ingresosPeriod.map(v => (acc += v));
  }, [ingresosPeriod, mode]);

  const pedidos = useMemo(() => {
    if (mode === 'period') return pedidosPeriod;
    let acc = 0; return pedidosPeriod.map(v => (acc += v));
  }, [pedidosPeriod, mode]);

  // Ventana de MA: 7 días o 3 meses aprox.
  const maWindow = granularity === 'day' ? 7 : 3;
  const ingresosMA = useMemo(
    () => (showMA ? sma(ingresos, maWindow) : null),
    [ingresos, showMA, maWindow]
  );

  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    const ds = [
      {
        type: 'line',
        label: 'Ingresos',
        data: ingresos,
        yAxisID: 'y', // BOB
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.15)',
        borderWidth: 2,
        pointRadius: 2,
        fill: false,
        tension: 0.25,
        order: 2,
      },
      {
        type: 'line',
        label: 'Pedidos',
        data: pedidos,
        yAxisID: 'y1', // unidades
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderWidth: 1.5,
        pointRadius: 2,
        fill: false,
        tension: 0.25,
        order: 3,
      }
    ];

    if (ingresosMA) {
      ds.push({
        type: 'line',
        label: `Ingresos (MA ${maWindow})`,
        data: ingresosMA,
        yAxisID: 'y',
        borderColor: 'rgba(99,102,241,1)',        // índigo
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.25,
        order: 1,
      });
    }

    return { labels, datasets: ds };
  }, [labels, ingresos, pedidos, ingresosMA, maWindow]);

  const options = useMemo(() => ({
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...baseOptions?.plugins,
      legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'line' } },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label(ctx) {
            const lbl = ctx.dataset.label || '';
            const v = ctx.parsed?.y ?? 0;
            if (lbl.toLowerCase().includes('ingresos')) {
              return `${lbl}: ${currency.format(v)}`;
            }
            return `${lbl}: ${v}`;
          },
          title(items) { return items?.[0]?.label || ''; }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Ingresos (BOB)' },
        ticks: { callback: (v) => currency.format(v) },
        grid: { color: 'rgba(0,0,0,0.06)' }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: { display: true, text: 'Pedidos (unid.)' },
        grid: { drawOnChartArea: false }
      }
    },
    animation: { duration: 500, easing: 'easeOutQuart' },
    interaction: { intersect: false, mode: 'index' },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } }
  }), []);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">Ingresos por período</span>
        {/* Toggle Periodo / Acumulado */}
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

        {/* Toggle Media móvil */}
        <button
          className={`px-3 py-1.5 text-sm rounded-xl border transition ${showMA ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
          onClick={() => setShowMA(s => !s)}
        >
          MA {granularity === 'day' ? '7' : '3'}
        </button>
      </div>

      {/* Descargar PNG */}
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
          a.download = `ingresos-${granularity}_${new Date().toISOString().slice(0,10)}.png`;
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
              type="line"
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
