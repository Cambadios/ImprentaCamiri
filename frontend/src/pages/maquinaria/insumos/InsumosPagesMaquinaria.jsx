import React, { useEffect, useMemo, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import InsumosListMaquinaria from "./InsumosListMaquinaria.jsx";
import { apiFetch } from "../../../api/http";

export default function InsumosPagesMaquinaria() {
  const toast = useRef(null);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce 250 ms
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const fetchInsumos = async () => {
    try {
      setLoading(true);
      const resp = await apiFetch("/inventario");
      const data = await resp.json();
      // Soporta varios formatos: {data: [...]}, [...], {inventarios:[...]}
      const arr =
        Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.inventarios)
          ? data.inventarios
          : [];
      setInsumos(arr || []);
    } catch (e) {
      console.error(e);
      setInsumos([]);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo obtener la lista de insumos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const s = (v) => (v == null ? "" : String(v));
  const filtered = useMemo(() => {
    if (!debounced) return insumos;
    return (insumos ?? []).filter((i) => {
      const campos = [
        s(i?.nombre),
        s(i?.descripcion),
        s(i?.categoria),
        s(i?.codigo),
        s(i?.unidadDeMedida),
      ].map((x) => x.toLowerCase());
      return campos.some((x) => x.includes(debounced));
    });
  }, [insumos, debounced]);

  return (
    <div className="space-y-3">
      <Toast ref={toast} />

      {/* Barra simple (buscar + refrescar) */}
      <div className="bg-white rounded-lg shadow p-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <span className="text-base font-semibold">Buscar insumos</span>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Nombre, código, categoría, unidad…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
            />
          </span>
          <Button
            label="Refrescar"
            icon="pi pi-refresh"
            onClick={fetchInsumos}
            outlined
            disabled={loading}
          />
        </div>
      </div>

      {/* Tabla */}
      <InsumosListMaquinaria insumos={filtered} loading={loading} />
    </div>
  );
}
