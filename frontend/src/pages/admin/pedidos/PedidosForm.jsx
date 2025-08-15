import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

const PedidoForm = ({ visible, onHide, onSave, pedidoEdit }) => {
  const [cliente, setCliente] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [estado, setEstado] = useState('');
  const [precioTotal, setPrecioTotal] = useState(0);
  const [pagoCliente, setPagoCliente] = useState(0);
  const [fechaEntrega, setFechaEntrega] = useState(null);

  useEffect(() => {
    if (pedidoEdit) {
      setCliente(pedidoEdit.cliente);
      setProducto(pedidoEdit.producto);
      setCantidad(pedidoEdit.cantidad);
      setEstado(pedidoEdit.estado);
      setPrecioTotal(pedidoEdit.precioTotal);
      setPagoCliente(pedidoEdit.pagoCliente);
      setFechaEntrega(new Date(pedidoEdit.fechaEntrega));
    } else {
      setCliente('');
      setProducto('');
      setCantidad(0);
      setEstado('');
      setPrecioTotal(0);
      setPagoCliente(0);
      setFechaEntrega(null);
    }
  }, [pedidoEdit]);

  const handleSubmit = () => {
    const pedido = { cliente, producto, cantidad, estado, precioTotal, pagoCliente, fechaEntrega };
    onSave(pedido);
  };

  return (
    <Dialog header={pedidoEdit ? 'Editar Pedido' : 'Nuevo Pedido'} visible={visible} onHide={onHide}>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="cliente">Cliente</label>
          <InputText id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="producto">Producto</label>
          <InputText id="producto" value={producto} onChange={(e) => setProducto(e.target.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="cantidad">Cantidad</label>
          <InputNumber id="cantidad" value={cantidad} onValueChange={(e) => setCantidad(e.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="estado">Estado</label>
          <InputText id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="precioTotal">Precio Total</label>
          <InputNumber id="precioTotal" value={precioTotal} onValueChange={(e) => setPrecioTotal(e.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="pagoCliente">Pago del Cliente</label>
          <InputNumber id="pagoCliente" value={pagoCliente} onValueChange={(e) => setPagoCliente(e.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="fechaEntrega">Fecha de Entrega</label>
          <Calendar id="fechaEntrega" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.value)} />
        </div>
        <div className="p-d-flex p-jc-between">
          <Button label="Guardar" onClick={handleSubmit} className="p-button-success" />
          <Button label="Cancelar" onClick={onHide} className="p-button-secondary" />
        </div>
      </div>
    </Dialog>
  );
};

export default PedidoForm;
