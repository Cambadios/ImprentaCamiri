import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";

const ProductoForm = ({
  visible,
  onHide,
  onSave,
  productoEdit,
  categoriasProd, // [{label, value, raw}]
  materiales,     // [{ _id, nombre, unidadDeMedida }]
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState(0);

  const [categoriaId, setCategoriaId] = useState(""); // ← requerido por backend
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]); // [{_id, nombre, unidadDeMedida, cantidadPorUnidad}]
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (productoEdit) {
      setNombre(productoEdit.nombre || "");
      setDescripcion(productoEdit.descripcion || "");
      setPrecioUnitario(productoEdit.precioUnitario || 0);

      // categoría puede venir populada
      const cat = productoEdit.categoria;
      setCategoriaId(typeof cat === "object" && cat?._id ? cat._id : (cat || ""));

      // materiales vienen poblados (getProductos los populate)
      const mats = Array.isArray(productoEdit.materiales) ? productoEdit.materiales : [];
      const sel = mats
        .filter(m => m?.material)
        .map(m => ({
          _id: m.material._id,
          nombre: m.material.nombre,
          unidadDeMedida: m.material.unidadDeMedida || "unidad",
          cantidadPorUnidad: m.cantidadPorUnidad || 1,
        }));
      setMaterialesSeleccionados(sel);
    } else {
      setNombre("");
      setDescripcion("");
      setPrecioUnitario(0);
      setCategoriaId("");
      setMaterialesSeleccionados([]);
    }
  }, [productoEdit]);

  const validate = () => {
    const e = {};
    if (!nombre) e.nombre = "El nombre es obligatorio";
    if (!descripcion) e.descripcion = "La descripción es obligatoria";
    if (!precioUnitario || Number(precioUnitario) <= 0) e.precioUnitario = "El precio debe ser mayor a 0";
    if (!categoriaId) e.categoriaId = "La categoría es obligatoria";
    if (materialesSeleccionados.length === 0) e.materiales = "Seleccione al menos un material";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const materialesFormatted = materialesSeleccionados.map((m) => ({
      material: m._id,
      cantidadPorUnidad: m.cantidadPorUnidad || 1,
    }));

    const payload = {
      nombre,
      descripcion,
      precioUnitario,
      materiales: materialesFormatted,
      categoriaId, // ← clave que espera tu backend
    };

    onSave(payload);
    setErrors({});
  };

  const handleMaterialChange = (e) => {
    const selected = e.value; // objetos completos de materiales (desde props.materiales)
    // conservar cantidades previas
    const prevMap = {};
    materialesSeleccionados.forEach(m => { prevMap[m._id] = m.cantidadPorUnidad; });

    const updated = selected.map((m) => ({
      ...m,
      cantidadPorUnidad: prevMap[m._id] || 1,
    }));
    setMaterialesSeleccionados(updated);
  };

  const handleMaterialQuantityChange = (value, materialId) => {
    const v = value && Number(value) > 0 ? Number(value) : 1;
    setMaterialesSeleccionados(prev =>
      prev.map(m => (m._id === materialId ? { ...m, cantidadPorUnidad: v } : m))
    );
  };

  const selectedMaterialsTemplate = (option) => {
    if (!option) return null;
    const sel = materialesSeleccionados.find(m => m._id === option._id);
    return (
      <div className="flex items-center justify-between w-full">
        <span>{option.nombre}</span>
        {sel && (
          <div className="flex items-center gap-2">
            <InputNumber
              value={sel.cantidadPorUnidad}
              onValueChange={(e) => handleMaterialQuantityChange(e.value, option._id)}
              min={1}
              showButtons
              buttonLayout="horizontal"
              className="p-inputnumber-sm"
              style={{ width: '120px' }}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm">{option.unidadDeMedida || "unidad"}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={productoEdit ? "Editar Producto" : "Nuevo Producto"}
      visible={visible}
      onHide={() => {
        onHide();
        setErrors({});
      }}
      style={{ width: "600px" }}
    >
      <div className="p-fluid space-y-4">
        {/* Categoría (tipo producto) */}
        <div className="p-field">
          <label htmlFor="categoriaId" className="block text-gray-700 mb-2">Categoría</label>
          <Dropdown
            id="categoriaId"
            value={categoriaId}
            options={categoriasProd}
            onChange={(e) => setCategoriaId(e.value)}
            placeholder="Selecciona una categoría (producto)"
            className={`w-full ${errors.categoriaId ? "p-invalid" : ""} border-2 border-gray-300 rounded-md`}
            filter
          />
          {errors.categoriaId && <small className="p-error text-red-600">{errors.categoriaId}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="nombre" className="block text-gray-700 mb-2">Nombre</label>
          <InputText
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={`w-full p-inputtext-sm ${errors.nombre ? "p-invalid" : ""} border-2 border-gray-300 rounded-md`}
          />
          {errors.nombre && <small className="p-error text-red-600">{errors.nombre}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="descripcion" className="block text-gray-700 mb-2">Descripción</label>
          <InputText
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={`w-full p-inputtext-sm ${errors.descripcion ? "p-invalid" : ""} border-2 border-gray-300 rounded-md`}
          />
          {errors.descripcion && <small className="p-error text-red-600">{errors.descripcion}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="precioUnitario" className="block text-gray-700 mb-2">Precio Unitario</label>
          <InputNumber
            id="precioUnitario"
            value={precioUnitario}
            onValueChange={(e) => setPrecioUnitario(e.value)}
            mode="currency"
            currency="BOB"
            locale="es-BO"
            className={`w-full p-inputtext-sm ${errors.precioUnitario ? "p-invalid" : ""} border-2 border-gray-300 rounded-md`}
          />
          {errors.precioUnitario && <small className="p-error text-red-600">{errors.precioUnitario}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="materiales" className="block text-gray-700 mb-2">Materiales (insumos)</label>
          <MultiSelect
            id="materiales"
            value={materialesSeleccionados}
            options={materiales}
            onChange={handleMaterialChange}
            optionLabel="nombre"
            placeholder="Seleccione materiales"
            display="chip"
            className={`${errors.materiales ? "p-invalid" : ""} border-2 border-gray-300 rounded-md`}
            panelStyle={{ maxHeight: '280px' }}
            itemTemplate={selectedMaterialsTemplate}
            showClear
            filter
            filterPlaceholder="Buscar material..."
          />
          {errors.materiales && <small className="p-error text-red-600">{errors.materiales}</small>}
        </div>

        {/* Listado editable de cantidades */}
        {materialesSeleccionados.length > 0 && (
          <div className="p-field">
            <label className="block text-gray-700 mb-2">Cantidades por material</label>
            <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-md">
              {materialesSeleccionados.map((m) => (
                <div key={m._id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                  <span className="font-medium">{m.nombre}</span>
                  <div className="flex items-center gap-2">
                    <InputNumber
                      value={m.cantidadPorUnidad}
                      onValueChange={(e) => handleMaterialQuantityChange(e.value, m._id)}
                      min={0.1}
                      step={0.1}
                      showButtons
                      buttonLayout="horizontal"
                      className="p-inputnumber-sm"
                      style={{ width: '150px' }}
                    />
                    <span className="text-sm text-gray-600">{m.unidadDeMedida || "unidad"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between space-x-2 pt-4">
          <Button
            label="Cancelar"
            onClick={() => {
              onHide();
              setErrors({});
            }}
            className="p-button-outlined text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
          />
          <Button
            label="Guardar"
            onClick={handleSubmit}
            className="p-button-success text-white bg-yellow-500 hover:bg-yellow-400"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ProductoForm;
