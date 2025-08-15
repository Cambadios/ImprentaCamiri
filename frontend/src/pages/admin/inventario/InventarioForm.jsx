import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown'; // Importar Dropdown para el ComboBox

const InventarioForm = ({ visible, onHide, onSave, productoEdit }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cantidadDisponible, setCantidadDisponible] = useState(0);
  const [unidadDeMedida, setUnidadDeMedida] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [fechaIngreso, setFechaIngreso] = useState(null);
  const [errors, setErrors] = useState({});

  // Opciones para los ComboBox
  const categorias = [
    { label: 'Papelería', value: 'Papeleria' },
    { label: 'Tintas', value: 'Tintas' },
    { label: 'Cortes', value: 'Cortes' },
    { label: 'Otros', value: 'Otros' },
  ];

  const unidadesDeMedida = [
    { label: 'Kilogramo', value: 'Kilogramos' },
    { label: 'Litro', value: 'Litros' },
    { label: 'Unidad', value: 'Unidad' },
    { label: 'Caja', value: 'Caja' },
    { label: 'Rollo', value: 'Rollo' },
  ];

  useEffect(() => {
    if (productoEdit) {
      setNombre(productoEdit.nombre);
      setDescripcion(productoEdit.descripcion);
      setCategoria(productoEdit.categoria);
      setCantidadDisponible(productoEdit.cantidadDisponible);
      setUnidadDeMedida(productoEdit.unidadDeMedida);
      setPrecioUnitario(productoEdit.precioUnitario);
      setFechaIngreso(new Date(productoEdit.fechaIngreso));
    } else {
      setNombre('');
      setDescripcion('');
      setCategoria('');
      setCantidadDisponible(0);
      setUnidadDeMedida('');
      setPrecioUnitario(0);
      setFechaIngreso(null);
    }
  }, [productoEdit]);

  const handleSubmit = () => {
    const newErrors = {};
    if (!nombre) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!descripcion) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }
    if (!categoria) {
      newErrors.categoria = 'La categoría es obligatoria';
    }
    if (!unidadDeMedida) {
      newErrors.unidadDeMedida = 'La unidad de medida es obligatoria';
    }
    if (cantidadDisponible <= 0) {
      newErrors.cantidadDisponible = 'La cantidad disponible debe ser mayor que 0';
    }
    if (precioUnitario <= 0) {
      newErrors.precioUnitario = 'El precio unitario debe ser mayor que 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const producto = { nombre, descripcion, categoria, cantidadDisponible, unidadDeMedida, precioUnitario, fechaIngreso };
    onSave(producto);
    setErrors({}); // Limpiar los errores después de guardar
  };

  return (
    <Dialog 
      header={productoEdit ? "Editar Producto" : "Nuevo Producto"} 
      visible={visible} 
      style={{ width: '450px' }} 
      onHide={() => { onHide(); setErrors({}); }} // Limpiar los errores cuando se cierra el modal
    >
      <div className="p-fluid space-y-4">
        <div className="p-field">
          <label htmlFor="nombre" className="block text-gray-700 font-semibold">Nombre</label>
          <InputText 
            id="nombre" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            className={`w-full p-inputtext-sm ${errors.nombre ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`} 
          />
          {errors.nombre && <small className="p-error text-red-600">{errors.nombre}</small>}
        </div>
        
        <div className="p-field">
          <label htmlFor="descripcion" className="block text-gray-700 font-semibold">Descripción</label>
          <InputText 
            id="descripcion" 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)} 
            className={`w-full p-inputtext-sm ${errors.descripcion ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`} 
          />
          {errors.descripcion && <small className="p-error text-red-600">{errors.descripcion}</small>}
        </div>

        {/* ComboBox para Categoría */}
        <div className="p-field">
          <label htmlFor="categoria" className="block text-gray-700 font-semibold">Categoría</label>
          <Dropdown 
            id="categoria" 
            value={categoria} 
            options={categorias} 
            onChange={(e) => setCategoria(e.value)} 
            placeholder="Seleccionar categoría" 
            className={`w-full ${errors.categoria ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.categoria && <small className="p-error text-red-600">{errors.categoria}</small>}
        </div>
        
        {/* ComboBox para Unidad de Medida */}
        <div className="p-field">
          <label htmlFor="unidadDeMedida" className="block text-gray-700 font-semibold">Unidad de Medida</label>
          <Dropdown 
            id="unidadDeMedida" 
            value={unidadDeMedida} 
            options={unidadesDeMedida} 
            onChange={(e) => setUnidadDeMedida(e.value)} 
            placeholder="Seleccionar unidad" 
            className={`w-full ${errors.unidadDeMedida ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.unidadDeMedida && <small className="p-error text-red-600">{errors.unidadDeMedida}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="cantidadDisponible" className="block text-gray-700 font-semibold">Cantidad Disponible</label>
          <InputNumber 
            id="cantidadDisponible" 
            value={cantidadDisponible} 
            onValueChange={(e) => setCantidadDisponible(e.value)} 
            className={`w-full p-inputtext-sm ${errors.cantidadDisponible ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.cantidadDisponible && <small className="p-error text-red-600">{errors.cantidadDisponible}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="precioUnitario" className="block text-gray-700 font-semibold">Precio Unitario</label>
          <InputNumber 
            id="precioUnitario" 
            value={precioUnitario} 
            onValueChange={(e) => setPrecioUnitario(e.value)} 
            className={`w-full p-inputtext-sm ${errors.precioUnitario ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.precioUnitario && <small className="p-error text-red-600">{errors.precioUnitario}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="fechaIngreso" className="block text-gray-700 font-semibold">Fecha de Ingreso</label>
          <Calendar 
            id="fechaIngreso" 
            value={fechaIngreso} 
            onChange={(e) => setFechaIngreso(e.value)} 
            className={`w-full ${errors.fechaIngreso ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
        </div>

        <div className="flex justify-between space-x-2">
          <Button 
            label="Cancelar" 
            onClick={() => { onHide(); setErrors({}); }} 
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

export default InventarioForm;
