import React, { useState, useEffect } from "react";
import PedidoList from "./PedidosList";
import PedidoForm from "./PedidosForm";
import { apiFetch } from "../../../api/http";

const PedidoPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]); // Estado para almacenar los clientes
  const [productos, setProductos] = useState([]); // Estado para almacenar los productos
  const [isModalVisible, setModalVisible] = useState(false);
  const [pedidoEdit, setPedidoEdit] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener lista de pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const response = await apiFetch("/pedidos");
        const data = await response.json();
        console.log(data); // Verifica que data sea un array
        setPedidos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener pedidos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  // Obtener lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await apiFetch("/clientes");
        const data = await response.json();
        console.log("Clientes obtenidos: ", data.data);
        setClientes(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error al obtener clientes", error);
        setClientes([]);
      }
    };

    fetchClientes();
  }, []); // Solo se ejecuta una vez al cargar la página

  // Obtener lista de productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await apiFetch("/productos");
        const data = await response.json();
        console.log("Productos obtenidos: ", data); // Verifica que productos están llegando
        setProductos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener productos", error);
        setProductos([]);
      }
    };

    fetchProductos();
  }, []);

  const handleEdit = (pedido) => {
    setPedidoEdit(pedido);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
      try {
        await apiFetch(`/pedidos/${id}`, { method: "DELETE" });
        setPedidos((prevPedidos) =>
          prevPedidos.filter((pedido) => pedido._id !== id)
        );
      } catch (error) {
        console.error("Error al eliminar pedido", error);
      }
    }
  };

  const handleSave = async (pedido) => {
    try {
      setLoading(true);
      if (pedidoEdit) {
        const response = await apiFetch(`/pedidos/${pedidoEdit._id}`, {
          method: "PUT",
          body: JSON.stringify(pedido),
        });
        const updatedPedido = await response.json();
        setPedidos((prev) =>
          prev.map((p) => (p._id === updatedPedido._id ? updatedPedido : p))
        );
      } else {
        const response = await apiFetch("/pedidos", {
          method: "POST",
          body: JSON.stringify(pedido),
        });
        const newPedido = await response.json();
        setPedidos((prev) => [...prev, newPedido]);
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error al guardar pedido", error);
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
      <h2>Gestión de Pedidos</h2>
      <button
        className="p-button p-button-success"
        onClick={() => setModalVisible(true)}
        disabled={loading}
      >
        Nuevo Pedido
      </button>
      {loading ? (
        <div className="p-d-flex p-jc-center">
          <i className="pi pi-spin pi-spinner p-overlay-loading" />
        </div>
      ) : (
        <PedidoList
          pedidos={pedidos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      <PedidoForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        pedidoEdit={pedidoEdit}
        clientes={clientes}
        productos={productos} // Pasar productos a PedidoForm
      />
    </div>
  );
};

export default PedidoPage;
