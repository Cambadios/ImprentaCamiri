import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function MovimientoModal({ open, onClose, tipo, insumo, onConfirm }) {
  const [cantidad, setCantidad] = useState(0);
  const [motivo, setMotivo] = useState("");
  const [costoUnitario, setCostoUnitario] = useState(null);
  const unidad = insumo?.unidadDeMedida || "";

  useEffect(() => {
    if (open) { setCantidad(0); setMotivo(""); setCostoUnitario(null); }
  }, [open]);

  const confirmar = () => {
    if (Number(cantidad) <= 0) return;
    onConfirm({
      insumoId: insumo._id,
      cantidad: Number(cantidad),
      unidadDeMedida: unidad,
      motivo: motivo?.trim() || undefined,
      costoUnitario: tipo === 'INGRESO' ? Number(costoUnitario || 0) || null : null
    });
  };

  return (
    <Dialog header={`${tipo} de ${insumo?.nombre || ''}`} visible={open} style={{ width: 480 }} modal onHide={onClose}>
      <div className="p-fluid space-y-4">
        <div>
          <label className="block font-semibold">Cantidad ({unidad})</label>
          <InputNumber value={cantidad} onValueChange={(e)=>setCantidad(e.value)} min={0} className="w-full"/>
          {tipo === 'SALIDA' && insumo && (
            <small className="text-gray-500">Stock actual: {insumo.cantidadDisponible} {unidad}</small>
          )}
        </div>
        {tipo === 'INGRESO' && (
          <div>
            <label className="block font-semibold">Costo unitario (opcional)</label>
            <InputNumber value={costoUnitario} onValueChange={(e)=>setCostoUnitario(e.value)} mode="currency" currency="BOB" locale="es-BO" className="w-full"/>
          </div>
        )}
        <div>
          <label className="block font-semibold">Motivo (opcional)</label>
          <InputText value={motivo} onChange={(e)=>setMotivo(e.target.value)} className="w-full" placeholder={tipo==='INGRESO'?'OC-123 / Compra':'Pedido #45 / Uso'}/>
        </div>
        <div className="flex justify-end gap-2">
          <Button label="Cancelar" className="p-button-text" onClick={onClose}/>
          <Button label="Confirmar" className={tipo==='INGRESO'?'p-button-success':'p-button-warning'} onClick={confirmar}/>
        </div>
      </div>
    </Dialog>
  );
}
