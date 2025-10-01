import React from "react";
import { Dialog } from "primereact/dialog";

export default function KardexDrawer({ open, onClose, data }) {
  const filas = data?.kardex || [];
  const insumo = data?.insumo;
  return (
    <Dialog header={`Kárdex - ${insumo?.codigo || ''} ${insumo?.nombre || ''}`} visible={open} style={{ width: 720 }} modal onHide={onClose}>
      <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Fecha</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Motivo</th>
              <th>Referencia</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, idx)=>(
              <tr key={idx} className="border-b">
                <td className="py-1">{new Date(f.fecha).toLocaleString('es-BO')}</td>
                <td>{f.tipo}</td>
                <td>{f.cantidad}</td>
                <td>{f.unidad}</td>
                <td>{f.motivo || '—'}</td>
                <td>{f.referencia || '—'}</td>
                <td>{f.saldo}</td>
              </tr>
            ))}
            {filas.length===0 && (
              <tr><td colSpan={7} className="text-center py-4 text-gray-500">Sin movimientos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}
