import React, { useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import PedidosListMaquinaria from "./PedidosListMaquinaria.jsx";
import SalidasModalPedidos from "./modals/SalidasModalPedidos.jsx";

import { apiFetch } from "../../../api/http";
import { toCanonEstado, toCanonStrict, nextStatesOfForMaquinaria } from "../../../utils/estados";

const normalizeDigits = (v) => (v ? String(v).replace(/\D+/g, "") : "");
const s = (v) => (v == null ? "" : String(v));

export default function PedidosPagesMaquinaria() {
  const toast = useRef(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // modal de salidas (global)
  const [openSalidas, setOpenSalidas] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [search]);

  async function fetchPedidos() {
    try {
      setLoading(true);
      const resp = await apiFetch("/pedidos");
      const data = await resp.json();
      const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setPedidos(arr || []);
    } catch (e) {
      console.error(e);
      setPedidos([]);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo obtener la lista de pedidos.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPedidos();
  }, []);

  const filtered = useMemo(() => {
    if (!debounced) return pedidos;
    const termDigits = normalizeDigits(debounced);
    return (pedidos ?? []).filter((p) => {
      const nom = s(p?.cliente?.nombre).toLowerCase();
      const ape = s(p?.cliente?.apellido).toLowerCase();
      const full = `${nom} ${ape}`.trim();
      const tel = normalizeDigits(s(p?.cliente?.telefono));
      return full.includes(debounced) || (termDigits && tel.includes(termDigits));
    });
  }, [pedidos, debounced]);

  // Cambiar estado (sin abrir modal al pasar a Hecho)
  const onCambiarEstado = async (row, nuevoEstadoRaw) => {
    const current = toCanonEstado(row?.estado);
    const allowedNext = nextStatesOfForMaquinaria(current);
    const destino = toCanonStrict(nuevoEstadoRaw || "");

    if (!destino || !allowedNext.includes(destino)) {
      const msg = allowedNext.length
        ? `Solo puedes avanzar al siguiente estado: ${allowedNext.join(", ")}`
        : "Este pedido ya está en su último estado (Hecho).";
      toast.current?.show({ severity: "warn", summary: "No permitido", detail: msg, life: 4000 });
      return;
    }

    try {
      setLoading(true);
      const resp = await apiFetch(`/pedidos/${row._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: destino }),
      });

      let payload = null;
      try {
        const json = await resp.json();
        payload = json?.data ?? json ?? null;
      } catch {
        payload = null;
      }

      if (!resp.ok) {
        toast.current?.show({
          severity: "error",
          summary: "No se pudo actualizar el estado",
          detail: payload?.message || `HTTP ${resp.status || ""}`,
          life: 6000,
        });
        return;
      }

      if (payload?.deleted) {
        setPedidos((prev) => prev.filter((p) => p._id !== row._id));
        toast.current?.show({
          severity: "success",
          summary: "Pedido entregado",
          detail: "Se marcó como Entregado y fue eliminado.",
          life: 3500,
        });
        return;
      }

      setPedidos((prev) => prev.map((p) => (p._id === payload._id ? payload : p)));
      toast.current?.show({ severity: "success", summary: "Estado actualizado", life: 1800 });

      // ⛔️ Antes aquí se abría el modal de detalle si _salidaRegistrada === true.
      //     Lo removimos a pedido tuyo: no se muestra ningún modal al marcar "Hecho".
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Error de red",
        detail: e?.message || "No se pudo conectar",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Toast ref={toast} />

      {/* Barra superior */}
      <div className="bg-white rounded-lg shadow p-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <span className="text-base font-semibold">Buscar pedidos</span>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Nombre completo o teléfono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72"
            />
          </span>
          <Button
            label="Refrescar"
            icon="pi pi-refresh"
            onClick={fetchPedidos}
            outlined
            disabled={loading}
          />
          <Button
            label="Ver salidas"
            icon="pi pi-external-link"
            severity="help"
            onClick={() => setOpenSalidas(true)}
          />
        </div>
      </div>

      {/* Lista */}
      <PedidosListMaquinaria
        pedidos={filtered}
        loading={loading}
        onCambiarEstado={onCambiarEstado}
      />

      {/* Modal global de salidas */}
      <SalidasModalPedidos open={openSalidas} onClose={() => setOpenSalidas(false)} />
    </div>
  );
}
