import React, { useState, useEffect } from 'react';
import { getPedidos, deletePedido } from './PedidoService';
import VolverPrincipal from '../comunes/VolverPrincipal';
import { Link } from 'react-router-dom';

function PedidoList() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const data = await getPedidos();
      setPedidos(data);
    };
    fetchPedidos();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este pedido?');
    if (confirmDelete) {
      await deletePedido(id);
      setPedidos(pedidos.filter(pedido => pedido._id !== id));
    }
  };

  return (
    <div>
      <VolverPrincipal />

      <h2>Lista de Pedidos</h2>

      <Link to="/pedidos/agregar">
        <button>Agregar Pedido</button>
      </Link>

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
