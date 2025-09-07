// src/components/CategoriaForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const onlyLetters = (v) => (v ? String(v).replace(/[^A-Za-z]/g, "") : "");

const CategoriaForm = ({ visible, onHide, onSave, categoriaEdit }) => {
  const [categoria, setCategoria] = useState({
    nombre: "",
    tipo: "",
    prefijo: "",
    descripcion: "",
  });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    if (categoriaEdit) {
      setCategoria({
        nombre: categoriaEdit.nombre || "",
        tipo: categoriaEdit.tipo || "",
        prefijo: categoriaEdit.prefijo || "",
        descripcion: categoriaEdit.descripcion || "",
      });
    } else {
      setCategoria({ nombre: "", tipo: "", prefijo: "", descripcion: "" });
    }
  }, [categoriaEdit, visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "prefijo") {
      const letters = onlyLetters(value).toUpperCase().slice(0, 6);
      setCategoria((prev) => ({ ...prev, prefijo: letters }));
    } else {
      setCategoria((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!categoria.nombre?.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!categoria.tipo) newErrors.tipo = "El tipo es obligatorio";
    const prefijo = (categoria.prefijo || "").trim();
    if (!/^[A-Z]{3,6}$/.test(prefijo)) {
      newErrors.prefijo = "Prefijo inválido: use 3 a 6 letras (A–Z)";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({
        nombre: categoria.nombre.trim(),
        tipo: categoria.tipo,
        prefijo,
        descripcion: (categoria.descripcion || "").trim() || undefined,
      });

      // limpiar y cerrar sólo si guardó bien
      setCategoria({ nombre: "", tipo: "", prefijo: "", descripcion: "" });
      setErrors({});
      onHide();
    } catch (err) {
      // Mostrar toast de error
      const detail =
        err?.message ||
        err?.responseMessage ||
        "No se pudo guardar la categoría. Inténtalo nuevamente.";
      toast.current?.show({
        severity: "error",
        summary: "Error al guardar",
        detail,
        life: 5000,
      });
    }
  };

  const handleClose = () => {
    onHide();
    setCategoria({ nombre: "", tipo: "", prefijo: "", descripcion: "" });
    setErrors({});
  };

  return (
    <Dialog
      header={categoriaEdit ? "Editar Categoría" : "Nueva Categoría"}
      visible={visible}
      style={{ width: 480 }}
      onHide={handleClose}
      modal
    >
      <Toast ref={toast} />

      <div className="p-fluid space-y-4">
        <div className="p-field">
          <label htmlFor="nombre" className="block text-gray-700">Nombre</label>
          <InputText
            id="nombre"
            name="nombre"
            placeholder="Ej: Textiles"
            value={categoria.nombre}
            onChange={handleChange}
            className={`w-full p-inputtext-sm ${errors.nombre ? "p-invalid" : ""} border-2 border-gray-300 rounded-md`}
          />
          {errors.nombre && <small className="p-error text-red-600">{errors.nombre}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="tipo" className="block text-gray-700">Tipo</label>
          <Dropdown
            id="tipo"
            name="tipo"
            value={categoria.tipo}
            onChange={(e) => handleChange({ target: { name: "tipo", value: e.value } })}
            options={[
              { label: "Insumo", value: "insumo" },
              { label: "Producto", value: "producto" },
            ]}
            placeholder="Selecciona el tipo"
            className={`w-full ${errors.tipo ? "p-invalid" : ""}`}
          />
          {errors.tipo && <small className="p-error text-red-600">{errors.tipo}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="prefijo" className="block text-gray-700">Prefijo (3–6 letras)</label>
          <InputText
            id="prefijo"
            name="prefijo"
            placeholder="Ej: TELA"
            value={categoria.prefijo}
            onChange={handleChange}
            maxLength={6}
            className={`w-full p-inputtext-sm ${errors.prefijo ? "p-invalid" : ""} border-2 border-gray-300 rounded-md font-mono`}
          />
          {errors.prefijo && <small className="p-error text-red-600">{errors.prefijo}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="descripcion" className="block text-gray-700">Descripción (opcional)</label>
          <InputText
            id="descripcion"
            name="descripcion"
            placeholder="Descripción breve"
            value={categoria.descripcion}
            onChange={handleChange}
            className="w-full p-inputtext-sm border-2 border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button label="Cancelar" onClick={handleClose} className="p-button-outlined p-button-secondary" />
          <Button label="Guardar" onClick={handleSubmit} className="p-button-success" />
        </div>
      </div>
    </Dialog>
  );
};

export default CategoriaForm;
