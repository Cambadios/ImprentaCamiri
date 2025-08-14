import React, { useState } from "react";
import { urlApi } from "../../../api/api";

export default function Form({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: initial?.nombre || "",
    precio: initial?.precio ?? "",
    descripcion: initial?.descripcion || ""
  });
  const [saving, setSaving] = useState(false);
  const change = (e)=>setForm({...form,[e.target.name]:e.target.value});

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = initial? "PUT":"POST";
      const url = initial? `${urlApi}/api/productos/${initial._id}` : `${urlApi}/api/productos`;
      const res = await fetch(url, {
        method,
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, precio: Number(form.precio) })
      });
      if (!res.ok) throw new Error("Error al guardar");
      onSaved?.();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="at-modal">
      <div className="at-modal-body">
        <h4>{initial? "Editar producto":"Nuevo producto"}</h4>
        <form onSubmit={save} className="at-form">
          <label>Nombre <input name="nombre" value={form.nombre} onChange={change} required/></label>
          <label>Precio <input type="number" step="0.01" name="precio" value={form.precio} onChange={change} required/></label>
          <label>Descripción <input name="descripcion" value={form.descripcion} onChange={change}/></label>
          <div className="at-actions">
            <button className="at-btn" disabled={saving} type="submit">{saving? "Guardando...":"Guardar"}</button>
            <button className="at-btn at-btn-danger" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
