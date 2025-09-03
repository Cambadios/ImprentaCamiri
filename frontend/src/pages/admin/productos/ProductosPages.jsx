import React, { useState, useEffect } from "react";
import ProductoList from "./ProductosList";
import ProductoForm from "./ProductosForm";
import { apiFetch } from "../../../api/http";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { downloadFile } from "../../../api/download";

const ProductoPage = () => {
  const [productos, setProductos] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Función para obtener todos los productos con datos completos
  const fetchProductos = async () => {
    try {
      const response = await apiFetch("/productos");
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  // Obtener lista de productos al montar el componente
  useEffect(() => {
    fetchProductos();
  }, []);

  // Obtener materiales disponibles
  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await apiFetch("/inventario");
        const data = await response.json();
        setMateriales(data);
      } catch (error) {
        console.error("Error al obtener materiales", error);
      }
    };
    fetchMateriales();
  }, []);

  // Función de búsqueda
  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.categoria &&
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (producto) => {
    setProductoEdit(producto);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/productos/${id}`, { method: "DELETE" });
      setProductos((prevProductos) =>
        prevProductos.filter((producto) => producto._id !== id)
      );
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  const handleSave = async (producto) => {
    try {
      if (productoEdit) {
        // Editar producto
        const response = await apiFetch(`/productos/${productoEdit._id}`, {
          method: "PUT",
          body: JSON.stringify(producto),
        });

        if (response.ok) {
          // Opción 1: Recargar todos los productos para asegurar datos completos
          await fetchProductos();

          // Opción 2 (alternativa): Si el backend devuelve el producto completo con populate
          // const updatedProducto = await response.json();
          // // Obtener el producto individual con datos completos si es necesario
          // const fullProductResponse = await apiFetch(/productos/${updatedProducto._id});
          // const fullProduct = await fullProductResponse.json();
          // setProductos((prev) =>
          //   prev.map((p) => (p._id === fullProduct._id ? fullProduct : p))
          // );
        }
      } else {
        // Crear producto
        const response = await apiFetch("/productos", {
          method: "POST",
          body: JSON.stringify(producto),
        });

        if (response.ok) {
          // Recargar todos los productos para obtener el nuevo con datos completos
          await fetchProductos();

          // Alternativa si prefieres no recargar todo:
          // const newProducto = await response.json();
          // // Obtener el producto con datos completos
          // const fullProductResponse = await apiFetch(/productos/${newProducto._id});
          // const fullProduct = await fullProductResponse.json();
          // setProductos((prev) => [...prev, fullProduct]);
        }
      }

      setModalVisible(false);
      setProductoEdit(null);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">
          Gestión de Productos
        </h2>
        <div className="space-x-3">
          <Button
            label="Nuevo Producto"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => {
              setProductoEdit(null); // Asegurar que no hay producto en edición
              setModalVisible(true);
            }}
          />
          <Button
            label="Descargar PDF"
            icon="pi pi-download"
            onClick={() =>
              downloadFile("/api/export/productos.pdf", "Listado de Productos.pdf")
            }
          />
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <InputText
          type="text"
          placeholder="Buscar por nombre o categoría"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <ProductoList
        productos={filteredProductos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
