import React, { useState } from "react";
import { urlApi } from "../../../api/api";

export default function Form({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    cliente: initial?.cliente || "",
    total: initial?.total ?? "",
    estado: initial?.estado || "PENDIENTE"
  });
  const [saving, setSaving] = useState(false);
  const change = (e)=>setForm({...form,[e.target.name]:e.target.value});

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = initial? "PUT":"POST";
      const url = initial? `${urlApi}/api/pedidos/${initial._id}` : `${urlApi}/api/pedidos`;
      const res = await fetch(url, {
        method,
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, total: Number(form.total) })
      });
      if (!res.ok) throw new Error("Error al guardar");
      onSaved?.();
    } catch (err) {
      alert(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="at-modal">
      <div className="at-modal-body">
        <h4>{initial? "Editar pedido":"Nuevo pedido"}</h4>
        <form onSubmit={save} className="at-form">
          <label>Cliente (ID) <input name="cliente" value={form.cliente} onChange={change} required/></label>
          <label>Total <input type="number" step="0.01" name="total" value={form.total} onChange={change} required/></label>
          <label>Estado
            <select name="estado" value={form.estado} onChange={change}>
              <option>PENDIENTE</option>
              <option>EN_PROCESO</option>
              <option>ENTREGADO</option>
              <option>ANULADO</option>
            </select>
          </label>
          <div className="at-actions">
            <button className="at-btn" disabled={saving} type="submit">{saving? "Guardando...":"Guardar"}</button>
            <button className="at-btn at-btn-danger" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
