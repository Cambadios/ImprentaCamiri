// src/components/CategoriasPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import CategoriasList from "./CategoriasList";
import CategoriaForm from "./CategoriasForm";
import { apiFetch } from "../../../api/http";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";         // <-- Nuevo
import { downloadFile } from "../../../api/download";

const safeStr = (v) => (v == null ? "" : String(v));

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toast = useRef(null); // <-- Nuevo

  const showSuccess = (summary, detail) =>
    toast.current?.show({ severity: "success", summary, detail, life: 3500 });
  const showError = (summary, detail) =>
    toast.current?.show({ severity: "error", summary, detail, life: 4500 });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiFetch("/categorias");
        const data = await response.json();
        const arr = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setCategorias(arr);
      } catch (error) {
        console.error("Error al obtener categorías", error);
        setCategorias([]);
        showError("Error", "No se pudo obtener el listado de categorías.");
      }
    };
    fetchCategorias();
  }, []);

  const filteredCategorias = useMemo(() => {
    const term = safeStr(searchTerm).toLowerCase().trim();
    if (!term) return categorias;
    return (categorias ?? []).filter((c) => {
      const nombre = safeStr(c?.nombre).toLowerCase();
      const prefijo = safeStr(c?.prefijo).toLowerCase();
      const tipo = safeStr(c?.tipo).toLowerCase();
      return nombre.includes(term) || prefijo.includes(term) || tipo.includes(term);
    });
  }, [categorias, searchTerm]);

  const handleEdit = (categoria) => {
    setCategoriaEdit(categoria);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const resp = await apiFetch(`/categorias/${id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await (async () => { try { return await resp.json(); } catch { return {}; } })();
        throw new Error(data?.message || "No se pudo eliminar la categoría.");
      }
      setCategorias((prev) => prev.filter((c) => c._id !== id));
      showSuccess("Eliminado", "La categoría fue eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar categoría", error);
      showError("Error al eliminar", error.message || "Inténtalo nuevamente.");
    }
  };

  const handleSave = async (categoria) => {
    try {
      if (categoriaEdit) {
        // Editar
        const response = await apiFetch(`/categorias/${categoriaEdit._id}`, {
          method: "PUT",
          body: JSON.stringify(categoria),
        });

        // Manejo de errores HTTP
        if (!response.ok) {
          // 409 = duplicado (índice único)
          if (response.status === 409) {
            const data = await (async () => { try { return await response.json(); } catch { return {}; } })();
            showError("Duplicado", data?.message || "Ya existe una categoría con el mismo prefijo y nombre.");
            return; // No cerrar el modal
          }
          const data = await (async () => { try { return await response.json(); } catch { return {}; } })();
          throw new Error(data?.message || "No se pudo actualizar la categoría.");
        }

        const updated = await response.json();
        setCategorias((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        showSuccess("Actualizado", "La categoría se actualizó correctamente.");
      } else {
        // Crear
        const response = await apiFetch("/categorias", {
          method: "POST",
          body: JSON.stringify(categoria),
        });

        // Manejo de errores HTTP
        if (!response.ok) {
          if (response.status === 409) {
            const data = await (async () => { try { return await response.json(); } catch { return {}; } })();
            showError("Duplicado", data?.message || "Ya existe una categoría con el mismo prefijo y nombre.");
            return; // No cerrar el modal
          }
          const data = await (async () => { try { return await response.json(); } catch { return {}; } })();
          throw new Error(data?.message || "No se pudo crear la categoría.");
        }

        const created = await response.json();
        setCategorias((prev) => [...prev, created]);
        showSuccess("Creado", "La categoría se creó correctamente.");
      }

      // cerrar modal si todo ok
      setCategoriaEdit(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error al guardar categoría", error);
      showError("Error al guardar", error.message || "Inténtalo nuevamente.");
    }
  };

  const handleModalHide = () => {
    setModalVisible(false);
    setCategoriaEdit(null);
  };

  return (
    <div className="p-4">
      {/* Toast (arriba-derecha) con leve estilizado Tailwind */}
      <Toast ref={toast} position="top-right" className="!drop-shadow-lg !rounded-lg" />

      {/* Header + acciones */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Gestión de Categorías</h2>
        <div className="space-x-4">
          <Button
            label="Nueva Categoría"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setModalVisible(true)}
          />
          <Button
            label="Descargar PDF"
            icon="pi pi-download"
            onClick={() =>
              downloadFile("/api/export/categorias.pdf", "Listado de Categorías.pdf")
            }
          />
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-4">
        <InputText
          type="text"
          placeholder="Buscar por nombre, prefijo o tipo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <CategoriasList categorias={filteredCategorias} onEdit={handleEdit} onDelete={handleDelete} />

      <CategoriaForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        categoriaEdit={categoriaEdit}
      />
    </div>
  );
};

export default CategoriasPage;
