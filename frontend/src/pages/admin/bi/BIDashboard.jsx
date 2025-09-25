// /src/pages/admin/bi/BIDashboard_PrimeReact.jsx
// -------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, Brush
} from "recharts";

// PrimeReact + Tailwind UI
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";
import { Chip } from "primereact/chip";
import { Tag } from "primereact/tag";
import { Sidebar } from "primereact/sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";

import {
  biGetKpis, biGetSeries, biGetEstadoPedidos, biListClientes,
  biGetClienteDetalle, biGetInsumosStock, dashTopClientes
} from "../../../api/bi";
import { biAutocompleteClientes, exportToCsv } from "../../../api/biextras";
import { useUrlState } from "../bi/userUrlState";

const COLORS = ["#8884d8","#82ca9d","#ffc658","#ff8042","#a4de6c","#d0ed57","#8dd1e1","#d88884"];
const TZ = "America/La_Paz";

const toISO = (d)=> new Date(d).toISOString().slice(0,10);
const todayISO = ()=> toISO(new Date());
const daysAgoISO = (n=30)=>{ const d=new Date(); d.setDate(d.getDate()-n); return toISO(d); };

export default function BIDashboard() {
  // -------------------- Estado global + URL --------------------
  const [url, setUrl] = useUrlState({
    from: daysAgoISO(30),
    to: todayISO(),
    groupBy: "day",
    estados: "",           // csv
    estadosPago: "",       // csv
    clientesSel: "",       // csv ids
  });

  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [series, setSeries] = useState([]);
  const [estado, setEstado] = useState({ porEstado: [], porEstadoPago: [] });
  const [clientes, setClientes] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [topClientes, setTopClientes] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [insumosSort, setInsumosSort] = useState("-valuacion");
  const [detalle, setDetalle] = useState({ open: false, data: null });

  // Autocomplete
  const [searchCli, setSearchCli] = useState("");
  const [cliOpts, setCliOpts] = useState([]);

  // Filtros activos “chips”
  const chips = useMemo(() => {
    const arr = [];
    if (url.estados) url.estados.split(",").forEach(e => arr.push({ type:"estado", value:e }));
    if (url.estadosPago) url.estadosPago.split(",").forEach(e => arr.push({ type:"estadoPago", value:e }));
    if (url.clientesSel) arr.push({ type:"clientes", value: `${url.clientesSel.split(",").length} seleccionados` });
    return arr;
  }, [url]);

  // -------------------- Carga de datos principal --------------------
  async function fetchAll({ page=clientes.page } = {}) {
    setLoading(true);
    try {
      const estados = (url.estados||"").split(",").filter(Boolean);
      const estadosPago = (url.estadosPago||"").split(",").filter(Boolean);
      const clienteId = (url.clientesSel && url.clientesSel.split(",").length===1) ? url.clientesSel.split(",")[0] : undefined;

      const [k, s, e, cl, t, ins] = await Promise.all([
        biGetKpis({ from:url.from, to:url.to, clienteId, estado: estados, estadoPago: estadosPago, tz: TZ }),
        biGetSeries({ from:url.from, to:url.to, groupBy:url.groupBy, clienteId, estado: estados, estadoPago: estadosPago, tz: TZ }),
        biGetEstadoPedidos({ from:url.from, to:url.to, clienteId, estado: estados, estadoPago: estadosPago }),
        biListClientes({ from:url.from, to:url.to, q: searchCli, page, limit: clientes.limit }),
        dashTopClientes({ from:url.from, to:url.to, limit: 10 }),
        biGetInsumosStock({ sort: insumosSort, page: 1, limit: 50 }),
      ]);

      setKpis(k);
      // backend devuelve { date, ... } → formateamos label solo para el eje y brush
      const ser = (s?.data || []).map(r => ({ ...r, label: (r.date ? new Date(r.date).toISOString().slice(0,10) : r.label) }));
      setSeries(ser);

      const estadosSel = new Set(estados);
      const estadosPagoSel = new Set(estadosPago);
      setEstado({
        porEstado: (e?.porEstado||[]).map(x=>({ ...x, __active: !estadosSel.size || estadosSel.has(x.estado) })),
        porEstadoPago: (e?.porEstadoPago||[]).map(x=>({ ...x, __active: !estadosPagoSel.size || estadosPagoSel.has(x.estadoPago) })),
      });

      setClientes(prev => ({ ...cl, limit: prev.limit, page }));
      setTopClientes(t?.data || []);
      setInsumos(ins?.items || []);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err?.message || 'No se pudieron cargar los datos' });
    } finally { setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); /* eslint-disable-next-line */},[]);
  useEffect(()=>{ fetchAll({ page: 1 }); /* eslint-disable-next-line */},[url.from, url.to, url.groupBy, url.clientesSel, url.estados, url.estadosPago, insumosSort]);

  // -------------------- Autocomplete clientes (debounce) --------------------
  useEffect(()=>{
    const h = setTimeout(async ()=>{
      if (!searchCli) { setCliOpts([]); return; }
      const r = await biAutocompleteClientes(searchCli);
      setCliOpts((r.items||[]).map(x=>({ id: x.clienteId || x._id, label: `${x.nombre||""} ${x.apellido||""}`.trim() })));
    }, 300);
    return ()=>clearTimeout(h);
  }, [searchCli]);

  // -------------------- Eventos de interacción (cross-filter) --------------------
  const toggleEstado = (value) => {
    const cur = new Set((url.estados||"").split(",").filter(Boolean));
    cur.has(value) ? cur.delete(value) : cur.add(value);
    setUrl(s => ({ ...s, estados: Array.from(cur).join(",") }));
  };
  const toggleEstadoPago = (value) => {
    const cur = new Set((url.estadosPago||"").split(",").filter(Boolean));
    cur.has(value) ? cur.delete(value) : cur.add(value);
    setUrl(s => ({ ...s, estadosPago: Array.from(cur).join(",") }));
  };

  const addClienteFilter = (row) => {
    const rowId = row?.clienteId || row?._id;
    if (rowId) {
      const cur = new Set((url.clientesSel||"").split(",").filter(Boolean));
      cur.add(String(rowId));
      setUrl(s => ({ ...s, clientesSel: Array.from(cur).join(",") }));
      toast.current?.show({ severity:'info', summary:'Filtro agregado', detail: `${row?.nombre || ''}` });
      return;
    }
  };

  const openDetalle = async (id) => {
    if (!id) return;
    const data = await biGetClienteDetalle({ id, from:url.from, to:url.to });
    setDetalle({ open: true, data });
  };
  const closeDetalle = ()=> setDetalle({ open:false, data:null });

  const onBrush = (range) => {
    const { startIndex, endIndex } = range || {};
    if (startIndex == null || endIndex == null) return;
    const a = series[startIndex]?.label, b = series[endIndex]?.label;
    if (a && b) setUrl(s => ({ ...s, from: a, to: b }));
  };

  const resetFilters = () => {
    setUrl(s => ({ ...s, estados:"", estadosPago:"", clientesSel:"" }));
    toast.current?.show({ severity:'success', summary:'Filtros', detail:'Se reiniciaron los filtros' });
  };

  const quickRanges = [
    { label:"7d", n:7 },
    { label:"30d", n:30 },
    { label:"90d", n:90 }
  ];

  const groupByOptions = [
    { label:"Día", value:"day" },
    { label:"Semana", value:"week" },
    { label:"Mes", value:"month" }
  ];

  // -------------------- Render --------------------
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Toast ref={toast} />

      {/* Header de filtros */}
      <Card className="shadow-sm">
        <div className="grid md:grid-cols-12 gap-3 items-end">
          {/* Desde / Hasta */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Desde</label>
            <Calendar value={new Date(url.from)} onChange={e=> setUrl(s=> ({...s, from: toISO(e.value)}))}
                      dateFormat="yy-mm-dd" showIcon inputClassName="w-full" className="w-full" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <Calendar value={new Date(url.to)} onChange={e=> setUrl(s=> ({...s, to: toISO(e.value)}))}
                      dateFormat="yy-mm-dd" showIcon inputClassName="w-full" className="w-full" />
          </div>

          {/* Agrupar */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Agrupar</label>
            <Dropdown className="w-full" value={url.groupBy} onChange={(e)=> setUrl(s=> ({...s, groupBy: e.value}))}
                      options={groupByOptions} placeholder="Seleccionar" />
          </div>

          {/* Rango rápido */}
          <div className="md:col-span-2 flex gap-2">
            {quickRanges.map(q => (
              <Button key={q.n} label={q.label} outlined onClick={()=> setUrl(s=> ({...s, from: daysAgoISO(q.n), to: todayISO()}))} />
            ))}
          </div>

          {/* Autocomplete cliente */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Buscar cliente</label>
            <AutoComplete
              value={searchCli}
              suggestions={cliOpts}
              completeMethod={(e)=> setSearchCli(e.query)}
              field="label"
              forceSelection={false}
              placeholder="Ej. Ana, 71234567, @gmail.com"
              className="w-full"
              dropdown
              onChange={(e)=> setSearchCli(e.value)}
              onSelect={(e)=>{
                const o = e.value;
                const cur = new Set((url.clientesSel||"").split(",").filter(Boolean));
                cur.add(String(o.id));
                setUrl(s=>({ ...s, clientesSel: Array.from(cur).join(",") }));
                setSearchCli("");
                setCliOpts([]);
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button label="Reset" icon="pi pi-refresh" severity="contrast" onClick={resetFilters} />
          <Button label="Exportar CSV" icon="pi pi-download" outlined
                  onClick={()=>{
                    const rows = (clientes.items||[]).map(({ clienteId, _id, nombre, apellido, pedidos, ingresos, pagado, saldo, ultimaCompra })=>({
                      clienteId: clienteId || _id,
                      nombre: `${nombre} ${apellido}`,
                      pedidos, ingresos, pagado, saldo,
                      ultimaCompra: (ultimaCompra ? new Date(ultimaCompra).toISOString() : "")
                    }));
                    exportToCsv(`clientes_${url.from}_${url.to}.csv`, rows);
                    toast.current?.show({ severity:'success', summary:'Exportado', detail:'CSV generado' });
                  }} />
        </div>

        {/* Chips de filtros activos */}
        {!!chips.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c,i)=> (
              <Chip key={i} label={`${c.type}: ${c.value}`} removable
                    onRemove={()=>{
                      if (c.type==="estado") toggleEstado(c.value);
                      else if (c.type==="estadoPago") toggleEstadoPago(c.value);
                      else if (c.type==="clientes") setUrl(s=>({ ...s, clientesSel:"" }));
                    }} />
            ))}
          </div>
        )}
      </Card>

      {/* KPIs */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-lg font-semibold">KPIs</h2>
        </div>
        <div className="grid md:grid-cols-6 gap-3">
          {[
            { label:"Pedidos", value:kpis?.kpis?.pedidos },
            { label:"Ingresos", value:kpis?.kpis?.ingresos },
            { label:"Pagado", value:kpis?.kpis?.pagado, onClick:()=>setUrl(s=>({ ...s, estadosPago:"Pagado" })) },
            { label:"Saldo", value:kpis?.kpis?.saldo, onClick:()=>setUrl(s=>({ ...s, estadosPago:"Parcial,Sin pago" })) },
            { label:"Costo Materiales", value:kpis?.kpis?.costoMateriales },
            { label:"Margen Estimado", value:kpis?.kpis?.margenEstimado },
          ].map((k,i)=>(
            <Card key={i} className={`hover:shadow-md transition-shadow ${k.onClick? 'cursor-pointer':''}`} onClick={k.onClick}>
              <div className="text-sm text-gray-500">{k.label}</div>
              <div className="text-2xl font-bold">{Number(k.value ?? 0).toLocaleString()}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Serie temporal + Estados */}
      <section className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <div className="font-semibold mb-2">Serie temporal</div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={series} syncId="bi-sync">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v)=> v ? new Date(v).toLocaleDateString() : ""} />
                <YAxis />
                <Tooltip labelFormatter={(v)=> new Date(v).toLocaleString()} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" dot={false} />
                <Line type="monotone" dataKey="pagado" dot={false} />
                <Line type="monotone" dataKey="saldo" dot={false} />
                <Brush dataKey="label" height={20} stroke="#8884d8" onChange={onBrush}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="font-semibold mb-2">Estados de pedidos</div>
          <div className="grid grid-cols-2 gap-2">
            <PieBox title="Operativo" data={estado.porEstado} labelKey="estado" valueKey="count"
                    onSliceClick={v=>toggleEstado(v)} />
            <PieBox title="Financiero" data={estado.porEstadoPago} labelKey="estadoPago" valueKey="count"
                    onSliceClick={v=>toggleEstadoPago(v)} />
          </div>
        </Card>
      </section>

      {/* Top clientes */}
      <Card>
        <div className="font-semibold mb-2">Top clientes por ingresos</div>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={topClientes} syncId="bi-sync" onClick={(e)=>{
              if (e && e.activePayload && e.activePayload[0]?.payload) {
                addClienteFilter(e.activePayload[0].payload);
              }
            }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-2"><i className="pi pi-info-circle mr-1"/>Clic en una barra para filtrar ese cliente.</div>
      </Card>

      {/* Clientes table */}
      <Card>
        <div className="font-semibold mb-2">Clientes</div>
        <DataTable value={clientes.items}
                   paginator rows={clientes.limit}
                   totalRecords={clientes.total}
                   first={(clientes.page-1)*clientes.limit}
                   onPage={(e)=>{ const newPage = Math.floor(e.first/e.rows)+1; setClientes(prev=>({...prev, page:newPage, limit:e.rows})); fetchAll({ page:newPage }); }}
                   responsiveLayout="scroll"
                   stripedRows size="small">
          <Column field="nombre" header="Cliente" body={(r)=> (
            (r.clienteId || r._id)
              ? <Button link label={`${r.nombre} ${r.apellido}`} onClick={()=> openDetalle(r.clienteId || r._id)} />
              : <span>{r.nombre} {r.apellido}</span>
          )} />
          <Column field="pedidos" header="Pedidos" style={{textAlign:'right'}} body={(r)=> <span className="float-right">{r.pedidos}</span>} />
          <Column field="ingresos" header="Ingresos" body={(r)=> <span className="float-right">{Number(r.ingresos||0).toLocaleString()}</span>} />
          <Column field="pagado" header="Pagado" body={(r)=> <span className="float-right">{Number(r.pagado||0).toLocaleString()}</span>} />
          <Column field="saldo" header="Saldo" body={(r)=> <span className="float-right font-semibold">{Number(r.saldo||0).toLocaleString()}</span>} />
          <Column field="ultimaCompra" header="Última compra" body={(r)=> r.ultimaCompra ? new Date(r.ultimaCompra).toLocaleDateString() : '-'} />
          <Column header="" body={()=> <i className="pi pi-angle-right text-gray-400"/>} style={{ width: 40 }} />
        </DataTable>
      </Card>

      {/* Insumos */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Insumos</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <Dropdown className="w-48" value={insumosSort} onChange={(e)=> setInsumosSort(e.value)} options={[
              { label:'Valuación ↓', value:'-valuacion' },
              { label:'Valuación ↑', value:'valuacion' },
              { label:'Cantidad ↓', value:'-cantidad' },
              { label:'Cantidad ↑', value:'cantidad' },
            ]} />
          </div>
        </div>
        <DataTable value={insumos} responsiveLayout="scroll" stripedRows size="small">
          <Column field="codigo" header="Código" />
          <Column field="nombre" header="Nombre" />
          <Column field="marca" header="Marca" />
          <Column field="cantidadDisponible" header="Stock" body={(x)=> <span className="float-right">{x.cantidadDisponible}</span>} />
          <Column field="precioUnitario" header="Precio" body={(x)=> <span className="float-right">{Number(x.precioUnitario||0).toLocaleString()}</span>} />
          <Column field="valuacion" header="Valuación" body={(x)=> <span className="float-right font-semibold">{Number(x.valuacion||0).toLocaleString()}</span>} />
        </DataTable>
      </Card>

      {/* Drawer de detalle */}
      <Sidebar visible={detalle.open} position="right" onHide={closeDetalle} className="w-full md:w-3/4 lg:w-1/2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Detalle de cliente</h3>
          <Button label="Cerrar" icon="pi pi-times" onClick={closeDetalle} text />
        </div>
        <Divider />
        <ClienteDetalleContent data={detalle.data} />
      </Sidebar>

      {/* Overlay de carga */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="shadow-2xl"><div className="flex items-center gap-3"><i className="pi pi-spin pi-spinner text-xl"/><span>Cargando…</span></div></Card>
        </div>
      )}
    </div>
  );
}

function PieBox({ title, data, labelKey, valueKey, onSliceClick }) {
  const total = (data||[]).reduce((a, x)=> a + (x[valueKey]||0), 0);
  return (
    <div>
      <div className="text-sm font-medium mb-1 flex items-center gap-2">
        <span>{title}</span>
        <Tag value={`Total: ${total}`} rounded />
      </div>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={(data||[])}
                 dataKey={valueKey}
                 nameKey={labelKey}
                 outerRadius={80}
                 label
                 onClick={(d)=> onSliceClick && onSliceClick(d?.name)}>
              {(data||[]).map((row, i)=>(
                <Cell key={i}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={row.__active ? 1 : 0.35} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ClienteDetalleContent({ data }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="grid md:grid-cols-3 gap-3">
        <InfoBox label="Nombre" value={`${d?.cliente?.nombre||""} ${d?.cliente?.apellido||""}`} />
        <InfoBox label="Teléfono" value={d?.cliente?.telefono} />
        <InfoBox label="Correo" value={d?.cliente?.correo} />
        <InfoBox label="Pedidos" value={d?.totales?.pedidos} />
        <InfoBox label="Ingresos" value={Number(d?.totales?.ingresos||0).toLocaleString()} />
        <InfoBox label="Pagado" value={Number(d?.totales?.pagado||0).toLocaleString()} />
        <InfoBox label="Saldo" value={Number(d?.totales?.saldo||0).toLocaleString()} />
      </div>

      {/* Top productos */}
      <div>
        <h4 className="font-semibold mb-2">Top productos</h4>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={d?.topProductos||[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div>
        <h4 className="font-semibold mb-2">Últimos pedidos</h4>
        <DataTable value={d?.pedidos || []} responsiveLayout="scroll" stripedRows size="small">
          <Column field="createdAt" header="Fecha" body={(p)=> new Date(p.createdAt).toLocaleString()} />
          <Column field="producto.nombre" header="Producto" body={(p)=> p.producto?.nombre } />
          <Column field="cantidad" header="Cantidad" body={(p)=> <span className="float-right">{p.cantidad}</span>} />
          <Column field="total" header="Total" body={(p)=> <span className="float-right">{Number(p.total||0).toLocaleString()}</span>} />
          <Column field="pagado" header="Pagado" body={(p)=> <span className="float-right">{Number(p.pagado||0).toLocaleString()}</span>} />
          <Column field="saldo" header="Saldo" body={(p)=> <span className="float-right">{Number(p.saldo||0).toLocaleString()}</span>} />
          <Column field="estado" header="Estado" body={(p)=> (
            <div className="flex items-center gap-1">
              <Tag value={p.estado} rounded />
              <Tag value={p.estadoPago} severity={p.estadoPago==='Pagado'?'success':(p.estadoPago==='Parcial'?'warning':'danger')} rounded />
            </div>
          )} />
        </DataTable>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <Card className="border rounded">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold break-all">{value ?? "-"}</div>
    </Card>
  );
}
