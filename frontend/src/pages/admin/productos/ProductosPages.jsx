import React, { useState, useEffect } from 'react';
import ProductoList from './ProductosList';
import ProductoForm from './ProductosForm';
import { apiFetch } from '../../../api/http';  // Asegúrate de que apiFetch esté correctamente importado

const ProductoPage = () => {
  const [productos, setProductos] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [materiales, setMateriales] = useState([]);

  // Obtener lista de productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await apiFetch('/productos'); // Asegúrate de que esta ruta es correcta
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error al obtener productos", error);
      }
    };
    fetchProductos();
  }, []);

  // Obtener materiales disponibles
  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await apiFetch('/inventario'); // Asegúrate de que esta ruta es correcta
        const data = await response.json();
        setMateriales(data);
      } catch (error) {
        console.error("Error al obtener materiales", error);
      }
    };
    fetchMateriales();
  }, []);

  const handleEdit = (producto) => {
    setProductoEdit(producto);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/productos/${id}`, { method: 'DELETE' });
      setProductos((prevProductos) => prevProductos.filter((producto) => producto._id !== id));
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  const handleSave = async (producto) => {
    try {
      if (productoEdit) {
        // Editar producto
        const response = await apiFetch(`/productos/${productoEdit._id}`, {
          method: 'PUT',
          body: JSON.stringify(producto),
        });
        const updatedProducto = await response.json();
        setProductos((prev) =>
          prev.map((p) => (p._id === updatedProducto._id ? updatedProducto : p))
        );
      } else {
        // Crear producto
        const response = await apiFetch('/productos', {
          method: 'POST',
          body: JSON.stringify(producto),
        });
        const newProducto = await response.json();
        setProductos((prev) => [...prev, newProducto]);
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error al guardar producto", error);
    }
  };

  const handleModalHide = () => {
    setModalVisible(false);
    setProductoEdit(null);
  };

  return (
    <div className="p-4">
      <h2>Gestión de Productos</h2>
      <button className="p-button p-button-success" onClick={() => setModalVisible(true)}>
        Nuevo Producto
      </button>
      <ProductoList productos={productos} onEdit={handleEdit} onDelete={handleDelete} />
      <ProductoForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        productoEdit={productoEdit}
        materiales={materiales}
      />
    </div>
  );
};

export default ProductoPage;
