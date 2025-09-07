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

  const [categoriasProd, setCategoriasProd] = useState([]); // solo tipo=producto
  const [materiales, setMateriales] = useState([]);         // inventario tipo=insumo

  const [searchTerm, setSearchTerm] = useState("");

  const fetchProductos = async () => {
    try {
      const response = await apiFetch("/productos");
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Carga categorías (producto) y materiales (insumo)
  useEffect(() => {
    (async () => {
      try {
        const respCat = await apiFetch("/categorias?tipo=producto");
        const cats = await respCat.json();
        setCategoriasProd(
          (Array.isArray(cats) ? cats : []).map(c => ({
            label: `${c.prefijo || ""} ${c.nombre}`.trim(),
            value: c._id,
            raw: c
          }))
        );
      } catch (e) {
        console.error("Error cargando categorías producto", e);
        setCategoriasProd([]);
      }

      try {
        const respMat = await apiFetch("/inventario");
        const mats = await respMat.json();
        // dejar solo insumos (por si el endpoint devuelve todo)
        const options = (Array.isArray(mats) ? mats : [])
          .filter(m => m?.categoria?.tipo === "insumo")
          .map(m => ({
            _id: m._id,
            nombre: m.nombre,
            unidadDeMedida: m.unidadDeMedida, // importante: coincide con backend de inventario
          }));
        setMateriales(options);
      } catch (e) {
        console.error("Error cargando materiales (insumos)", e);
        setMateriales([]);
      }
    })();
  }, []);

  // Búsqueda cliente (tu backend no tiene ?q para productos)
  const filteredProductos = productos.filter((p) => {
    const byNombre = p?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const catNombre = typeof p?.categoria === "object" ? (p.categoria?.nombre || "") : "";
    const byCategoria = catNombre.toLowerCase().includes(searchTerm.toLowerCase());
    return byNombre || byCategoria;
  });

  const handleEdit = (producto) => {
    setProductoEdit(producto);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/productos/${id}`, { method: "DELETE" });
      setProductos(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  const handleSave = async (payload) => {
    try {
      if (productoEdit) {
        const resp = await apiFetch(`/productos/${productoEdit._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
        if (resp.ok) await fetchProductos();
      } else {
        const resp = await apiFetch("/productos", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
        if (resp.ok) await fetchProductos();
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
        <h2 className="text-3xl font-semibold text-gray-700">Gestión de Productos</h2>
        <div className="space-x-3">
          <Button
            label="Nuevo Producto"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => { setProductoEdit(null); setModalVisible(true); }}
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

      {/* Búsqueda local */}
      <div className="mb-4">
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText
            type="text"
            placeholder="Buscar por nombre o categoría"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </span>
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
        categoriasProd={categoriasProd}
        materiales={materiales}
      />
    </div>
  );
};

export default ProductoPage;
