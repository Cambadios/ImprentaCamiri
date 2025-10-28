// /src/pages/admin/bi/BIDashboard_PrimeReact.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList
} from "recharts";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";
import { Chip } from "primereact/chip";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";

import {
  biGetKpis, biGetEstadoPedidos, biListClientes,
  biGetClienteDetalle, biGetInsumosStock, dashTopClientes
} from "../../../api/bi";
import { biAutocompleteClientes } from "../../../api/biextras";
import { useUrlState } from "../bi/userUrlState";

import { fmtBOB, fmtInt, fmtDate, fmtDateTime } from "../../../utils/formatters";

const COLORS = ["#2563EB","#16A34A","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#84CC16","#F472B6"];
const TZ = "America/La_Paz";

const toISO = (d)=> new Date(d).toISOString().slice(0,10);
const todayISO = ()=> toISO(new Date());
const daysAgoISO = (n=30)=>{ const d=new Date(); d.setDate(d.getDate()-n); return toISO(d); };

const useSelectedClientIds = (clientesSel) =>
  useMemo(() => new Set((clientesSel || "").split(",").filter(Boolean).map(String)), [clientesSel]);

const findClientName = (id, clientesList, topList) => {
  const sId = String(id);
  const hit =
    (clientesList || []).find(r => String(r.clienteId || r._id) === sId) ||
    (topList || []).find(r => String(r.clienteId || r._id) === sId);
  if (!hit) return undefined;
  if (hit.nombre) return hit.nombre;
  const c = hit.cliente;
  if (c?.nombre) return `${c.nombre} ${c.apellido || ""}`.trim();
  if (hit.nombre && hit.apellido) return `${hit.nombre} ${hit.apellido}`.trim();
  return undefined;
};

export default function BIDashboard() {
  const [url, setUrl] = useUrlState({
    from: daysAgoISO(30),
    to: todayISO(),
    groupBy: "day",
    estados: "",
    estadosPago: "",
    clientesSel: "",
  });

  const toast = useRef(null);
  const [loading, setLoading] = useState(false);

  // Datos globales
  const [kpis, setKpis] = useState(null);
  const [estado, setEstado] = useState({ porEstado: [], porEstadoPago: [] });
  const [clientes, setClientes] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [topClientes, setTopClientes] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [insumosSort, setInsumosSort] = useState("-valuacion");

  // Autocomplete global
  const [searchCli, setSearchCli] = useState("");
  const [cliOpts, setCliOpts] = useState([]);

  // Buscador de la tabla “Clientes” (abajo)
  const [clientsQ, setClientsQ] = useState("");

  // Detalle (modal)
  const [detalle, setDetalle] = useState({ open: false, data: null });

  // “Clientes por selección” — súper compacto
  const [selBox, setSelBox] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 8,
    q: "",
  });

  // Popover para búsqueda compacta (selección)
  const overlayRef = useRef(null);
  const [overlaySearch, setOverlaySearch] = useState("");

  // Dialog “Ver lista completa” (selección)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPage, setDialogPage] = useState(1);
  const [dialogLimit] = useState(12);
  const [dialogItems, setDialogItems] = useState([]);
  const [dialogTotal, setDialogTotal] = useState(0);
  const [dialogQ, setDialogQ] = useState("");

  const selectedIds = useSelectedClientIds(url.clientesSel);

  // Limpia clientesSel de ids inválidos
  useEffect(() => {
    if (!url.clientesSel) return;
    const cleaned = url.clientesSel
      .split(",")
      .map(s => s.trim())
      .filter(s => /^[0-9a-fA-F]{24}$/.test(s));
    const unique = Array.from(new Set(cleaned)).join(",");
    if (unique !== url.clientesSel) {
      setUrl(s => ({ ...s, clientesSel: unique }));
    }
  }, [url.clientesSel, setUrl]);

  const chips = useMemo(() => {
    const arr = [];
    if (url.estados) url.estados.split(",").forEach(e => arr.push({ type:"estado", value:e }));
    if (url.estadosPago) url.estadosPago.split(",").forEach(e => arr.push({ type:"estadoPago", value:e }));
    selectedIds.forEach(id => {
      const name = findClientName(id, clientes.items, topClientes);
      arr.push({ type:"clienteId", id, value: name || `#${String(id).slice(-6)}` });
    });
    return arr;
  }, [url.estados, url.estadosPago, url.clientesSel, clientes.items, topClientes, selectedIds]);

  // ---------- Carga global ----------
  async function fetchAll({ page=clientes.page } = {}) {
    setLoading(true);
    try {
      const estados = (url.estados||"").split(",").filter(Boolean);
      const estadosPago = (url.estadosPago||"").split(",").filter(Boolean);
      const clienteId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : undefined;

      const [k, e, cl, t, ins] = await Promise.all([
        biGetKpis({ from:url.from, to:url.to, clienteId, estado: estados, estadoPago: estadosPago, tz: TZ }),
        biGetEstadoPedidos({ from:url.from, to:url.to, clienteId, estado: estados, estadoPago: estadosPago }),
        biListClientes({ from:url.from, to:url.to, q: clientsQ, page, limit: clientes.limit, estado: estados, estadoPago: estadosPago }),
        dashTopClientes({ from:url.from, to:url.to, limit: 10, estado: estados, estadoPago: estadosPago }),
        biGetInsumosStock({ sort: insumosSort, page: 1, limit: 50 }),
      ]);

      setKpis(k);

      const estadosSel = new Set(estados);
      const estadosPagoSel = new Set(estadosPago);
      setEstado({
        porEstado: (e?.porEstado||[]).map(x=>({ ...x, __active: !estadosSel.size || estadosSel.has(x.estado) })),
        porEstadoPago: (e?.porEstadoPago||[]).map(x=>({ ...x, __active: !estadosPagoSel.size || estadosPagoSel.has(x.estadoPago) })),
      });

      let nextClientes = { ...cl, limit: clientes.limit, page };
      if (selectedIds.size) {
        const filtered = (cl.items || []).filter(r => selectedIds.has(String(r.clienteId || r._id)));
        nextClientes = { ...nextClientes, items: filtered, total: filtered.length, page: 1 };
      }

      setClientes(nextClientes);
      setTopClientes(t?.data || []);
      setInsumos(ins?.items || []);

      // Refresca mini lista de selección
      await fetchSelectionClients({ firstLoad: true });
      if (dialogOpen) await fetchDialogClients({ firstLoad: true });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err?.message || 'No se pudieron cargar los datos' });
    } finally { setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); /* eslint-disable-next-line */},[]);
  useEffect(()=>{ fetchAll({ page: 1 }); /* eslint-disable-next-line */
  },[url.from, url.to, url.groupBy, url.clientesSel, url.estados, url.estadosPago, insumosSort, selectedIds]);

  // Debounce del buscador de la tabla de clientes
  useEffect(() => {
    const h = setTimeout(() => fetchAll({ page: 1 }), 300);
    return () => clearTimeout(h);
    // eslint-disable-next-line
  }, [clientsQ]);

  // ---------- Autocomplete global (filtro rápido arriba) ----------
  useEffect(()=>{
    const h = setTimeout(async ()=>{
      if (!searchCli) { setCliOpts([]); return; }
      const r = await biAutocompleteClientes(searchCli);
      setCliOpts((r.items||[]).map(x=>({ id: x.clienteId || x._id, label: `${x.nombre||""} ${x.apellido||""}`.trim() })));
    }, 300);
    return ()=>clearTimeout(h);
  }, [searchCli]);

  // ---------- Selección: mini lista + dialog ----------
  const fetchSelectionClients = async ({ page = 1, q = selBox.q, firstLoad = false } = {}) => {
    const estados = (url.estados||"").split(",").filter(Boolean);
    const estadosPago = (url.estadosPago||"").split(",").filter(Boolean);
    const r = await biListClientes({
      from:url.from, to:url.to, q, page, limit: selBox.limit,
      estado: estados, estadoPago: estadosPago
    });
    setSelBox(p => ({ ...p, items: r.items||[], total: r.total||0, page: firstLoad ? 1 : page, q }));
  };

  const fetchDialogClients = async ({ page = dialogPage, q = dialogQ, firstLoad = false } = {}) => {
    const estados = (url.estados||"").split(",").filter(Boolean);
    const estadosPago = (url.estadosPago||"").split(",").filter(Boolean);
    const r = await biListClientes({
      from:url.from, to:url.to, q, page: firstLoad ? 1 : page, limit: dialogLimit,
      estado: estados, estadoPago: estadosPago
    });
    setDialogItems(r.items || []);
    setDialogTotal(r.total || 0);
    setDialogPage(firstLoad ? 1 : page);
    setDialogQ(q);
  };

  // Alterna multi-selección (si quieres modo selección única, ver comentario más abajo)
  const toggleEstado = async (value) => {
    const cur = new Set((url.estados||"").split(",").filter(Boolean));
    cur.has(value) ? cur.delete(value) : cur.add(value);
    setUrl(s => ({ ...s, estados: Array.from(cur).join(",") }));
    setTimeout(()=> fetchSelectionClients({ page:1 }), 0);
    if (dialogOpen) setTimeout(()=> fetchDialogClients({ page:1 }), 0);
  };

  const toggleEstadoPago = async (value) => {
    const cur = new Set((url.estadosPago||"").split(",").filter(Boolean));
    cur.has(value) ? cur.delete(value) : cur.add(value);
    setUrl(s => ({ ...s, estadosPago: Array.from(cur).join(",") }));
    setTimeout(()=> fetchSelectionClients({ page:1 }), 0);
    if (dialogOpen) setTimeout(()=> fetchDialogClients({ page:1 }), 0);
  };

  // (Opcional) Selección única en tortas:
  // const toggleEstado = (value) => { setUrl(s => ({ ...s, estados: value })); setTimeout(()=>fetchSelectionClients({page:1}),0); if(dialogOpen) setTimeout(()=>fetchDialogClients({page:1}),0); };
  // const toggleEstadoPago = (value) => { setUrl(s => ({ ...s, estadosPago: value })); setTimeout(()=>fetchSelectionClients({page:1}),0); if(dialogOpen) setTimeout(()=>fetchDialogClients({page:1}),0); };

  const toggleClienteById = (id, name) => {
    const sid = String(id);
    if (!/^[0-9a-fA-F]{24}$/.test(sid)) {
      toast.current?.show({ severity:'warn', summary:'ID inválido', detail:'El ID del cliente no es válido.' });
      return;
    }
    const cur = new Set((url.clientesSel || "").split(",").filter(Boolean));
    if (cur.has(sid)) {
      cur.delete(sid);
      toast.current?.show({ severity:'info', summary:'Filtro quitado', detail: name || `Cliente ${sid.slice(-6)}` });
    } else {
      cur.add(sid);
      toast.current?.show({ severity:'info', summary:'Filtro agregado', detail: name || `Cliente ${sid.slice(-6)}` });
    }
    setUrl(s => ({ ...s, clientesSel: Array.from(cur).join(",") }));
  };

  const addClienteFilter = (row) => {
    const id = row?.clienteId || row?._id;
    const name = row?.nombre;
    if (id) toggleClienteById(id, name);
  };

  const openDetalle = async (id) => {
    if (!id) return;
    const data = await biGetClienteDetalle({ id, from:url.from, to:url.to });
    setDetalle({ open: true, data });
  };
  const closeDetalle = ()=> setDetalle({ open:false, data:null });

  const resetFilters = () => {
    setUrl(s => ({ ...s, estados:"", estadosPago:"", clientesSel:"" }));
    toast.current?.show({ severity:'success', summary:'Filtros', detail:'Se reiniciaron los filtros' });
    setSelBox(p => ({ ...p, items: [], total: 0, page: 1, q: "" }));
    if (dialogOpen) setDialogOpen(false);
  };

  const quickRanges = [
    { label:"7d", n:7 },
    { label:"30d", n:30 },
    { label:"90d", n:90 }
  ];

  // ---------- Render ----------
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Toast ref={toast} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel BI</h1>
          <p className="text-sm text-gray-500">Análisis operativo y financiero · {url.from} → {url.to}</p>
        </div>
        <div className="flex gap-2">
          <Button label="Reset" icon="pi pi-refresh" severity="contrast" onClick={resetFilters} />
        </div>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm">
        <div className="grid md:grid-cols-12 gap-3 items-end">
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Agrupar</label>
            <Dropdown className="w-full" value={url.groupBy} onChange={(e)=> setUrl(s=> ({...s, groupBy: e.value}))}
                      options={[{label:"Día",value:"day"},{label:"Semana",value:"week"},{label:"Mes",value:"month"}]} placeholder="Seleccionar" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            {quickRanges.map(q => (
              <Button key={q.n} label={q.label} outlined onClick={()=> setUrl(s=> ({...s, from: daysAgoISO(q.n), to: todayISO()}))} />
            ))}
          </div>
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
                toggleClienteById(o.id, o.label);
                setSearchCli("");
                setCliOpts([]);
              }}
            />
          </div>
        </div>

        {!!chips.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c,i)=> (
              <Chip key={i}
                    label={`${c.type === 'clienteId' ? 'cliente' : c.type}: ${c.value}`}
                    removable
                    onRemove={()=>{
                      if (c.type==="estado") toggleEstado(c.value);
                      else if (c.type==="estadoPago") toggleEstadoPago(c.value);
                      else if (c.type==="clienteId") toggleClienteById(c.id, c.value);
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
          <StatCard label="Pedidos" value={fmtInt(kpis?.kpis?.pedidos)} />
          <StatCard label="Ingresos" value={fmtBOB(kpis?.kpis?.ingresos)} />
          <StatCard label="Pagado" value={fmtBOB(kpis?.kpis?.pagado)} onClick={()=>setUrl(s=>({ ...s, estadosPago:"Pagado" }))} clickable />
          <StatCard label="Saldo" value={fmtBOB(kpis?.kpis?.saldo)} onClick={()=>setUrl(s=>({ ...s, estadosPago:"Parcial,Sin pago" }))} clickable />
          <StatCard label="Costo Materiales" value={fmtBOB(kpis?.kpis?.costoMateriales)} />
          <StatCard label="Margen Estimado" value={fmtBOB(kpis?.kpis?.margenEstimado)} />
        </div>
      </section>

      {/* Estados + Clientes por selección */}
      <section className="grid md:grid-cols-3 gap-4">
        {/* Tortas */}
        <Card className="md:col-span-2">
          <div className="font-semibold mb-2">Estados de pedidos</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PieBox title="Operativo" data={estado.porEstado} labelKey="estado" valueKey="count" onSliceClick={toggleEstado} />
            <PieBox title="Financiero" data={estado.porEstadoPago} labelKey="estadoPago" valueKey="count" onSliceClick={toggleEstadoPago} />
          </div>
        </Card>

        {/* Clientes por selección — COMPACTO */}
        <Card className="md:col-span-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Clientes por selección</div>
            <div className="flex items-center gap-1">
              {/* Buscar (OverlayPanel) */}
              <Button
                icon="pi pi-search"
                rounded
                text
                aria-label="Buscar"
                onClick={(e)=> overlayRef.current?.toggle(e)}
                tooltip="Buscar en esta selección"
              />
              {/* Ver lista completa (Dialog) */}
              <Button
                icon="pi pi-external-link"
                rounded
                text
                aria-label="Ver todo"
                onClick={async ()=>{
                  setDialogOpen(true);
                  await fetchDialogClients({ firstLoad: true });
                }}
                tooltip="Ver lista completa"
              />
            </div>
          </div>

          {/* Chips filtros */}
          <div className="mt-2 flex flex-wrap gap-1">
            {(url.estados||"").split(",").filter(Boolean).map(v=>(
              <Chip key={`e-${v}`} label={v} className="text-xs" removable onRemove={()=> toggleEstado(v)} />
            ))}
            {(url.estadosPago||"").split(",").filter(Boolean).map(v=>(
              <Chip key={`ep-${v}`} label={v} className="text-xs" removable onRemove={()=> toggleEstadoPago(v)} />
            ))}
            {!(url.estados||url.estadosPago) && <Tag value="Sin filtros" />}
          </div>

          {/* Mini lista */}
          <div className="mt-2 border rounded p-2 max-h-72 overflow-auto">
            <MiniClientUl
              items={selBox.items}
              onOpen={openDetalle}
              onToggle={toggleClienteById}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Total: {fmtInt(selBox.total)}</span>
              <div className="flex items-center gap-1">
                <Button
                  text
                  size="small"
                  label="‹"
                  onClick={()=> {
                    const prev = Math.max(1, selBox.page - 1);
                    if (prev !== selBox.page) fetchSelectionClients({ page: prev });
                  }}
                  disabled={selBox.page<=1}
                />
                <span>{selBox.page}</span>
                <Button
                  text
                  size="small"
                  label="›"
                  onClick={()=> {
                    const maxPage = Math.ceil(selBox.total / selBox.limit) || 1;
                    const next = Math.min(maxPage, selBox.page + 1);
                    if (next !== selBox.page) fetchSelectionClients({ page: next });
                  }}
                  disabled={selBox.page >= Math.ceil(selBox.total/selBox.limit)}
                />
              </div>
            </div>
          </div>

          {/* Popover búsqueda selección */}
          <OverlayPanel ref={overlayRef} showCloseIcon dismissable className="w-80">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Buscar en esta selección</div>
              <AutoComplete
                value={overlaySearch}
                suggestions={[]}
                completeMethod={()=>{}}
                forceSelection={false}
                placeholder="Nombre, teléfono, correo"
                className="w-full"
                onChange={(e)=> setOverlaySearch(e.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button text label="Limpiar" icon="pi pi-eraser" onClick={() => setOverlaySearch("")} />
                <Button
                  label="Buscar"
                  icon="pi pi-search"
                  onClick={()=>{ setSelBox(p=>({ ...p, q: overlaySearch })); fetchSelectionClients({ page:1, q: overlaySearch }); overlayRef.current?.hide(); }}
                />
              </div>
            </div>
          </OverlayPanel>
        </Card>
      </section>

      {/* Top clientes — horizontal */}
      <Card>
        <div className="font-semibold mb-2">Top clientes por ingresos</div>
        <div style={{ width: "100%", height: 420 }}>
          <ResponsiveContainer>
            <BarChart
              data={topClientes}
              layout="vertical"
              onClick={(e)=>{
                if (e && e.activePayload && e.activePayload[0]?.payload) {
                  addClienteFilter(e.activePayload[0].payload);
                }
              }}
              margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={fmtBOB} />
              <YAxis type="category" dataKey="nombre" width={150} tick={{ fontSize: 12, fill: "#111827" }} />
              <Tooltip formatter={(v)=>fmtBOB(v)} />
              <Bar dataKey="total">
                <LabelList dataKey="total" position="right" formatter={(v)=>fmtBOB(v)} />
                {topClientes.map((_, i) => (
                  <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <i className="pi pi-info-circle mr-1"/>Clic en una barra para alternar selección de ese cliente.
        </div>
      </Card>

      {/* Tabla Clientes (global) */}
      <Card>
        <div className="font-semibold mb-2">Clientes</div>
        <DataTable
          value={loading ? [] : clientes.items}
          loading={loading}
          paginator
          rows={clientes.limit}
          totalRecords={clientes.total}
          first={(clientes.page-1)*clientes.limit}
          onPage={(e)=>{ const newPage = Math.floor(e.first/e.rows)+1; setClientes(prev=>({...prev, page:newPage, limit:e.rows})); fetchAll({ page:newPage }); }}
          responsiveLayout="scroll"
          stripedRows
          size="small"
          emptyMessage={<EmptyState text="Sin clientes para los filtros actuales" />}
          rowClassName={(row) => selectedIds.has(String(row.clienteId || row._id)) ? 'bg-yellow-50' : ''}
          onRowDoubleClick={(e)=> openDetalle(e.data.clienteId || e.data._id)}
          header={
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">Listado</div>
              <div className="flex items-center gap-2">
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    value={clientsQ}
                    onChange={(e)=> setClientsQ(e.target.value)}
                    placeholder="Buscar cliente (nombre/teléfono/correo)"
                    className="w-64"
                  />
                </span>
                {clientsQ && (
                  <Button text icon="pi pi-times" onClick={()=> setClientsQ("")} tooltip="Limpiar búsqueda" />
                )}
              </div>
            </div>
          }
        >
          <Column
            field="nombre"
            header="Cliente"
            body={(r)=> {
              const id = r.clienteId || r._id;
              const name = `${r.nombre} ${r.apellido}`.trim();
              const selected = selectedIds.has(String(id));
              return (
                <div className="flex items-center gap-2">
                  <Button link label={name} onClick={()=> openDetalle(id)} />
                  <Button
                    text
                    icon={selected ? "pi pi-filter-slash" : "pi pi-filter"}
                    onClick={()=> toggleClienteById(id, name)}
                    tooltip={selected ? "Quitar de selección" : "Filtrar por este cliente"}
                  />
                </div>
              );
            }}
          />
          <Column field="pedidos" header="Pedidos" body={(r)=> <span className="float-right">{fmtInt(r.pedidos)}</span>} />
          <Column field="ingresos" header="Ingresos" body={(r)=> <span className="float-right">{fmtBOB(r.ingresos)}</span>} />
          <Column field="pagado" header="Pagado" body={(r)=> <span className="float-right">{fmtBOB(r.pagado)}</span>} />
          <Column field="saldo" header="Saldo" body={(r)=> <span className="float-right font-semibold">{fmtBOB(r.saldo)}</span>} />
          <Column field="ultimaCompra" header="Última compra" body={(r)=> r.ultimaCompra ? fmtDate(r.ultimaCompra) : '-'} />
          <Column header="" body={()=> <i className="pi pi-angle-right text-gray-400"/>} style={{ width: 40 }} />
        </DataTable>
      </Card>

      {/* Dialog: lista completa de clientes por selección */}
      <Dialog
        header="Clientes por selección"
        visible={dialogOpen}
        modal
        style={{ width: "720px", maxWidth: "95vw" }}
        onHide={()=> setDialogOpen(false)}
      >
        <div className="flex items-end gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Buscar</label>
            <AutoComplete
              value={dialogQ}
              suggestions={[]}
              completeMethod={()=>{}}
              placeholder="Nombre, teléfono, correo"
              className="w-full"
              onChange={(e)=> setDialogQ(e.value)}
            />
          </div>
        <Button label="Buscar" icon="pi pi-search" onClick={()=> fetchDialogClients({ page:1, q: dialogQ })} />
          <Button label="Limpiar" text icon="pi pi-eraser" onClick={()=> { setDialogQ(""); fetchDialogClients({ page:1, q:"" }); }} />
        </div>

        <DataTable
          value={dialogItems}
          paginator
          rows={dialogLimit}
          totalRecords={dialogTotal}
          first={(dialogPage-1)*dialogLimit}
          onPage={(e)=>{ const newPage = Math.floor(e.first/e.rows)+1; fetchDialogClients({ page:newPage, q: dialogQ }); }}
          responsiveLayout="scroll"
          stripedRows
          size="small"
          emptyMessage={<EmptyState text="No hay clientes para esta selección" />}
        >
          <Column field="nombre" header="Cliente" body={(r)=>{
            const id = r.clienteId || r._id;
            const name = `${r.nombre} ${r.apellido}`.trim();
            return (
              <div className="flex items-center gap-2">
                <Button link label={name} onClick={()=> openDetalle(id)} />
                <Tag value={fmtBOB(r.ingresos)} />
              </div>
            );
          }} />
          <Column field="pedidos" header="Pedidos" body={(r)=> <span className="float-right">{fmtInt(r.pedidos)}</span>} />
          <Column field="pagado" header="Pagado" body={(r)=> <span className="float-right">{fmtBOB(r.pagado)}</span>} />
          <Column field="saldo" header="Saldo" body={(r)=> <span className="float-right">{fmtBOB(r.saldo)}</span>} />
        </DataTable>
      </Dialog>

      {/* Detalle de cliente (Dialog) */}
      <Dialog
        header="Detalle de cliente"
        visible={detalle.open}
        modal
        style={{ width: "820px", maxWidth: "95vw" }}
        onHide={closeDetalle}
      >
        <ClienteDetalleContent data={detalle.data} />
      </Dialog>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="shadow-2xl"><div className="flex items-center gap-3"><i className="pi pi-spin pi-spinner text-xl"/><span>Cargando…</span></div></Card>
        </div>
      )}
    </div>
  );
}

/* ---------- auxiliares UI ----------- */
function StatCard({ label, value, onClick, clickable }) {
  return (
    <Card className={`transition-all ${clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-[1px]':''}`} onClick={onClick}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}

function PieBox({ title, data, labelKey, valueKey, onSliceClick }) {
  const rows = data || [];
  const total = rows.reduce((a, x)=> a + (x[valueKey]||0), 0);

  // ⬇️ FIX: asegurar que el clic obtenga el valor del campo correcto (estado / estadoPago)
  const handleSliceClick = (d) => {
    const value = d?.payload?.[labelKey];
    if (value && onSliceClick) onSliceClick(value);
  };

  return (
    <div>
      <div className="text-sm font-medium mb-1 flex items-center gap-2">
        <span>{title}</span>
        <Tag value={`Total: ${fmtInt(total)}`} rounded />
      </div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={rows}
              dataKey={valueKey}
              nameKey={labelKey}           // ⬅️ clave: usar el campo de etiqueta real
              outerRadius={85}
              label={({ name, value }) => {
                const pct = total ? ((value*100/total).toFixed(1)) : 0;
                return `${name} (${pct}%)`;
              }}
              onClick={handleSliceClick}    // ⬅️ clave: leer del payload correcto
            >
              {rows.map((row, i)=>(
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={row.__active ? 1 : 0.35}
                  stroke={row.__active ? "#111827" : "transparent"}
                  strokeWidth={row.__active ? 1 : 0}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v)=>fmtInt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MiniClientUl({ items = [], onOpen, onToggle }) {
  if (!items.length) return <EmptyState text="Sin clientes" />;
  return (
    <ul className="space-y-1">
      {items.map((r, i) => {
        const id = r.clienteId || r._id;
        const name = `${r.nombre} ${r.apellido}`.trim() || `#${String(id).slice(-6)}`;
        return (
          <li key={id} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: COLORS[i % COLORS.length] }} />
              <button className="font-medium hover:underline" onClick={()=> onOpen(id)}>{name}</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{fmtBOB(r.ingresos)}</span>
              <Button text icon="pi pi-filter" onClick={()=> onToggle(id, name)} tooltip="Filtrar por este cliente" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-6 text-center text-sm text-gray-500">
      <i className="pi pi-inbox mr-2" /> {text}
    </div>
  );
}

function ClienteDetalleContent({ data }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <InfoBox label="Nombre" value={`${d?.cliente?.nombre||""} ${d?.cliente?.apellido||""}`} />
        <InfoBox label="Teléfono" value={d?.cliente?.telefono} />
        <InfoBox label="Correo" value={d?.cliente?.correo} />
        <InfoBox label="Pedidos" value={fmtInt(d?.totales?.pedidos)} />
        <InfoBox label="Ingresos" value={fmtBOB(d?.totales?.ingresos)} />
        <InfoBox label="Pagado" value={fmtBOB(d?.totales?.pagado)} />
        <InfoBox label="Saldo" value={fmtBOB(d?.totales?.saldo)} />
      </div>

      <div>
        <h4 className="font-semibold mb-2">Top productos</h4>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={d?.topProductos||[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tickFormatter={fmtBOB} />
              <Tooltip formatter={(v)=>fmtBOB(v)} />
              <Bar dataKey="ingresos">
                <LabelList dataKey="ingresos" position="top" formatter={(v)=>fmtBOB(v)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Últimos pedidos</h4>
        <DataTable value={d?.pedidos || []} responsiveLayout="scroll" stripedRows size="small" emptyMessage={<EmptyState text="Sin pedidos" />}>
          <Column field="createdAt" header="Fecha" body={(p)=> fmtDateTime(p.createdAt)} />
          <Column field="producto.nombre" header="Producto" body={(p)=> p.producto?.nombre } />
          <Column field="cantidad" header="Cantidad" body={(p)=> <span className="float-right">{fmtInt(p.cantidad)}</span>} />
          <Column field="total" header="Total" body={(p)=> <span className="float-right">{fmtBOB(p.total)}</span>} />
          <Column field="pagado" header="Pagado" body={(p)=> <span className="float-right">{fmtBOB(p.pagado)}</span>} />
          <Column field="saldo" header="Saldo" body={(p)=> <span className="float-right">{fmtBOB(p.saldo)}</span>} />
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
