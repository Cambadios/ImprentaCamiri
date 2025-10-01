import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { apiFetch } from "../../../../api/http"; // para buscar por q

export default function AgregarModal({ open, onClose, prefill, onConfirm }) {
  const [modo, setModo] = useState("insumoId"); // insumoId | codigo | clave
  const [insumoId, setInsumoId] = useState(prefill?.insumoId || "");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [unidadDeMedida, setUnidadDeMedida] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [costoUnitario, setCostoUnitario] = useState(null);

  const [opcionesInsumos, setOpcionesInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      // Autocomplete base
      const resp = await apiFetch(`/inventario?q=`);
      const data = await resp.json();
      setOpcionesInsumos(
        (Array.isArray(data)?data:[]).map(i=>({ label: `${i.codigo || ''} ${i.nombre}`, value: i._id, unidad: i.unidadDeMedida }))
      );
      // Categorías insumo
      const rc = await apiFetch(`/categorias?tipo=insumo`);
      const dc = await rc.json();
      setCategorias((Array.isArray(dc)?dc:[]).map(c=>({ label: `${c.prefijo || ''} ${c.nombre}`.trim(), value: c._id })));
    })();
  }, [open]);

  useEffect(() => {
    if (prefill?.insumoId) setInsumoId(prefill.insumoId);
  }, [prefill]);

  const confirmar = () => {
    if (Number(cantidad) <= 0) return;
    const payload = { cantidad: Number(cantidad), costoUnitario: Number(costoUnitario || 0) || null };
    if (modo === "insumoId") Object.assign(payload, { insumoId });
    if (modo === "codigo")   Object.assign(payload, { codigo });
    if (modo === "clave")    Object.assign(payload, { nombre, marca, unidadDeMedida, categoriaId });
    onConfirm(payload);
  };

  return (
    <Dialog header="Agregar stock a insumo existente" visible={open} style={{ width: 560 }} modal onHide={onClose}>
      <div className="p-fluid space-y-4">
        <div>
          <label className="block font-semibold">Modo de selección</label>
          <Dropdown value={modo} onChange={(e)=>setModo(e.value)} options={[
            {label:'Por Insumo (lista)', value:'insumoId'},
            {label:'Por Código', value:'codigo'},
            {label:'Por Clave Natural', value:'clave'},
          ]}/>
        </div>

        {modo==='insumoId' && (
          <div>
            <label className="block font-semibold">Insumo</label>
            <Dropdown value={insumoId} onChange={(e)=>setInsumoId(e.value)} options={opcionesInsumos} filter showClear placeholder="Selecciona insumo"/>
          </div>
        )}

        {modo==='codigo' && (
          <div>
            <label className="block font-semibold">Código</label>
            <InputText value={codigo} onChange={(e)=>setCodigo(e.target.value)} placeholder="Ej: TIN-0001" className="w-full"/>
          </div>
        )}

        {modo==='clave' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold">Nombre</label>
              <InputText value={nombre} onChange={(e)=>setNombre(e.target.value)} className="w-full"/>
            </div>
            <div>
              <label className="block font-semibold">Marca (opcional)</label>
              <InputText value={marca} onChange={(e)=>setMarca(e.target.value)} className="w-full"/>
            </div>
            <div>
              <label className="block font-semibold">Unidad</label>
              <InputText value={unidadDeMedida} onChange={(e)=>setUnidadDeMedida(e.target.value)} placeholder="Litros / Unidad / Kg" className="w-full"/>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold">Categoría (insumo)</label>
              <Dropdown value={categoriaId} onChange={(e)=>setCategoriaId(e.value)} options={categorias} filter showClear placeholder="Selecciona categoría"/>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold">Cantidad</label>
            <InputNumber value={cantidad} onValueChange={(e)=>setCantidad(e.value)} min={0} className="w-full"/>
          </div>
          <div>
            <label className="block font-semibold">Costo unitario (opcional)</label>
            <InputNumber value={costoUnitario} onValueChange={(e)=>setCostoUnitario(e.value)} mode="currency" currency="BOB" locale="es-BO" className="w-full"/>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button label="Cancelar" className="p-button-text" onClick={onClose}/>
          <Button label="Agregar" className="p-button-success" onClick={confirmar}/>
        </div>
      </div>
    </Dialog>
  );
}
