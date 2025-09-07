// src/components/PedidoPage.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import PedidoList from "./PedidosList";
import PedidoForm from "./PedidosForm";
import PedidoKPICards from "../../../components/dashboard/PedidoKPICards";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { apiFetch } from "../../../api/http";
import { downloadFile } from "../../../api/download";

const normalizeDigits = (v) => (v ? String(v).replace(/\D+/g, "") : "");
const safeStr = (v) => (v == null ? "" : String(v));

const PedidoPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [pedidoEdit, setPedidoEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useRef(null);

  // Filtros (solo los anteriores)
  const [estado] = useState("");
  const [q] = useState("");

  const qs = new URLSearchParams();
  if (estado) qs.set("estado", estado);
  if (q) qs.set("q", q);

  // ---- helpers ----
  const parseResponse = async (resp) => {
    let data = null;
    let text = "";
    try {
      text = await resp.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text ? { message: text } : null;
    }
    return { ok: resp.ok, status: resp.status, data };
  };

  // Pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const resp = await apiFetch("/pedidos");
        const json = await resp.json();
        setPedidos(
          Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json)
            ? json
            : []
        );
      } catch (e) {
        console.error("Error al obtener pedidos", e);
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  // Clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const resp = await apiFetch("/clientes");
        const json = await resp.json();
        const arr = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        setClientes(arr);
      } catch (e) {
        console.error("Error al obtener clientes", e);
        setClientes([]);
      }
    };
    fetchClientes();
  }, []);

  // Productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const resp = await apiFetch("/productos"); // o /inventario según tu back
        const json = await resp.json();
        setProductos(
          Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json)
            ? json
            : []
        );
      } catch (e) {
        console.error("Error al obtener productos", e);
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  // Filtro por nombre completo o teléfono
  const filteredPedidos = useMemo(() => {
    const term = safeStr(searchTerm).toLowerCase().trim();
    const termDigits = normalizeDigits(term);
    if (!term) return pedidos;
    return (pedidos ?? []).filter((p) => {
      const nom = safeStr(p?.cliente?.nombre).toLowerCase();
      const ape = safeStr(p?.cliente?.apellido).toLowerCase();
      const full = `${nom} ${ape}`.trim();
      const tel = normalizeDigits(safeStr(p?.cliente?.telefono));
      return full.includes(term) || (termDigits && tel.includes(termDigits));
    });
  }, [pedidos, searchTerm]);

  const handleEdit = (pedido) => {
    setPedidoEdit(pedido);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este pedido?")) return;
    try {
      await apiFetch(`/pedidos/${id}`, { method: "DELETE" });
      setPedidos((prev) => prev.filter((p) => p._id !== id));
      toast.current?.show({
        severity: "success",
        summary: "Pedido eliminado",
        life: 2200,
      });
    } catch (e) {
      console.error("Error al eliminar pedido", e);
      toast.current?.show({
        severity: "error",
        summary: "No se pudo eliminar",
        detail: e?.message || "Error desconocido",
        life: 5000,
      });
    }
  };

  const handleSave = async (payload) => {
    try {
      setLoading(true);

      if (pedidoEdit) {
        // EDITAR (estado / fechaEntrega)
        const resp = await apiFetch(`/pedidos/${pedidoEdit._id}`, {
          method: "PATCH",
          body: JSON.stringify({
            estado: payload.estado || pedidoEdit.estado,
            fechaEntrega: payload.fechaEntrega || pedidoEdit.fechaEntrega,
          }),
        });
        const { ok, data } = await parseResponse(resp);

        if (!ok) {
          toast.current?.show({
            severity: "error",
            summary: "No se pudo actualizar el pedido",
            detail: data?.message || "Error desconocido",
            life: 6000,
          });
          return;
        }

        setPedidos((prev) => prev.map((p) => (p._id === data._id ? data : p)));
        toast.current?.show({
          severity: "success",
          summary: "Pedido actualizado",
          life: 2500,
        });
        setModalVisible(false);
        setPedidoEdit(null);
      } else {
        // CREAR
        const resp = await apiFetch("/pedidos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const { ok, data } = await parseResponse(resp);

        if (!ok) {
          toast.current?.show({
            severity: "error",
            summary: "No se pudo crear el pedido",
            detail: data?.error || data?.message || "Error desconocido",
            life: 6000,
          });
          return;
        }

        setPedidos((prev) => [data, ...prev]);
        toast.current?.show({
          severity: "success",
          summary: "Pedido creado",
          life: 2500,
        });
        setModalVisible(false);
        setPedidoEdit(null);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error de red",
        detail: error?.message || "No se pudo conectar",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalHide = () => {
    setModalVisible(false);
    setPedidoEdit(null);
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-semibold text-gray-700">Gestión de Pedidos</h2>
        <div className="space-x-3">
          <Button
            label="Nuevo Pedido"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setModalVisible(true)}
            disabled={loading}
          />
          <Button
            label="Descargar PDF"
            icon="pi pi-download"
            onClick={() =>
              downloadFile(
                `/api/export/pedidos.pdf?${qs.toString()}`,
                "Listado de Pedidos.pdf"
              )
            }
          />
        </div>
      </div>

      {/* === Dashboard de KPIs === */}
      <PedidoKPICards />

      {/* Barra de búsqueda (nombre completo o teléfono) */}
      <div className="mb-4">
        <InputText
          type="text"
          placeholder="Buscar por nombre completo o teléfono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-10">
          <i className="pi pi-spin pi-spinner text-2xl" />
        </div>
      ) : (
        <PedidoList
          pedidos={filteredPedidos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form */}
      <PedidoForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        pedidoEdit={pedidoEdit}
        clientes={clientes}
        productos={productos}
      />
    </div>
  );
};

export default PedidoPage;
