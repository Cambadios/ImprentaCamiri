import React, { useEffect, useState } from "react";
import { urlApi } from "../../../api/api";
import Form from "./form";

export default function ClientesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${urlApi}/api/clientes`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const onCreate = () => { setEditing(null); setShowForm(true); };
  const onEdit = (item) => { setEditing(item); setShowForm(true); };
  const onDelete = async (id) => {
    if (!confirm("¿Eliminar cliente?")) return;
    await fetch(`${urlApi}/api/clientes/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="at-panel">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h3>Clientes</h3>
        <button className="at-btn" onClick={onCreate}>Nuevo</button>
      </div>

      {showForm && (
        <Form
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchData(); }}
        />
      )}

      {loading ? <p className="at-muted">Cargando...</p> : (
        <div style={{overflowX:"auto"}}>
          <table className="at-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th style={{width:160}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(c => (
                <tr key={c._id}>
                  <td>{c.nombre}</td>
                  <td>{c.apellido}</td>
                  <td>{c.telefono}</td>
                  <td>{c.correo}</td>
                  <td>{c.direccion}</td>
                  <td>
                    <button className="at-btn" onClick={() => onEdit(c)}>Editar</button>{" "}
                    <button className="at-btn at-btn-danger" onClick={() => onDelete(c._id)}>Borrar</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={6} className="at-muted">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
