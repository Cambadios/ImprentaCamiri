import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPedido } from './PedidoService';

const getClientes = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/clientes');
    return await response.json();
  } catch (error) {
    console.error('Error al obtener clientes', error);
    return [];
  }
};

const getProductos = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/productos');
    return await response.json();
  } catch (error) {
    console.error('Error al obtener productos', error);
    return [];
  }
};

const PedidoForm = () => {
  const [cliente, setCliente] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [pagoCliente, setPagoCliente] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const dataClientes = await getClientes();
      setClientes(dataClientes);

      const dataProductos = await getProductos();
      setProductos(dataProductos);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pedido = {
      cliente,
      producto,
      cantidad,
      precioTotal,
      pagoCliente,
      estado,
      fechaEntrega,
    };

    try {
      await createPedido(pedido);
      alert('✅ Pedido agregado correctamente');
      navigate('/pedidos');
    } catch (error) {
      alert('❌ Error al agregar el pedido');
    }
  };

  const handleVolver = () => {
    navigate('/pedidos');
  };

  const handleProductoChange = (e) => {
    const productoSeleccionado = productos.find(p => p._id === e.target.value);
    setProducto(productoSeleccionado._id);
    setPrecioTotal(productoSeleccionado.precioUnitario * cantidad);
  };

  const calcularSaldo = () => {
    const total = parseFloat(precioTotal) || 0;
    const pago = parseFloat(pagoCliente) || 0;
    return total - pago;
  };

  const handleCantidadChange = (e) => {
    const nuevaCantidad = e.target.value;
    setCantidad(nuevaCantidad);
    const productoSeleccionado = productos.find(p => p._id === producto);
    setPrecioTotal(productoSeleccionado ? productoSeleccionado.precioUnitario * nuevaCantidad : 0);
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <button onClick={handleVolver} style={{ marginBottom: '20px' }}>
        ← Volver a Pedidos
      </button>
      <h2>Agregar Pedido</h2>
      <form onSubmit={handleSubmit}>
        <label>Cliente:</label>
        <input
          list="clientes"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          required
          placeholder="Selecciona un cliente"
          style={inputStyle}
        />
        <datalist id="clientes">
          {clientes.map((c) => (
            <option key={c._id} value={`${c.nombre} ${c.apellido}`} />
          ))}
        </datalist>

        <label>Producto:</label>
        <select
          value={producto}
          onChange={handleProductoChange}
          required
          style={inputStyle}
        >
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nombre} - Bs {p.precioUnitario}
            </option>
          ))}
        </select>

        <label>Cantidad:</label>
        <input
          type="number"
          value={cantidad}
          onChange={handleCantidadChange}
          required
          style={inputStyle}
          min="1"
        />

        <label>Precio Total (Bs):</label>
        <input
          type="text"
          value={`Bs ${precioTotal.toFixed(2)}`}
          readOnly
          style={inputStyle}
        />

        <label>Pago del Cliente (Bs):</label>
        <input
          type="number"
          value={pagoCliente}
          onChange={(e) => setPagoCliente(e.target.value)}
          required
          style={inputStyle}
        />

        <p><strong>Saldo Pendiente:</strong> Bs {calcularSaldo().toFixed(2)}</p>

        <label>Estado:</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          required
          style={inputStyle}
        >
          <option>Pendiente</option>
          <option>En proceso</option>
          <option>Entregado</option>
          <option>Cancelado</option>
        </select>

        <label>Fecha de Entrega Estimada:</label>
        <input
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={{ padding: '10px 20px' }}>Agregar Pedido</button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  marginBottom: '10px',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

export default PedidoForm;
