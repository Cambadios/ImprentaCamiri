import React, { useState, useEffect, useRef, useMemo } from "react";
import PedidoList from "./PedidosList";
import PedidoForm from "./PedidosForm";
import PedidoKPICards from "../../../components/dashboard/PedidoKPICards";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { apiFetch } from "../../../api/http";
import { downloadFile } from "../../../api/download";

const ESTADOS = ["Pendiente", "En Produccion", "Hecho", "Entregado"];

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
  const [estadoFilter, setEstadoFilter] = useState(""); // "" = Todos
  const toast = useRef(null);

  // Querystring para exportar respetando filtros reales
  const qs = new URLSearchParams();
  if (estadoFilter) qs.set("estado", estadoFilter);
  if (searchTerm) qs.set("q", searchTerm);

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
    return { ok: resp?.ok, status: resp?.status, data };
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

  // Filtro por nombre completo, teléfono y estado
  const filteredPedidos = useMemo(() => {
    const term = safeStr(searchTerm).toLowerCase().trim();
    const termDigits = normalizeDigits(term);

    return (pedidos ?? []).filter((p) => {
      const nom = safeStr(p?.cliente?.nombre).toLowerCase();
      const ape = safeStr(p?.cliente?.apellido).toLowerCase();
      const full = `${nom} ${ape}`.trim();
      const tel = normalizeDigits(safeStr(p?.cliente?.telefono));
      const matchText =
        !term ||
        full.includes(term) ||
        (termDigits && tel.includes(termDigits));

      const matchEstado =
        !estadoFilter ||
        safeStr(p?.estado).toLowerCase() ===
          safeStr(estadoFilter).toLowerCase();

      return matchText && matchEstado;
    });
  }, [pedidos, searchTerm, estadoFilter]);

  const handleEdit = (pedido) => {
    setPedidoEdit(pedido);
    setModalVisible(true);
  };

  // Eliminación: maneja 204 de backend y sólo refresca la lista local al éxito
  const handleDelete = async (id) => {
    try {
      const resp = await apiFetch(`/pedidos/${id}`, { method: "DELETE" });
      if (!resp || !resp.ok) {
        const { status } = resp || {};
        throw new Error(status ? `HTTP ${status}` : "Sin respuesta");
      }
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

  // onSave se usa para CREAR o EDITAR (el Form espera una Promise)
  const handleSave = async (payload) => {
    try {
      setLoading(true);

      if (pedidoEdit) {
        // EDITAR: enviar solo lo que cambió (estado si cambia y/o fechaEntrega)
        const body = {};
        if (payload.fechaEntrega !== undefined)
          body.fechaEntrega = payload.fechaEntrega;
        if (payload.estado && payload.estado !== safeStr(pedidoEdit.estado)) {
          body.estado = payload.estado;
        }

        // --- NUEVO: si hay delta de pago, primero registrar pago ---
        if (payload._pagoDelta && payload._pagoDelta > 0) {
          try {
            const respPago = await apiFetch(`/pedidos/${pedidoEdit._id}/pagos`, {
              method: "POST",
              body: JSON.stringify({
                monto: payload._pagoDelta,
                metodo: payload._pagoMetodo || "efectivo",
                nota: payload._pagoNota || "Pago registrado desde edición",
              }),
            });
            const { ok: okPago, data: dataPago } = await parseResponse(
              respPago
            );
            if (!okPago) {
              toast.current?.show({
                severity: "error",
                summary: "No se pudo registrar el pago",
                detail: dataPago?.message || "Error desconocido",
                life: 6000,
              });
              return false;
            }

            // Actualiza en memoria el pedido con el resultado del pago
            if (dataPago?._id) {
              setPedidos((prev) =>
                prev.map((p) =>
                  p._id === dataPago._id
                    ? {
                        ...p,
                        ...dataPago,
                        cliente: {
                          ...(p.cliente || {}),
                          ...(dataPago.cliente || {}),
                        },
                      }
                    : p
                )
              );
            }
          } catch (e) {
            toast.current?.show({
              severity: "error",
              summary: "Error registrando el pago",
              detail: e?.message || "Error de red",
              life: 6000,
            });
            return false;
          }
        }

        // Si no hay cambios de estado/fecha, ya terminamos
        if (!Object.keys(body).length) {
          toast.current?.show({
            severity: "success",
            summary: "Pago registrado",
            life: 2500,
          });
          setModalVisible(false);
          setPedidoEdit(null);
          return true;
        }

        // PATCH de actualización (estado/fecha)
        const resp = await apiFetch(`/pedidos/${pedidoEdit._id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        const { ok, data } = await parseResponse(resp);

        if (!ok) {
          toast.current?.show({
            severity: "error",
            summary: "No se pudo actualizar el pedido",
            detail: data?.message || "Error desconocido",
            life: 6000,
          });
          return false;
        }

        // Si el backend eliminó por pasar a Entregado
        if (data?.deleted) {
          setPedidos((prev) => prev.filter((p) => p._id !== pedidoEdit._id));
          toast.current?.show({
            severity: "success",
            summary: "Pedido entregado",
            detail: "Se marcó como Entregado y fue eliminado.",
            life: 3500,
          });
          setModalVisible(false);
          setPedidoEdit(null);
          return true;
        }

        // Actualización normal
        setPedidos((prev) =>
          prev.map((p) =>
            p._id === data._id
              ? {
                  ...p,
                  ...data,
                  cliente: { ...(p.cliente || {}), ...(data.cliente || {}) },
                }
              : p
          )
        );

        toast.current?.show({
          severity: "success",
          summary: "Pedido actualizado",
          life: 2500,
        });
        setModalVisible(false);
        setPedidoEdit(null);
        return true;
      } else {
        // CREAR
        const resp = await apiFetch("/pedidos", {
          method: "POST",
          body: JSON.stringify({ ...payload, debug: true }),
        });
        const { ok, data } = await parseResponse(resp);

        if (!ok) {
          toast.current?.show({
            severity: "error",
            summary: "No se pudo crear el pedido",
            detail: data?.error || data?.message || "Error desconocido",
            life: 6000,
          });
          return false;
        }

        // Mostrar/registrar el detalle de descuento si viene del back
        if (
          Array.isArray(data?._debugDescuento) &&
          data._debugDescuento.length
        ) {
          console.table(data._debugDescuento);
        }

        setPedidos((prev) => [data, ...prev]);
        toast.current?.show({
          severity: "success",
          summary: "Pedido creado",
          life: 2500,
        });
        setModalVisible(false);
        setPedidoEdit(null);
        return true;
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error de red",
        detail: error?.message || "No se pudo conectar",
        life: 5000,
      });
      return false;
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
        <h2 className="text-3xl font-semibold text-gray-700">
          Gestión de Pedidos
        </h2>
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

      {/* Barra de búsqueda + filtro de estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <InputText
          type="text"
          placeholder="Buscar por nombre completo o teléfono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Dropdown
          value={estadoFilter}
          options={ESTADOS.map((e) => ({ label: e, value: e }))}
          onChange={(e) => setEstadoFilter(e.value || "")}
          placeholder="Estado"
          className="w-full"
          panelClassName="rounded-md"
        />
        <Button
          type="button"
          label="MOSTRAR TODOS"
          icon="pi pi-filter-slash"
          className="p-button-secondary"
          onClick={() => {
            setSearchTerm("");
            setEstadoFilter("");
          }}
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
