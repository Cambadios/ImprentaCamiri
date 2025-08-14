import React, { useEffect, useState } from "react";
import { urlApi } from "../../../api/api";
import Form from "./form";

export default function InventarioList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${urlApi}/api/inventario`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const onCreate = () => { setEditing(null); setShowForm(true); };
  const onEdit = (item) => { setEditing(item); setShowForm(true); };
  const onDelete = async (id) => {
    if (!confirm("¿Eliminar item de inventario?")) return;
    await fetch(`${urlApi}/api/inventario/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="at-panel">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h3>Inventario</h3>
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
                <th>Producto (ID)</th>
                <th>Cantidad</th>
                <th style={{width:160}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(i => (
                <tr key={i._id}>
                  <td>{i.producto}</td>
                  <td>{i.cantidad}</td>
                  <td>
                    <button className="at-btn" onClick={() => onEdit(i)}>Editar</button>{" "}
                    <button className="at-btn at-btn-danger" onClick={() => onDelete(i._id)}>Borrar</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={3} className="at-muted">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
