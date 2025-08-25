import React, { useState, useEffect } from "react";
import InventarioList from "./InventarioList";
import InventarioForm from "./InventarioForm";
import { apiFetch } from "../../../api/http"; 
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const InventarioPage = () => {
  const [inventarios, setInventarios] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [inventarioEdit, setInventarioEdit] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(""); 

  // Obtener lista
  useEffect(() => {
    const fetchInventarios = async () => {
      try {
        const response = await apiFetch("/inventario");
        const data = await response.json();
        setInventarios(data);
      } catch (error) {
        console.error("Error al obtener inventarios", error);
      }
    };
    fetchInventarios();
  }, []);

  // Función de búsqueda
  const filteredInventarios = inventarios.filter(
    (inventario) =>
      inventario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventario.codigo?.includes(searchTerm)
  );

  const handleEdit = (inventario) => {
    setInventarioEdit(inventario); // Este es el punto donde establecemos el producto a editar
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/inventario/${id}`, { method: "DELETE" });
      setInventarios((prevInventarios) =>
        prevInventarios.filter((inventario) => inventario._id !== id)
      );
    } catch (error) {
      console.error("Error al eliminar insumo", error);
    }
  };

  const handleSave = async (inventario) => {
    try {
      if (inventarioEdit) {
        // Editar producto
        const response = await apiFetch(`/inventario/${inventarioEdit._id}`, {
          method: "PUT",
          body: JSON.stringify(inventario),
          headers: { "Content-Type": "application/json" }, // Asegúrate de que el encabezado esté configurado correctamente
        });
        const updatedInventario = await response.json();
        setInventarios((prev) =>
          prev.map((i) =>
            i._id === updatedInventario._id ? updatedInventario : i
          )
        );
      } else {
        // Crear producto
        const newInventario = {
          nombre: inventario.nombre || "",
          descripcion: inventario.descripcion || "",
          categoria: inventario.categoria || "",
          cantidadDisponible: inventario.cantidadDisponible || 0,
          unidadDeMedida: inventario.unidadDeMedida || "",
          precioUnitario: inventario.precioUnitario || 0,
          fechaIngreso: inventario.fechaIngreso || new Date(),
        };

        const response = await apiFetch("/inventario", {
          method: "POST",
          body: JSON.stringify(newInventario),
          headers: { "Content-Type": "application/json" }, // Asegúrate de que el encabezado esté configurado correctamente
        });

        if (!response.ok) {
          throw new Error("Error al crear el insumo");
        }

        const createdInventario = await response.json();
        setInventarios((prev) => [...prev, createdInventario]);
      }
      setModalVisible(false);
      setInventarioEdit(null); // Limpiar estado de edición después de guardar
    } catch (error) {
      console.error("Error al guardar el insumo", error);
    }
  };

  const handleModalHide = () => {
    setModalVisible(false);
    setInventarioEdit(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">
          Lista de Insumos
        </h2>
        <Button
          label="Nuevo Insumo"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => setModalVisible(true)}
        />
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <InputText
          type="text"
          placeholder="Buscar por nombre o código"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <InventarioList
        inventarios={filteredInventarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InventarioForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        productoEdit={inventarioEdit} // Aseguramos que el inventario a editar se pasa correctamente al formulario
      />
    </div>
  );
};

export default InventarioPage;
