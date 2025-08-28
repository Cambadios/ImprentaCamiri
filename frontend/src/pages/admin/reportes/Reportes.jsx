// src/pages/admin/Reportes.jsx
import React, { useEffect, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiFetch } from '../../../api/http';
import { TabView, TabPanel } from 'primereact/tabview';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const fmt = (d) => d?.toISOString().split('T')[0];

export default function Reportes() {
  const [desde, setDesde] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [hasta, setHasta] = useState(new Date());
  const [groupBy, setGroupBy] = useState('day');
  const groupOpts = [{label:'Diario', value:'day'},{label:'Mensual', value:'month'}];

  // datasets
  const [ventas, setVentas] = useState([]);
  const [topProd, setTopProd] = useState([]);
  const [topCli, setTopCli] = useState([]);
  const [estados, setEstados] = useState([]);
  const [bajoStock, setBajoStock] = useState([]);
  const [lead, setLead] = useState(null);

  const load = async () => {
    const q = `from=${fmt(desde)}&to=${fmt(hasta)}`;
    const [v, tp, tc, pe, bs, ld] = await Promise.all([
      apiFetch(`/reportes/ventas?${q}&groupBy=${groupBy}`).then(r=>r.json()),
      apiFetch(`/reportes/top-productos?${q}&limit=10`).then(r=>r.json()),
      apiFetch(`/reportes/top-clientes?${q}&limit=10`).then(r=>r.json()),
      apiFetch(`/reportes/pedidos-por-estado?${q}`).then(r=>r.json()),
      apiFetch(`/reportes/inventario/bajo-stock?threshold=10`).then(r=>r.json()),
      apiFetch(`/reportes/lead-time?${q}`).then(r=>r.json())
    ]);
    setVentas(v.data || []);
    setTopProd(tp.data || []);
    setTopCli(tc.data || []);
    setEstados(pe.data || []);
    setBajoStock(bs.data || []);
    setLead(ld.data || null);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const onFiltrar = () => load();

  const descargarPDF = (tipo, extra='') => {
    const q = `from=${fmt(desde)}&to=${fmt(hasta)}${extra ? `&${extra}` : ''}`;
    const url = `${import.meta.env.VITE_API_URL}/reportes/descargar?tipo=${tipo}&formato=pdf&${q}`;
    window.open(url, '_blank');
  };

  // transform ventas para grafico
  const ventasChart = ventas.map(r => {
    const y = r._id?.y, m = r._id?.m, d = r._id?.d;
    return { label: `${y}-${String(m).padStart(2,'0')}${d?'-'+String(d).padStart(2,'0'):''}`, ingresos: r.ingresos, pedidos: r.pedidos };
  });

  return (
    <div className="p-3">
      <h2 className="mb-3">Reportes</h2>

      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="block mb-1">Desde</label>
          <Calendar value={desde} onChange={(e) => setDesde(e.value)} dateFormat="yy-mm-dd" showIcon />
        </div>
        <div>
          <label className="block mb-1">Hasta</label>
          <Calendar value={hasta} onChange={(e) => setHasta(e.value)} dateFormat="yy-mm-dd" showIcon />
        </div>
        <div>
          <label className="block mb-1">Agrupar</label>
          <Dropdown value={groupBy} options={groupOpts} onChange={(e)=>setGroupBy(e.value)} />
        </div>
        <Button label="Filtrar" icon="pi pi-filter" onClick={onFiltrar} />
      </div>

      <TabView className="mt-4">
        <TabPanel header="Ventas">
          <div className="mb-3">
            <Button label="Descargar PDF" icon="pi pi-download"
              onClick={()=>descargarPDF('ventas', `groupBy=${groupBy}`)} />
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={ventasChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <DataTable value={ventas} size="small" className="mt-3">
            <Column field="_id.y" header="Año" />
            <Column field="_id.m" header="Mes" />
            <Column field="_id.d" header="Día" />
            <Column field="ingresos" header="Ingresos" />
            <Column field="pedidos" header="Pedidos" />
            <Column field="ticketPromedio" header="Ticket Prom." />
          </DataTable>
        </TabPanel>

        <TabPanel header="Top productos">
          <DataTable value={topProd} size="small" paginator rows={10}>
            <Column field="nombre" header="Producto" />
            <Column field="unidades" header="Unidades" />
            <Column field="ingresos" header="Ingresos" />
          </DataTable>
        </TabPanel>

        <TabPanel header="Top clientes">
          <DataTable value={topCli} size="small" paginator rows={10}>
            <Column field="cliente" header="Cliente" />
            <Column field="pedidos" header="Pedidos" />
            <Column field="total" header="Total" />
          </DataTable>
        </TabPanel>

        <TabPanel header="Pedidos por estado">
          <DataTable value={estados} size="small">
            <Column field="estado" header="Estado" />
            <Column field="cantidad" header="Cantidad" />
          </DataTable>
        </TabPanel>

        <TabPanel header="Bajo stock">
          <DataTable value={bajoStock} size="small">
            <Column field="nombre" header="Producto" />
            <Column field="stock" header="Stock" />
            <Column field="minimo" header="Mínimo" />
          </DataTable>
        </TabPanel>

        <TabPanel header="Lead time">
          {lead && (
            <ul className="list-none p-0">
              <li><b>Promedio (h):</b> {lead.avgHoras?.toFixed?.(2) || 0}</li>
              <li><b>Mínimo (h):</b> {lead.minHoras?.toFixed?.(2) || 0}</li>
              <li><b>Máximo (h):</b> {lead.maxHoras?.toFixed?.(2) || 0}</li>
            </ul>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
}
