import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';

const MAX_WORDS = 100;

const InventarioForm = ({ visible, onHide, onSave, productoEdit }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cantidadDisponible, setCantidadDisponible] = useState(0);
  const [unidadDeMedida, setUnidadDeMedida] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [fechaIngreso, setFechaIngreso] = useState(null);
  const [errors, setErrors] = useState({});
  const [descWords, setDescWords] = useState(0);

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

  // Helper para contar palabras
  const countWords = (text) =>
    text.trim().length === 0
      ? 0
      : text
          .trim()
          .split(/\s+/) // separa por espacios múltiples
          .filter(Boolean).length;

  useEffect(() => {
    if (productoEdit) {
      setNombre(productoEdit.nombre ?? '');
      setDescripcion(productoEdit.descripcion ?? '');
      setCategoria(productoEdit.categoria ?? '');
      setCantidadDisponible(productoEdit.cantidadDisponible ?? 0);
      setUnidadDeMedida(productoEdit.unidadDeMedida ?? '');
      setPrecioUnitario(productoEdit.precioUnitario ?? 0);
      setFechaIngreso(productoEdit.fechaIngreso ? new Date(productoEdit.fechaIngreso) : new Date());
      setDescWords(countWords(productoEdit.descripcion ?? ''));
    } else {
      setNombre('');
      setDescripcion('');
      setCategoria('');
      setCantidadDisponible(0);
      setUnidadDeMedida('');
      setPrecioUnitario(0);
      // Fecha actual por defecto
      setFechaIngreso(new Date());
      setDescWords(0);
    }
  }, [productoEdit]);

  const onDescripcionChange = (value) => {
    const words = value.trim() ? value.trim().split(/\s+/) : [];
    if (words.length > MAX_WORDS) {
      // Limitar a 100 palabras
      const limited = words.slice(0, MAX_WORDS).join(' ');
      setDescripcion(limited);
      setDescWords(MAX_WORDS);
    } else {
      setDescripcion(value);
      setDescWords(words.length);
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!descripcion) newErrors.descripcion = 'La descripción es obligatoria';
    if (descWords > MAX_WORDS) newErrors.descripcion = `Máximo ${MAX_WORDS} palabras`;
    if (!categoria) newErrors.categoria = 'La categoría es obligatoria';
    if (!unidadDeMedida) newErrors.unidadDeMedida = 'La unidad de medida es obligatoria';
    if (cantidadDisponible <= 0) newErrors.cantidadDisponible = 'La cantidad disponible debe ser mayor que 0';
    if (precioUnitario <= 0) newErrors.precioUnitario = 'El precio unitario debe ser mayor que 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const producto = {
      nombre,
      descripcion,
      categoria,
      cantidadDisponible,
      unidadDeMedida,
      precioUnitario,
      fechaIngreso
    };
    onSave(producto);
    setErrors({});
  };

  return (
    <Dialog
      header={productoEdit ? "Editar Insumo" : "Nuevo Insumo"}
      visible={visible}
      style={{ width: '520px' }}
      onHide={() => { onHide(); setErrors({}); }}
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

        {/* Descripción: Textarea con contador y límite */}
        <div className="p-field">
          <div className="flex items-center justify-between">
            <label htmlFor="descripcion" className="block text-gray-700 font-semibold">Descripción</label>
            <small className={`${descWords > MAX_WORDS ? 'text-red-600' : 'text-gray-500'}`}>
              {descWords}/{MAX_WORDS}
            </small>
          </div>
          <InputTextarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => onDescripcionChange(e.target.value)}
            autoResize
            rows={3}
            placeholder="Describe el insumo (máx. 100 palabras)"
            className={`w-full ${errors.descripcion ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
            style={{ resize: 'vertical' }} // extensible
          />
          {errors.descripcion && <small className="p-error text-red-600">{errors.descripcion}</small>}
        </div>

        {/* Categoría */}
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

        {/* Unidad de medida */}
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
            min={0}
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
            min={0}
            mode="currency"
            currency="BOB"
            locale="es-BO"
            className={`w-full p-inputtext-sm ${errors.precioUnitario ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.precioUnitario && <small className="p-error text-red-600">{errors.precioUnitario}</small>}
        </div>

        {/* Fecha de ingreso: por defecto hoy */}
        <div className="p-field">
          <label htmlFor="fechaIngreso" className="block text-gray-700 font-semibold">Fecha de Ingreso</label>
          <Calendar
            id="fechaIngreso"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.value)}
            showIcon
            touchUI
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
