import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";
import { apiFetch } from "../../../api/http";

const normalizePhone = (v) => (v ? String(v).replace(/\D+/g, "") : "");

// Sanitizador numérico para cantidad (entero ≥ 1)
const sanitizeCantidad = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.max(1, Math.floor(n));
};

const PedidosForm = ({
  visible,
  onHide,
  onSave,          // ← se espera que devuelva una Promise<boolean>
  pedidoEdit,
  clientes = [],
  productos = [],
}) => {
  const [telefono, setTelefono] = useState("");
  const [cliente, setCliente] = useState(null);
  const [clienteSuggestions, setClienteSuggestions] = useState([]);

  const [productoId, setProductoId] = useState(null);
  const productoObj = useMemo(
    () => productos.find((p) => p._id === productoId) || null,
    [productos, productoId]
  );

  const [cantidad, setCantidad] = useState(1);
  const [estado, setEstado] = useState("");
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
      setEstado(pedidoEdit?.estado || "");
      setPagoCliente(Number(pedidoEdit?.pagado || 0));
      setFechaEntrega(
        pedidoEdit?.fechaEntrega ? new Date(pedidoEdit.fechaEntrega) : null
      );
    } else {
      setTelefono("");
      setCliente(null);
      setClienteSuggestions([]);
      setProductoId(null);
      setCantidad(1);
      setEstado("");
      setPagoCliente(0);
      setFechaEntrega(null);
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

  const handleEstadoChange = (e) => setEstado(e.value);

  const handleSubmit = async () => {
    if (submitting) return; // evita doble clic
    if (!cliente?._id) {
      alert("Por favor, selecciona un cliente (por teléfono).");
      return;
    }
    if (!productoId) {
      alert("Por favor, selecciona un producto.");
      return;
    }

    const qty = sanitizeCantidad(cantidad);
    if (!qty || qty <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    const payload = {
      cliente: cliente._id,
      producto: productoId,
      cantidad: qty, // ← ya sanitizada (entero ≥1)
      pagoInicial: Number(pagoCliente || 0),
      fechaEntrega: fechaEntrega || null,
      estado, // ← se usa en PATCH cuando edites
    };

    try {
      setSubmitting(true);
      // onSave devuelve Promise<boolean>; si es true, el contenedor cerrará el modal
      const ok = await onSave(payload);
      if (!ok) {
        // Si falló, mantenemos el modal abierto para corregir
        setSubmitting(false);
      }
      // Si ok === true, el modal ya se cierra desde el contenedor y el estado se resetea allí
    } catch (e) {console.log(e)
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      header={pedidoEdit ? "Editar Pedido" : "Nuevo Pedido"}
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
              cliente ? `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() : ""
            }
            disabled
            placeholder={cliente ? "" : "—"}
            className="w-full p-inputtext-sm border-2 border-gray-300 rounded-md"
          />
        </div>

        {/* Producto */}
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
        <div className="p-field">
          <label htmlFor="estado" className="block text-gray-700">
            Estado
          </label>
          <Dropdown
            id="estado"
            value={estado}
            options={["Pendiente", "En proceso", "Entregado", "Cancelado"]}
            onChange={handleEstadoChange}
            placeholder="Selecciona un estado"
            className="w-full"
            panelClassName="rounded-md"
            disabled={submitting}
          />
        </div>

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
