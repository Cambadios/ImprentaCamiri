import React, { useState } from "react";
import { urlApi } from "../../../api/api";

export default function Form({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombreCompleto: initial?.nombreCompleto || "",
    correo: initial?.correo || "",
    rol: initial?.rol || "usuario",
    contrasena: ""
  });
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = initial? "PUT" : "POST";
      const url = initial? `${urlApi}/api/usuarios/${initial._id}` : `${urlApi}/api/usuarios`;
      const body = { ...form };
      if (initial) delete body.contrasena; // no cambiar si edita (ajústalo a tu flujo)
      const res = await fetch(url, {
        method,
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(body)
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
        <h4>{initial? "Editar usuario":"Nuevo usuario"}</h4>
        <form onSubmit={save} className="at-form">
          <label>Nombre completo
            <input name="nombreCompleto" value={form.nombreCompleto} onChange={change} required />
          </label>
          <label>Correo
            <input type="email" name="correo" value={form.correo} onChange={change} required />
          </label>
          <label>Rol
            <select name="rol" value={form.rol} onChange={change}>
              <option value="admin">admin</option>
              <option value="usuario">usuario</option>
            </select>
          </label>
          {!initial && (
            <label>Contraseña
              <input type="password" name="contrasena" value={form.contrasena} onChange={change} required />
            </label>
          )}
          <div className="at-actions">
            <button className="at-btn" disabled={saving} type="submit">{saving? "Guardando...":"Guardar"}</button>
            <button className="at-btn at-btn-danger" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
