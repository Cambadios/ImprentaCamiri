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
  const [categoria, setCategoria] = useState("");
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);

  useEffect(() => {
    if (productoEdit) {
      setNombre(productoEdit.nombre);
      setDescripcion(productoEdit.descripcion);
      setPrecioUnitario(productoEdit.precioUnitario);
      setCategoria(productoEdit.categoria);
      setMaterialesSeleccionados(productoEdit.materiales);
    } else {
      setNombre("");
      setDescripcion("");
      setPrecioUnitario(0);
      setCategoria("");
      setMaterialesSeleccionados([]);
    }
  }, [productoEdit]);

  const handleSubmit = () => {
    const producto = {
      nombre,
      descripcion,
      precioUnitario,
      categoria,
      materiales: materialesSeleccionados, // Solo asociamos los materiales, no los descontamos
    };
    onSave(producto); // Aquí solo estamos enviando el producto sin modificar inventario
  };

  return (
    <Dialog
      header={productoEdit ? "Editar Producto" : "Nuevo Producto"}
      visible={visible}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="nombre">Nombre</label>
          <InputText
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="p-field">
          <label htmlFor="descripcion">Descripción</label>
          <InputText
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="p-field">
          <label htmlFor="precioUnitario">Precio Unitario</label>
          <InputNumber
            id="precioUnitario"
            value={precioUnitario}
            onValueChange={(e) => setPrecioUnitario(e.value)}
          />
        </div>
        <div className="p-field">
          <label htmlFor="categoria">Categoría</label>
          <InputText
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>
        <div className="p-field">
          <label htmlFor="materiales">Materiales</label>
          <MultiSelect
            id="materiales"
            value={materialesSeleccionados}
            options={materiales}
            onChange={(e) => setMaterialesSeleccionados(e.value)}
            optionLabel="nombre"
            placeholder="Seleccione los materiales"
            itemTemplate={(option) => (
              <div className="p-d-flex p-jc-between">
                <span>{option.nombre}</span>
                <InputNumber
                  value={option.cantidadPorUnidad}
                  onValueChange={(e) => option.cantidadPorUnidad = e.value}
                  showButtons
                  min={1}
                />
              </div>
            )}
          />
        </div>
        <div className="p-d-flex p-jc-between">
          <Button
            label="Guardar"
            onClick={handleSubmit}
            className="p-button-success"
          />
          <Button
            label="Cancelar"
            onClick={onHide}
            className="p-button-secondary"
          />
        </div>
      </div>
    </Dialog>
  );
};


export default ProductoForm;
