import React, { useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import PedidosListMaquinaria from "./PedidosListMaquinaria.jsx";
import { apiFetch } from "../../../api/http";

// ⬇️ estados canónicos
import EstadoDropdown from "../../../components/EstadoDropdwon.jsx";
import { toCanonEstado, toCanonStrict } from "../../../utils/estados";

const normalizeDigits = (v) => (v ? String(v).replace(/\D+/g, "") : "");
const s = (v) => (v == null ? "" : String(v));

export default function PedidosPagesMaquinaria() {
  const toast = useRef(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  // búsqueda
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // diálogo de estado
  const [dlgOpen, setDlgOpen] = useState(false);
  const [pedidoSel, setPedidoSel] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  // debounce
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

  const abrirCambioEstado = (pedido) => {
    setPedidoSel(pedido);
    // ⬇️ normaliza lo que venga del back para mostrarlo
    setNuevoEstado(toCanonEstado(pedido?.estado) || "");
    setDlgOpen(true);
  };

  const actualizarEstado = async () => {
    if (!pedidoSel?._id) return;
    try {
      setLoading(true);
      const estadoCanon = toCanonStrict(nuevoEstado || pedidoSel.estado);
      const resp = await apiFetch(`/pedidos/${pedidoSel._id}`, {
        method: "PATCH",
        body: JSON.stringify({ estado: estadoCanon }),
      });

      // parse flexible
      let updated = null;
      try {
        const json = await resp.json();
        updated = json?.data ?? json ?? null;
      } catch {
        updated = null;
      }

      if (!resp.ok || !updated) {
        toast.current?.show({
          severity: "error",
          summary: "No se pudo actualizar el estado",
          life: 5000,
        });
        return;
      }

      setPedidos((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      toast.current?.show({ severity: "success", summary: "Estado actualizado", life: 2000 });
      setDlgOpen(false);
      setPedidoSel(null);
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

      {/* Barra simple: buscar + refrescar */}
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
        </div>
      </div>

      {/* Lista */}
      <PedidosListMaquinaria
        pedidos={filtered}
        loading={loading}
        onCambiarEstado={abrirCambioEstado}
      />

      {/* Dialogo cambiar estado */}
      <Dialog
        visible={dlgOpen}
        header="Cambiar estado del pedido"
        style={{ width: "450px" }}
        modal
        onHide={() => {
          setDlgOpen(false);
          setPedidoSel(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-outlined p-button-secondary"
              onClick={() => {
                setDlgOpen(false);
                setPedidoSel(null);
              }}
            />
            <Button
              label="Actualizar"
              icon="pi pi-check"
              onClick={actualizarEstado}
              disabled={!nuevoEstado || loading}
            />
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600">Pedido</div>
            <div className="font-medium">
              {s(pedidoSel?.cliente?.nombre)} {s(pedidoSel?.cliente?.apellido)} —{" "}
              {s(pedidoSel?.producto?.nombre) || s(pedidoSel?.productoNombre) || "Producto"}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Estado</label>
            {/* ⬇️ selector canónico (solo 4 opciones) */}
            <EstadoDropdown
              value={nuevoEstado}
              onChange={setNuevoEstado}
              placeholder="Selecciona estado"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
