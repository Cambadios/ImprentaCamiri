import React, { useEffect, useMemo, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import ClientesListMaquinaria from "./ClientesListMaquinaria.jsx";
import { apiFetch } from "../../../api/http";

export default function ClientesPagesMaquinaria() {
  const toast = useRef(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce búsqueda
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [search]);

  async function fetchClientes() {
    try {
      setLoading(true);
      const res = await apiFetch("/clientes");
      const data = await res.json();
      const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setClientes(arr || []);
    } catch (err) {
      console.error(err);
      setClientes([]);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo obtener la lista de clientes.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  const s = (v) => (v == null ? "" : String(v));
  const filtered = useMemo(() => {
    if (!debounced) return clientes;
    return (clientes ?? []).filter((c) => {
      const campos = [
        s(c?.nombre),
        s(c?.apellido),
        s(c?.telefono),
        s(c?.correo || c?.email),
        s(c?.documento),
        s(c?.nombreCompleto),
      ].map((x) => x.toLowerCase());
      return campos.some((x) => x.includes(debounced));
    });
  }, [clientes, debounced]);

  return (
    <div className="space-y-3">
      <Toast ref={toast} />

      {/* Barra simple (como tu flujo normal) */}
      <div className="bg-white rounded-lg shadow p-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <span className="text-base font-semibold">Buscar clientes</span>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Nombre, apellido, teléfono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
            />
          </span>
          <Button
            label="Refrescar"
            icon="pi pi-refresh"
            onClick={fetchClientes}
            outlined
            disabled={loading}
          />
        </div>
      </div>

      {/* Tabla con HEADER 'Lista de Clientes' */}
      <ClientesListMaquinaria clientes={filtered} loading={loading} />
    </div>
  );
}
