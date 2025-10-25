import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { apiFetch } from '../../api/http'; // <-- usa tu helper con token

const fmtCurrency = (n) =>
  (n ?? 0).toLocaleString('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 });

export default function InventoryValueByCategoryBar() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [asPercent, setAsPercent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // IMPORTANTE: con apiFetch NO pongas el /api dos veces.
        // Si tu apiFetch ya agrega baseURL '/api', usa la ruta corta:
        const resp = await apiFetch('/dashboard/inventario/valor-por-categoria');
        if (resp.status === 401) {
          // token ausente/expirado
          window.location.href = '/login';
          return;
        }
        if (!resp.ok) {
          let err = {};
          try { err = await resp.json(); } catch {console.log}
          throw new Error(err.message || 'Error al cargar');
        }
        const json = await resp.json();

        const list = Array.isArray(json?.data) ? json.data : [];
        if (!mounted) return;

        setRows(list);
        const tot = Number.isFinite(json?.totalInventario)
          ? json.totalInventario
          : list.reduce((a, r) => a + (r?.valor || 0), 0);
        setTotal(tot);
      } catch (e) {
        setRows([]);
        setTotal(0);
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const { labels, values } = useMemo(() => {
    const lbls = rows.map(r => {
      const name = (r && r.categoriaNombre && String(r.categoriaNombre).trim()) ? r.categoriaNombre : 'Sin categoría';
      return name;
    });
    const vals = rows.map(r => r?.valor ?? 0);
    return { labels: lbls, values: vals };
  }, [rows]);

  const percentValues = useMemo(() => {
    const base = total || 1;
    return values.map(v => Math.round((v * 100 / base) * 100) / 100);
  }, [values, total]);

  const dataChart = useMemo(() => ({
    labels,
    datasets: [
      {
        label: asPercent ? 'Participación (%)' : 'Valor inventario',
        data: asPercent ? percentValues : values,
        borderWidth: 1
      }
    ]
  }), [labels, values, percentValues, asPercent]);

  const options = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => items?.[0]?.label || 'Sin categoría',
          label: (ctx) => {
            const v = ctx.parsed?.y ?? ctx.parsed;
            return asPercent ? ` ${v}%` : ` ${fmtCurrency(v)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: (val, idx) => labels[idx] || 'Sin categoría',
          maxRotation: 0,
          autoSkip: false
        }
      },
      y: {
        ticks: {
          callback: (value) => asPercent ? `${value}%` : fmtCurrency(value)
        },
        beginAtZero: true
      }
    }
  }), [labels, asPercent]);

  return (
    <Card title="Valor del inventario por categoría"
          subTitle={`Total inventario: ${fmtCurrency(total)} · Vista: ${asPercent ? '%' : 'BOB'}`}>
      <div className="flex items-center justify-end gap-2 mb-2">
        <div className="p-buttonset">
          <Button label="BOB" className={!asPercent ? 'p-button-primary' : 'p-button-outlined'}
                  onClick={() => setAsPercent(false)} />
          <Button label="%" className={asPercent ? 'p-button-primary' : 'p-button-outlined'}
                  onClick={() => setAsPercent(true)} />
        </div>
      </div>

      <div style={{ height: 360 }}>
        <Chart type="bar" data={dataChart} options={options} />
        {loading && <div className="mt-2 text-sm text-gray-500">Cargando…</div>}
      </div>
    </Card>
  );
}
