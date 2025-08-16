import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";

const ProductoForm = ({
  visible,
  onHide,
  onSave,
  productoEdit,
  materiales,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (productoEdit) {
      setNombre(productoEdit.nombre);
      setDescripcion(productoEdit.descripcion);
      setPrecioUnitario(productoEdit.precioUnitario);
      
      // Verificar si materiales están bien formateados y asignarlos
      if (productoEdit.materiales && productoEdit.materiales.length > 0) {
        const materialesFormat = productoEdit.materiales.map((mat) => ({
          _id: mat.material._id,
          nombre: mat.material.nombre,
          unidadMedida: mat.material.unidadMedida || "unidad",
          cantidadPorUnidad: mat.cantidadPorUnidad || 1,
        }));
        setMaterialesSeleccionados(materialesFormat);
      } else {
        setMaterialesSeleccionados([]);
      }
    } else {
      // Limpiar todo cuando es nuevo producto
      setNombre("");
      setDescripcion("");
      setPrecioUnitario(0);
      setMaterialesSeleccionados([]);
    }
  }, [productoEdit]);

  const handleSubmit = () => {
    const newErrors = {};

    if (!nombre) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    if (!descripcion) {
      newErrors.descripcion = "La descripción es obligatoria";
    }
    if (!precioUnitario || precioUnitario <= 0) {
      newErrors.precioUnitario = "El precio debe ser mayor a 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Formatear los materiales antes de enviarlos
    const materialesFormatted = materialesSeleccionados.map((material) => ({
      material: material._id,
      cantidadPorUnidad: material.cantidadPorUnidad || 1,
    }));

    const producto = {
      nombre,
      descripcion,
      precioUnitario,
      materiales: materialesFormatted,
    };

    onSave(producto);
    setErrors({});
  };

  const handleMaterialChange = (e) => {
    // e.value contiene los materiales seleccionados actualmente
    const selectedMaterials = e.value;
    
    // Crear un mapa de los materiales previamente seleccionados para mantener sus cantidades
    const previousMaterialsMap = {};
    materialesSeleccionados.forEach(mat => {
      previousMaterialsMap[mat._id] = mat.cantidadPorUnidad;
    });
    
    // Mapear los materiales seleccionados manteniendo las cantidades previas o asignando 1 por defecto
    const updatedMaterials = selectedMaterials.map((material) => ({
      ...material,
      cantidadPorUnidad: previousMaterialsMap[material._id] || 1
    }));
    
    setMaterialesSeleccionados(updatedMaterials);
  };

  // Función para actualizar la cantidad de un material específico
  const handleMaterialQuantityChange = (value, materialId) => {
    const updatedMaterials = materialesSeleccionados.map((material) => {
      if (material._id === materialId) {
        return { ...material, cantidadPorUnidad: value || 1 };
      }
      return material;
    });
    setMaterialesSeleccionados(updatedMaterials);
  };

  // Template personalizado para mostrar los materiales seleccionados
  const selectedMaterialsTemplate = (option) => {
    if (option) {
      const selectedMaterial = materialesSeleccionados.find(m => m._id === option._id);
      return (
        <div className="flex items-center justify-between w-full">
          <span>{option.nombre}</span>
          {selectedMaterial && (
            <div className="flex items-center gap-2">
              <InputNumber
                value={selectedMaterial.cantidadPorUnidad}
                onValueChange={(e) => handleMaterialQuantityChange(e.value, option._id)}
                min={1}
                showButtons
                buttonLayout="horizontal"
                className="p-inputnumber-sm"
                style={{ width: '120px' }}
                onClick={(e) => e.stopPropagation()} // Evitar que se deseleccione al hacer click
              />
              <span className="text-sm">{option.unidadMedida || "unidad"}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog
      header={productoEdit ? "Editar Producto" : "Nuevo Producto"}
      visible={visible}
      onHide={() => {
        onHide();
        // Limpiar el formulario al cerrar
        setNombre("");
        setDescripcion("");
        setPrecioUnitario(0);
        setMaterialesSeleccionados([]);
        setErrors({});
      }}
      style={{ width: "550px" }}
    >
      <div className="p-fluid space-y-4">
        <div className="p-field">
          <label htmlFor="nombre" className="block text-gray-700 mb-2">
            Nombre
          </label>
          <InputText
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={`w-full p-inputtext-sm ${
              errors.nombre ? "p-invalid" : ""
            } border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.nombre && (
            <small className="p-error text-red-600">{errors.nombre}</small>
          )}
        </div>

        <div className="p-field">
          <label htmlFor="descripcion" className="block text-gray-700 mb-2">
            Descripción
          </label>
          <InputText
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={`w-full p-inputtext-sm ${
              errors.descripcion ? "p-invalid" : ""
            } border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.descripcion && (
            <small className="p-error text-red-600">{errors.descripcion}</small>
          )}
        </div>

        <div className="p-field">
          <label htmlFor="precioUnitario" className="block text-gray-700 mb-2">
            Precio Unitario
          </label>
          <InputNumber
            id="precioUnitario"
            value={precioUnitario}
            onValueChange={(e) => setPrecioUnitario(e.value)}
            mode="currency"
            currency="BOB"
            locale="es-BO"
            className={`w-full p-inputtext-sm ${
              errors.precioUnitario ? "p-invalid" : ""
            } border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.precioUnitario && (
            <small className="p-error text-red-600">
              {errors.precioUnitario}
            </small>
          )}
        </div>

        <div className="p-field">
          <label htmlFor="materiales" className="block text-gray-700 mb-2">
            Materiales
          </label>
          <MultiSelect
            id="materiales"
            value={materialesSeleccionados}
            options={materiales}
            onChange={handleMaterialChange}
            optionLabel="nombre"
            placeholder="Seleccione los materiales"
            display="chip"
            className={`${
              errors.materiales ? "p-invalid" : ""
            } border-2 border-gray-300 rounded-md`}
            panelStyle={{ maxHeight: '250px' }}
            itemTemplate={selectedMaterialsTemplate}
            showClear
            filter
            filterPlaceholder="Buscar material..."
          />
          {errors.materiales && (
            <small className="p-error text-red-600">{errors.materiales}</small>
          )}
        </div>

        {/* Mostrar lista de materiales seleccionados con sus cantidades */}
        {materialesSeleccionados.length > 0 && (
          <div className="p-field">
            <label className="block text-gray-700 mb-2">
              Cantidades por Material:
            </label>
            <div className="space-y-2 max-h-200 overflow-y-auto p-3 bg-gray-50 rounded-md">
              {materialesSeleccionados.map((material) => (
                <div
                  key={material._id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <span className="font-medium">{material.nombre}</span>
                  <div className="flex items-center gap-2">
                    <InputNumber
                      value={material.cantidadPorUnidad}
                      onValueChange={(e) =>
                        handleMaterialQuantityChange(e.value, material._id)
                      }
                      min={0.1}
                      step={0.1}
                      showButtons
                      buttonLayout="horizontal"
                      className="p-inputnumber-sm"
                      style={{ width: '150px' }}
                    />
                    <span className="text-sm text-gray-600">
                      {material.unidadMedida || "unidad"}
                    </span>
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
              // Limpiar el formulario
              setNombre("");
              setDescripcion("");
              setPrecioUnitario(0);
              setMaterialesSeleccionados([]);
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