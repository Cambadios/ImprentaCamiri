// src/pedidos/PedidoForm.jsx
import React, { useState } from 'react';
import { createPedido } from './PedidoService';  // Importa el servicio para interactuar con la API
import { useNavigate } from 'react-router-dom';

function PedidoForm() {
  const [cliente, setCliente] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [precioTotal, setPrecioTotal] = useState('');
  const navigate = useNavigate();  // Para redirigir después de agregar el pedido

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita la recarga de la página

    const nuevoPedido = { cliente, producto, cantidad, estado, precioTotal };
    console.log("Nuevo Pedido: ", nuevoPedido);  // Depuración, ver qué se envía al backend
    
    try {
      const response = await createPedido(nuevoPedido);
      console.log('Respuesta de la API:', response);  // Ver la respuesta que se recibe

      if (response) {
        console.log('Redirigiendo a la lista de pedidos');
        navigate('/pedidos');  // Redirige a la lista de pedidos después de agregar un pedido
      }
    } catch (error) {
      console.error("Error al crear el pedido", error);
    }
  };

  return (
    <div>
      <h2>Crear Pedido</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Cliente</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nombre del cliente"
            required
          />
        </div>
        
        <div>
          <label>Producto</label>
          <input
            type="text"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            placeholder="Nombre del producto"
            required
          />
        </div>
        
        <div>
          <label>Cantidad</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Cantidad"
            required
          />
        </div>
        
        <div>
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completado">Completado</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>
        
        <div>
          <label>Precio Total</label>
          <input
            type="number"
            value={precioTotal}
            onChange={(e) => setPrecioTotal(e.target.value)}
            placeholder="Precio total"
            required
          />
        </div>

        <button type="submit">Crear Pedido</button>
      </form>
    </div>
  );
}

export default PedidoForm;
