import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";
import { Tag } from "primereact/tag";
import { apiFetch } from "../../../api/http";

const normalizePhone = (v) => (v ? String(v).replace(/\D+/g, "") : "");

// Sanitizador numérico para cantidad (entero ≥ 1)
const sanitizeCantidad = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.max(1, Math.floor(n));
};

// === FSM (igual que en backend) ===
const ORDER_STATES = ["Pendiente", "En Produccion", "Hecho", "Entregado"];
const TRANSITIONS = {
  Pendiente: ["En Produccion"],
  "En Produccion": ["Hecho"],
  Hecho: ["Entregado"],
  Entregado: [],
};
const nextStatesOf = (from) => TRANSITIONS[from] || [];

const PedidosForm = ({
  visible,
  onHide,
  onSave, // ← se espera que devuelva una Promise<boolean>
  pedidoEdit,
  clientes = [],
  productos = [],
}) => {
  const isEdit = !!pedidoEdit;

  const [telefono, setTelefono] = useState("");
  const [cliente, setCliente] = useState(null);
  const [clienteSuggestions, setClienteSuggestions] = useState([]);

  const [productoId, setProductoId] = useState(null);
  const productoObj = useMemo(
    () => productos.find((p) => p._id === productoId) || null,
    [productos, productoId]
  );

  const [cantidad, setCantidad] = useState(1);

  // En creación no mostramos dropdown de estado; en edición mostramos SOLO el siguiente permitido
  const [estadoSiguiente, setEstadoSiguiente] = useState(""); // solo para edición

  const [pagoCliente, setPagoCliente] = useState(0);
  const [fechaEntrega, setFechaEntrega] = useState(null);

  const [submitting, setSubmitting] = useState(false); // ← bloquea doble clic

  const precioUnitario = productoObj?.precioUnitario || 0;
  const precioTotal = Number(precioUnitario) * Number(cantidad || 0);
  const precioPorPagar = Math.max(precioTotal - Number(pagoCliente || 0), 0);

  useEffect(() => {
    if (pedidoEdit) {
      setTelefono(pedidoEdit?.cliente?.telefono || "");
      setCliente(pedidoEdit?.cliente || null);
      setProductoId(pedidoEdit?.producto?._id || null);
      setCantidad(sanitizeCantidad(pedidoEdit?.cantidad || 1));
      setPagoCliente(Number(pedidoEdit?.pagado || 0));
      setFechaEntrega(
        pedidoEdit?.fechaEntrega ? new Date(pedidoEdit.fechaEntrega) : null
      );
      setEstadoSiguiente(""); // limpio selección; usuario decidirá si avanza
    } else {
      setTelefono("");
      setCliente(null);
      setClienteSuggestions([]);
      setProductoId(null);
      setCantidad(1);
      setPagoCliente(0);
      setFechaEntrega(null);
      setEstadoSiguiente("");
    }
  }, [pedidoEdit]);

  const searchCliente = (e) => {
    const q = normalizePhone(e.query || "");
    const results = q
      ? clientes.filter((c) => normalizePhone(c.telefono).includes(q))
      : clientes.slice(0, 10);
    setClienteSuggestions(results);
  };

  const handleTelefonoChange = (e) => {
    const val = e.value;
    setTelefono(val);
    const norm = normalizePhone(val);
    const match = clientes.find((c) => normalizePhone(c.telefono) === norm);
    setCliente(match || null);
  };

  useEffect(() => {
    const norm = normalizePhone(telefono);
    if (!norm || cliente) return;

    const t = setTimeout(async () => {
      try {
        const resp = await apiFetch(`/clientes/buscar-por-telefono/${norm}`);
        if (resp.ok) {
          const found = await resp.json();
          if (normalizePhone(telefono) === norm) setCliente(found);
        }
      } catch {
        // silent
      }
    }, 300);

    return () => clearTimeout(t);
  }, [telefono, cliente]);

  const handleClienteSelect = (e) => {
    const sel = e.value;
    setCliente(sel);
    setTelefono(sel?.telefono || "");
  };

  const handleProductoChange = (e) => setProductoId(e.value);

  // Fuerza entero ≥1 aunque el usuario borre o escriba algo extraño
  const handleCantidadChange = (e) => {
    const sane = sanitizeCantidad(e?.value);
    setCantidad(sane);
  };

  const handlePagoClienteChange = (e) => {
    const n = Number(e.value);
    setPagoCliente(Number.isFinite(n) ? n : 0);
  };

  const allowedNextStates = useMemo(() => {
    const current = pedidoEdit?.estado || "Pendiente";
    return nextStatesOf(current);
  }, [pedidoEdit]);

  const handleSubmit = async () => {
    if (submitting) return; // evita doble clic

    // Validaciones base
    if (!isEdit && !cliente?._id) {
      alert("Por favor, selecciona un cliente (por teléfono).");
      return;
    }
    if (!isEdit && !productoId) {
      alert("Por favor, selecciona un producto.");
      return;
    }

    const qty = sanitizeCantidad(cantidad);
    if (!qty || qty <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    // Armado de payload
    if (isEdit) {
      // Solo enviamos el estado si el usuario decide avanzar (siguiente permitido)
      const payload = {
        fechaEntrega: fechaEntrega || null,
      };
      if (estadoSiguiente && allowedNextStates.includes(estadoSiguiente)) {
        payload.estado = estadoSiguiente;
      }

      // --- NUEVO: manejo de pagos en edición ---
      const pagadoActual = Number(pedidoEdit?.pagado || 0);
      const nuevoPagadoDeseado = Number(pagoCliente || 0);
      const delta = Math.round((nuevoPagadoDeseado - pagadoActual) * 100) / 100;

      if (delta < 0) {
        alert(
          "No se puede reducir el pago ya registrado. Si necesitas corregirlo, haz una nota interna o maneja un ajuste administrativo."
        );
        return;
      }
      if (delta > 0) {
        // El parent hará la llamada a /pedidos/:id/pago
        payload._pagoDelta = delta;
        payload._pagoMetodo = "efectivo"; // ajusta si ofreces más métodos
        payload._pagoNota = "Ajuste desde edición del pedido";
      }

      try {
        setSubmitting(true);
        const ok = await onSave(payload); console.log(ok)
        setSubmitting(false);
        return;
      } catch (e) {
        console.log(e);
        setSubmitting(false);
        return;
      }
    }

    // CREACIÓN: Estado automático = 'Pendiente' (el backend lo pone por defecto)
    const payloadCreate = {
      cliente: cliente._id,
      producto: productoId,
      cantidad: qty,
      pagoInicial: Number(pagoCliente || 0),
      fechaEntrega: fechaEntrega || null,
      // NO mandamos estado: el back asigna 'Pendiente'
    };

    try {
      setSubmitting(true);
      const ok = await onSave(payloadCreate);
      if (!ok) setSubmitting(false);
    } catch (e) {
      console.log(e);
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar Pedido" : "Nuevo Pedido"}
      visible={visible}
      onHide={submitting ? () => {} : onHide}
      style={{ width: "36rem", maxWidth: "95vw" }}
      className="rounded-2xl"
    >
      <div className={`p-fluid space-y-4 ${submitting ? "opacity-90" : ""}`}>
        {/* Teléfono */}
        <div className="p-field">
          <label htmlFor="telefono" className="block text-gray-700">
            Teléfono del Cliente
          </label>
          <AutoComplete
            inputId="telefono"
            value={telefono}
            suggestions={clienteSuggestions}
            completeMethod={searchCliente}
            field="telefono"
            onChange={handleTelefonoChange}
            onSelect={handleClienteSelect}
            placeholder="Ingresa el teléfono"
            dropdown
            className="w-full"
            inputClassName="w-full p-inputtext-sm border-2 border-gray-300 rounded-md"
            panelClassName="rounded-md"
            disabled={submitting}
          />
        </div>

        {/* Nombre del cliente */}
        <div className="p-field">
          <label htmlFor="nombreCliente" className="block text-gray-700">
            Nombre del Cliente
          </label>
          <InputText
            id="nombreCliente"
            value={
              cliente
                ? `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim()
                : ""
            }
            disabled
            placeholder={cliente ? "" : "—"}
            className="w-full p-inputtext-sm border-2 border-gray-300 rounded-md"
          />
        </div>

        {/* Producto (solo creación) */}
        {!isEdit && (
          <div className="p-field">
            <label htmlFor="producto" className="block text-gray-700">
              Producto
            </label>
            <Dropdown
              id="producto"
              value={productoId}
              options={productos}
              onChange={handleProductoChange}
              optionLabel="nombre"
              optionValue="_id"
              placeholder="Selecciona un Producto"
              showClear
              className="w-full"
              panelClassName="rounded-md"
              disabled={submitting}
            />
          </div>
        )}

        {/* Cantidad (entera ≥1) */}
        <div className="p-field">
          <label htmlFor="cantidad" className="block text-gray-700">
            Cantidad
          </label>
          <InputNumber
            id="cantidad"
            value={cantidad}
            onValueChange={handleCantidadChange}
            min={1}
            useGrouping={false}
            className="w-full"
            inputClassName="w-full p-inputtext-sm border-2 border-gray-300 rounded-md"
            disabled={submitting}
          />
        </div>

        {/* Estado */}
        {isEdit ? (
          <div className="p-field">
            <label htmlFor="estado" className="block text-gray-700">
              Estado actual:{" "}
              <Tag
                value={pedidoEdit?.estado || "Pendiente"}
                rounded
                className="ml-1"
              />
            </label>
            <Dropdown
              id="estado"
              value={estadoSiguiente}
              options={allowedNextStates.map((e) => ({ label: e, value: e }))}
              onChange={(e) => setEstadoSiguiente(e.value)}
              placeholder={
                allowedNextStates.length
                  ? "Selecciona el siguiente estado (opcional)"
                  : "No hay siguiente estado"
              }
              className="w-full"
              panelClassName="rounded-md"
              disabled={submitting || !allowedNextStates.length}
              showClear
            />
          </div>
        ) : (
          <div className="p-field">
            <label className="block text-gray-700">Estado</label>
            <Tag
              value="Pendiente"
              severity="warning"
              rounded
              className="px-3 py-1"
            />
          </div>
        )}

        {/* Precios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-field">
            <label className="block text-gray-700">Precio Unitario</label>
            <InputNumber
              value={precioUnitario}
              disabled
              className="w-full"
              inputClassName="w-full p-inputtext-sm border-2 border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div className="p-field">
            <label className="block text-gray-700">Precio Total</label>
            <InputNumber
              value={precioTotal}
              disabled
              className="w-full"
              inputClassName="w-full p-inputtext-sm border-2 border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div className="p-field">
            <label htmlFor="pagoCliente" className="block text-gray-700">
              Pago del Cliente
            </label>
            <InputNumber
              id="pagoCliente"
              value={pagoCliente}
              onValueChange={handlePagoClienteChange}
              min={0}
              className="w-full"
              inputClassName="w-full p-inputtext-sm border-2 border-gray-300 rounded-md"
              disabled={submitting}
            />
          </div>

          <div className="p-field">
            <label className="block text-gray-700">Precio por Pagar</label>
            <InputNumber
              value={precioPorPagar}
              disabled
              className="w-full"
              inputClassName="w-full p-inputtext-sm border-2 border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="p-field">
          <label htmlFor="fechaEntrega" className="block text-gray-700">
            Fecha de Entrega
          </label>
          <Calendar
            id="fechaEntrega"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.value)}
            showIcon
            className="w-full"
            inputClassName="w-full p-inputtext-sm border-2 border-gray-300 rounded-md"
            panelClassName="rounded-md"
            disabled={submitting}
          />
        </div>

        {/* Acciones */}
        <div className="flex justify-between space-x-2 pt-2">
          <Button
            label="Cancelar"
            onClick={onHide}
            className="p-button-outlined p-button-secondary"
            disabled={submitting}
          />
          <Button
            label={submitting ? "Guardando..." : "Guardar"}
            onClick={handleSubmit}
            disabled={submitting}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default PedidosForm;
