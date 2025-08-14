import React, { useState } from "react";
import { urlApi } from "../../../api/api";

export default function Form({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: initial?.nombre || "",
    apellido: initial?.apellido || "",
    telefono: initial?.telefono || "",
    correo: initial?.correo || "",
    direccion: initial?.direccion || ""
  });
  const [saving, setSaving] = useState(false);
  const change = (e)=>setForm({...form,[e.target.name]:e.target.value});

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = initial? "PUT":"POST";
      const url = initial? `${urlApi}/api/clientes/${initial._id}` : `${urlApi}/api/clientes`;
      const res = await fetch(url, {
        method,
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Error al guardar");
      onSaved?.();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="at-modal">
      <div className="at-modal-body">
        <h4>{initial? "Editar cliente":"Nuevo cliente"}</h4>
        <form onSubmit={save} className="at-form">
          <label>Nombre <input name="nombre" value={form.nombre} onChange={change} required/></label>
          <label>Apellido <input name="apellido" value={form.apellido} onChange={change} required/></label>
          <label>Teléfono <input name="telefono" value={form.telefono} onChange={change}/></label>
          <label>Correo <input type="email" name="correo" value={form.correo} onChange={change}/></label>
          <label>Dirección <input name="direccion" value={form.direccion} onChange={change}/></label>
          <div className="at-actions">
            <button className="at-btn" disabled={saving} type="submit">{saving? "Guardando...":"Guardar"}</button>
            <button className="at-btn at-btn-danger" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
