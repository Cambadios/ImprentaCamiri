import React, { useState, useEffect } from 'react';
import PedidoList from './PedidosList';
import PedidoForm from './PedidosForm';
import { apiFetch } from '../../../api/http'; // Asegúrate de que apiFetch esté correctamente importado

const PedidoPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [pedidoEdit, setPedidoEdit] = useState(null);

  // Obtener lista de pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await apiFetch('/pedidos');
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error al obtener pedidos", error);
      }
    };
    fetchPedidos();
  }, []);

  const handleEdit = (pedido) => {
    setPedidoEdit(pedido);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/pedidos/${id}`, { method: 'DELETE' });
      setPedidos((prevPedidos) => prevPedidos.filter((pedido) => pedido._id !== id));
    } catch (error) {
      console.error("Error al eliminar pedido", error);
    }
  };

  const handleSave = async (pedido) => {
    try {
      if (pedidoEdit) {
        // Editar pedido
        const response = await apiFetch(`/pedidos/${pedidoEdit._id}`, {
          method: 'PUT',
          body: JSON.stringify(pedido),
        });
        const updatedPedido = await response.json();
        setPedidos((prev) =>
          prev.map((p) => (p._id === updatedPedido._id ? updatedPedido : p))
        );
      } else {
        // Crear pedido
        const response = await apiFetch('/pedidos', {
          method: 'POST',
          body: JSON.stringify(pedido),
        });
        const newPedido = await response.json();
        setPedidos((prev) => [...prev, newPedido]);
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error al guardar pedido", error);
    }
  };

  const handleModalHide = () => {
    setModalVisible(false);
    setPedidoEdit(null);
  };

  return (
    <div className="p-4">
      <h2>Gestión de Pedidos</h2>
      <button className="p-button p-button-success" onClick={() => setModalVisible(true)}>
        Nuevo Pedido
      </button>
      <PedidoList pedidos={pedidos} onEdit={handleEdit} onDelete={handleDelete} />
      <PedidoForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        pedidoEdit={pedidoEdit}
      />
    </div>
  );
};

export default PedidoPage;
