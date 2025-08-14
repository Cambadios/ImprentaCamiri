import React, { useState } from "react";
import { urlApi } from "../../../api/api";

export default function Form({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    producto: initial?.producto || "",
    cantidad: initial?.cantidad ?? ""
  });
  const [saving, setSaving] = useState(false);
  const change = (e)=>setForm({...form,[e.target.name]:e.target.value});

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = initial? "PUT":"POST";
      const url = initial? `${urlApi}/api/inventario/${initial._id}` : `${urlApi}/api/inventario`;
      const res = await fetch(url, {
        method,
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, cantidad: Number(form.cantidad) })
      });
      if (!res.ok) throw new Error("Error al guardar");
      onSaved?.();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="at-modal">
      <div className="at-modal-body">
        <h4>{initial? "Editar inventario":"Nuevo inventario"}</h4>
        <form onSubmit={save} className="at-form">
          <label>Producto (ID) <input name="producto" value={form.producto} onChange={change} required/></label>
          <label>Cantidad <input type="number" name="cantidad" value={form.cantidad} onChange={change} required/></label>
          <div className="at-actions">
            <button className="at-btn" disabled={saving} type="submit">{saving? "Guardando...":"Guardar"}</button>
            <button className="at-btn at-btn-danger" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
