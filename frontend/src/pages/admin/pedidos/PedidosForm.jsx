import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown"; // Para el producto
import { AutoComplete } from "primereact/autocomplete"; // Para buscar el cliente por teléfono

const PedidoForm = ({
  visible,
  onHide,
  onSave,
  pedidoEdit,
  clientes,
  productos,
}) => {
  const [telefono, setTelefono] = useState("");
  const [cliente, setCliente] = useState(null);
  const [producto, setProducto] = useState(null); // Cambio a null para mejor control
  const [cantidad, setCantidad] = useState(0);
  const [estado, setEstado] = useState("");
  const [precioTotal, setPrecioTotal] = useState(0);
  const [pagoCliente, setPagoCliente] = useState(0);
  const [precioPorPagar, setPrecioPorPagar] = useState(0); // Nuevo estado para precio por pagar
  const [fechaEntrega, setFechaEntrega] = useState(null);

  // Función de búsqueda de clientes basada en el teléfono
  const searchCliente = (e) => {
    const query = e.query.toLowerCase();
    // Filtramos los clientes por teléfono
    const filteredClientes = clientes.filter((cli) =>
      cli.telefono.includes(query)
    );
    return filteredClientes;
  };

  // Maneja el cambio de cliente al seleccionar uno
  const handleClienteChange = (e) => {
    setCliente(e.value); // Actualiza el cliente con el objeto seleccionado
    setTelefono(e.value ? e.value.telefono : ""); // Actualiza el teléfono del cliente
  };

  // Para editar pedido, llenar los campos automáticamente
  useEffect(() => {
    if (pedidoEdit) {
      setTelefono(pedidoEdit.cliente.telefono);
      setCliente(pedidoEdit.cliente);
      setProducto(pedidoEdit.producto);
      setCantidad(pedidoEdit.cantidad);
      setEstado(pedidoEdit.estado);
      setPrecioTotal(pedidoEdit.precioTotal);
      setPagoCliente(pedidoEdit.pagoCliente);
      setPrecioPorPagar(pedidoEdit.precioTotal - pedidoEdit.pagoCliente); // Calculamos el precio por pagar
      setFechaEntrega(new Date(pedidoEdit.fechaEntrega));
    } else {
      setTelefono("");
      setCliente(null);
      setProducto(null); // Reiniciar producto
      setCantidad(0);
      setEstado("");
      setPrecioTotal(0);
      setPagoCliente(0);
      setPrecioPorPagar(0);
      setFechaEntrega(null);
    }
  }, [pedidoEdit]);

  // Maneja el cambio de producto
  const handleProductoChange = (e) => {
    setProducto(e.value);
    if (e.value && e.value.precioUnitario) {
      setPrecioTotal(e.value.precioUnitario * cantidad);
      setPrecioPorPagar(e.value.precioUnitario * cantidad - pagoCliente); // Calculamos el precio por pagar
    } else {
      setPrecioTotal(0); // Si el producto no tiene precio, establece a 0
      setPrecioPorPagar(0);
    }
  };

  // Cambiar el estado a un único seleccionado
  const handleEstadoChange = (e) => {
    setEstado(e.value); // Actualiza el estado con el valor seleccionado del Dropdown
  };

  // Maneja el cambio en cantidad
  const handleCantidadChange = (e) => {
    setCantidad(e.value);
    if (producto && producto.precioUnitario) {
      setPrecioTotal(producto.precioUnitario * e.value);
      setPrecioPorPagar(producto.precioUnitario * e.value - pagoCliente); // Calculamos el precio por pagar
    }
  };

  // Maneja el pago del cliente
  const handlePagoClienteChange = (e) => {
    setPagoCliente(e.value);
    if (producto && producto.precioUnitario) {
      setPrecioPorPagar(precioTotal - e.value); // Calculamos el precio por pagar
    }
  };

  const handleSubmit = () => {
    // Validación de los campos
    if (!cliente) {
      alert("Por favor, ingrese un teléfono válido para un cliente.");
      return;
    }
    if (!producto) {
      alert("Por favor, seleccione un producto.");
      return;
    }

    const pedido = {
      cliente,
      producto,
      cantidad,
      estado,
      precioTotal,
      pagoCliente,
      precioPorPagar, // Incluimos el precio por pagar
      fechaEntrega,
    };
    onSave(pedido);
  };

  return (
    <Dialog
      header={pedidoEdit ? "Editar Pedido" : "Nuevo Pedido"}
      visible={visible}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="telefono">Teléfono del Cliente</label>
          <AutoComplete
            id="telefono"
            value={telefono}
            suggestions={clientes}
            completeMethod={searchCliente}
            field="telefono"
            onChange={(e) => setTelefono(e.value)}
            placeholder="Ingresa el teléfono"
            dropdown
            onSelect={handleClienteChange} // Al seleccionar un cliente
          />
        </div>
        {cliente && (
          <div className="p-field">
            <label htmlFor="cliente">Cliente</label>
            <InputText
              id="cliente"
              value={`${cliente.nombre} ${cliente.apellido}`} // Muestra el nombre completo
              disabled
            />
          </div>
        )}
        <div className="p-field">
          <label htmlFor="producto">Producto</label>
          <Dropdown
            id="producto"
            value={producto}
            options={productos}
            onChange={handleProductoChange}
            optionLabel="nombre"
            optionValue="_id" // Usar el _id como valor único
            placeholder="Selecciona un Producto"
            itemTemplate={(option) => (
              <div>
                {option.nombre} - ${option.precioUnitario}
              </div>
            )}
          />
        </div>
        <div className="p-field">
          <label htmlFor="cantidad">Cantidad</label>
          <InputNumber
            id="cantidad"
            value={cantidad}
            onValueChange={handleCantidadChange}
          />
        </div>
        <div className="p-field">
          <label htmlFor="estado">Estado</label>
          <Dropdown
            id="estado"
            value={estado}
            options={["Pendiente", "En proceso", "Entregado", "Cancelado"]}
            onChange={handleEstadoChange}
            placeholder="Selecciona un estado"
          />
        </div>
        <div className="p-field">
          <label htmlFor="precioTotal">Precio Total</label>
          <InputNumber
            id="precioTotal"
            value={precioTotal}
            onValueChange={(e) => setPrecioTotal(e.value)}
            disabled
          />
        </div>
        <div className="p-field">
          <label htmlFor="pagoCliente">Pago del Cliente</label>
          <InputNumber
            id="pagoCliente"
            value={pagoCliente}
            onValueChange={handlePagoClienteChange}
          />
        </div>
        <div className="p-field">
          <label htmlFor="precioPorPagar">Precio por Pagar</label>
          <InputNumber
            id="precioPorPagar"
            value={precioPorPagar}
            disabled
          />
        </div>
        <div className="p-field">
          <label htmlFor="fechaEntrega">Fecha de Entrega</label>
          <Calendar
            id="fechaEntrega"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.value)}
          />
        </div>
        <div className="p-d-flex p-jc-between">
          <Button
            label="Guardar"
            onClick={handleSubmit}
            className="p-button-success"
          />
          <Button
            label="Cancelar"
            onClick={onHide}
            className="p-button-secondary"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default PedidoForm;
