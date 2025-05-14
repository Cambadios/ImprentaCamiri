// src/pedidos/PedidoList.jsx
import React, { useState, useEffect } from 'react';
import { getPedidos, deletePedido } from './PedidoService';  // Importa las funciones de servicio
import { useNavigate } from 'react-router-dom';

function PedidoList() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();

  // Obtener los pedidos cuando el componente se monta
  useEffect(() => {
    const fetchPedidos = async () => {
      const data = await getPedidos();
      setPedidos(data);
    };
    fetchPedidos();
  }, []);

  // Eliminar un pedido
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este pedido?');
    if (confirmDelete) {
      await deletePedido(id);  // Llamamos al servicio para eliminar el pedido
      setPedidos(pedidos.filter(pedido => pedido._id !== id));  // Actualizamos la lista de pedidos
    }
  };

  // Redirigir al formulario de crear pedido
  const handleAddPedido = () => {
    navigate('/pedidos/agregar');
  };

  return (
    <div>
      <h2>Lista de Pedidos</h2>
      <button onClick={handleAddPedido}>Agregar Pedido</button>

      <ul>
        {pedidos.map(pedido => (
          <li key={pedido._id}>
            <div>
              <p><strong>Cliente:</strong> {pedido.cliente}</p>
              <p><strong>Producto:</strong> {pedido.producto}</p>
              <p><strong>Cantidad:</strong> {pedido.cantidad}</p>
              <p><strong>Estado:</strong> {pedido.estado}</p>
              <p><strong>Precio Total:</strong> Bs{pedido.precioTotal}</p>
              <button onClick={() => handleDelete(pedido._id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PedidoList;
